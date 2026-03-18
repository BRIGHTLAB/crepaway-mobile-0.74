import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {
  AuthorizationStatus,
  deleteToken,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import { NavigationContainerRef } from '@react-navigation/native';
import { Alert, AppState, Platform } from 'react-native';
import PushNotification, { Importance } from 'react-native-push-notification';
import { POST } from '../api';
import type { NavParams } from './NavigationHelper';

// Lazy import to avoid circular dependency
const getNavigationHelper = () => require('./NavigationHelper').default;

// Lazy import store to avoid circular dependency
const getStore = () => require('../store/store').default;

interface NotificationOptions {
  data?: Record<string, unknown>;
  enableSound?: boolean;
  channelId?: 'default-channel' | 'silent-channel';
  bigText?: string;
  subText?: string;
}

interface NotificationData {
  screen?: string;
  order_type?: string;
  menu_type?: string;
  id?: number;
  type?: string;
  count?: string;
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

class NotificationService {
  private token: string | null = null;
  private static instance: NotificationService | null = null;
  private isInitialized: boolean = false;
  private navigationRef: NavigationContainerRef<Record<string, unknown>> | null = null;
  private pendingNavigation: NavParams | null = null;
  private appStateSubscription: { remove: () => void } | null = null;

  private constructor() { }

  private log = (...args: unknown[]): void => {
    if (__DEV__) {
      console.log('[NotificationService]', ...args);
    }
  };

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  init = async (navigationRef: NavigationContainerRef<Record<string, unknown>>): Promise<void> => {
    if (this.isInitialized) {
      return;
    }

    this.log('Initializing NotificationService...');
    this.navigationRef = navigationRef;
    getNavigationHelper().getInstance().setNavigationRef(navigationRef);

    // Listen for app state changes to handle navigation when app becomes active
    let previousAppState = AppState.currentState;
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (previousAppState.match(/inactive|background/) && nextAppState === 'active') {
        if (this.pendingNavigation && this.navigationRef?.isReady()) {
          this.processNavigation(this.pendingNavigation);
          this.pendingNavigation = null;
        }
      }
      previousAppState = nextAppState;
    });

    // --- FCM Setup via modular @react-native-firebase/messaging ---
    const messaging = getMessaging();

    // Request permission (required for iOS, no-op on Android)
    const authStatus = await requestPermission(messaging);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      this.log('FCM permission granted, status:', authStatus);
    } else {
      this.log('FCM permission denied');
    }

    // Get the FCM token
    try {
      const fcmToken = await getToken(messaging);
      if (fcmToken) {
        this.token = fcmToken;
        this.log('FCM token:', fcmToken);
        this.sendDeviceTokenToBackend();
      }
    } catch (error) {
      this.log('Error getting FCM token:', error);
    }

    // Listen for token refresh
    onTokenRefresh(messaging, (newToken) => {
      this.token = newToken;
      this.log('FCM token refreshed:', newToken);
      this.sendDeviceTokenToBackend();
    });

    // Handle foreground messages via Firebase
    // NOTE: On iOS, the native AppDelegate willPresentNotification already displays
    // the FCM notification as a banner, so we must NOT create a local notification
    // on iOS (it would cause duplicates). On Android, FCM does NOT auto-display
    // notifications in the foreground, so we must create a local notification.
    onMessage(messaging, async (remoteMessage) => {
      this.log('=== FCM FOREGROUND MESSAGE ===');
      this.log('Message:', JSON.stringify(remoteMessage, null, 2));

      // Android does not auto-display FCM notifications in foreground — show a local one
      if (Platform.OS === 'android') {
        const title = remoteMessage.notification?.title || remoteMessage.data?.title as string || 'Notification';
        const body = remoteMessage.notification?.body || remoteMessage.data?.body as string || remoteMessage.data?.message as string || '';

        if (body) {
          this.localNotification(
            String(title),
            String(body),
            {
              data: (remoteMessage.data as Record<string, unknown>) || {},
              enableSound: true,
              channelId: 'default-channel',
            }
          );
        }
      }

      // Handle notification data for navigation
      const notificationData = (remoteMessage.data || {}) as NotificationData;
      if (notificationData.screen) {
        this.pendingNavigation = {
          screen: notificationData.screen,
          order_type: notificationData.order_type || 'delivery',
          menu_type: notificationData.menu_type || notificationData.order_type || 'delivery',
          id: notificationData.id,
          ...notificationData.params,
        };
      }

      if (notificationData.type) {
        this.handleNotificationAction(notificationData.type, notificationData);
      }
    });

    // Handle notification opened from background/quit state
    onNotificationOpenedApp(messaging, (remoteMessage) => {
      this.log('Notification opened app from background:', remoteMessage);
      const notificationData = (remoteMessage.data || {}) as NotificationData;

      if (notificationData.screen) {
        const params: NavParams = {
          screen: notificationData.screen,
          order_type: notificationData.order_type || 'delivery',
          menu_type: notificationData.menu_type || notificationData.order_type || 'delivery',
          id: notificationData.id,
          ...notificationData.params,
        };

        if (this.navigationRef?.isReady()) {
          this.processNavigation(params);
        } else {
          this.pendingNavigation = params;
        }
      }

      this.setBadgeCount(0);
    });

    // Check if app was opened from a quit state notification
    const initialNotification = await getInitialNotification(messaging);
    if (initialNotification) {
      this.log('App opened from quit state via notification:', initialNotification);
      const notificationData = (initialNotification.data || {}) as NotificationData;

      if (notificationData.screen) {
        this.pendingNavigation = {
          screen: notificationData.screen,
          order_type: notificationData.order_type || 'delivery',
          menu_type: notificationData.menu_type || notificationData.order_type || 'delivery',
          id: notificationData.id,
          ...notificationData.params,
        };
      }
    }

    // --- Legacy PushNotification setup (for local notifications & Android channels) ---

    PushNotification.configure({
      // We no longer rely on onRegister for the token — FCM handles that above
      onRegister: (_tokenData: { token: string }): void => {
        this.log('Legacy PushNotification onRegister (ignored, using FCM token)');
      },

      onNotification: (notification: any): void => {
        try {
          // Clear badge when user taps notification
          if (notification.userInteraction) {
            this.log('User interacted with notification - clearing badge');
            this.setBadgeCount(0);
          }
        } catch (e) {
          this.log('Error handling legacy notification:', e);
        }

        // Required on iOS
        if (Platform.OS === 'ios' && notification.finish) {
          notification.finish(String(PushNotificationIOS.FetchResult.NoData));
        }
      },

      onRegistrationError: (err: Error): void => {
        console.error('[NotificationService] Registration error:', err);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: false, // Handled by Firebase getInitialNotification
      requestPermissions: false, // Handled by Firebase requestPermission
    });

    if (Platform.OS === 'android') {
      this.createNotificationChannels();
    }

    this.isInitialized = true;
  };

  private processNavigation(params: NavParams): void {
    if (!this.navigationRef?.isReady()) return;

    if (!this.validateNavigationRequirements(params)) {
      return;
    }

    getNavigationHelper().getInstance().navigate(params);
  }

  private validateNavigationRequirements(params: NavParams): boolean {
    const state = getStore().getState();
    const orderType = params.order_type || state.user.orderType || 'delivery';

    if (orderType === 'delivery') {
      const hasAddress = state.user.addressId !== null && state.user.addressTitle !== null;
      if (!hasAddress) {
        Alert.alert(
          'Address Required',
          'Please select a delivery address to continue.',
          [{ text: 'OK' }]
        );
        this.log('Navigation blocked: No delivery address selected');
        return false;
      }
    }

    if (orderType === 'takeaway') {
      const hasBranch = state.user.branchName !== null;
      if (!hasBranch) {
        Alert.alert(
          'Branch Required',
          'Please select a branch to continue.',
          [{ text: 'OK' }]
        );
        this.log('Navigation blocked: No branch selected');
        return false;
      }
    }

    return true;
  }

  private createNotificationChannels(): void {
    PushNotification.createChannel(
      {
        channelId: 'default-channel',
        channelName: 'Default Channel',
        channelDescription: 'Default notifications with sound',
        soundName: 'default',
        importance: Importance.HIGH,
        vibrate: true,
      },
      () => { },
    );

    PushNotification.createChannel(
      {
        channelId: 'silent-channel',
        channelName: 'Silent Channel',
        channelDescription: 'Notifications without sound',
        soundName: undefined,
        importance: Importance.HIGH,
        vibrate: false,
      },
      () => { },
    );
  }

  private handleNotificationAction = (type: string, data: NotificationData): void => {
    switch (type) {
      case 'refresh_data':
        this.log('Refreshing data');
        break;
      case 'update_badge':
        if (Platform.OS === 'ios') {
          const count = parseInt((data.count as string) || '0') || 0;
          PushNotificationIOS.setApplicationIconBadgeNumber(count);
        }
        break;
    }
  };

  localNotification = (
    title: string,
    message: string,
    options: NotificationOptions = {},
  ): void => {
    try {
      const {
        data = {},
        enableSound = true,
        channelId = enableSound ? 'default-channel' : 'silent-channel',
        bigText,
        subText,
      } = options;

      PushNotification.localNotification({
        channelId,
        title,
        message,
        playSound: enableSound,
        soundName: enableSound ? 'default' : undefined,
        bigText,
        subText,
        userInfo: data,
      });
    } catch (error) {
      this.log('Error showing local notification:', error);
    }
  };

  scheduleNotification = (
    title: string,
    message: string,
    date: Date,
    options: NotificationOptions = {},
  ): void => {
    const {
      data = {},
      enableSound = true,
      channelId = enableSound ? 'default-channel' : 'silent-channel',
      bigText,
      subText,
    } = options;

    PushNotification.localNotificationSchedule({
      channelId,
      title,
      message,
      date,
      playSound: enableSound,
      soundName: enableSound ? 'default' : undefined,
      bigText,
      subText,
      userInfo: data,
    });
  };

  getDeviceToken = (): string | null => {
    return this.token;
  };

  async sendDeviceTokenToBackend() {
    if (!this.token) return null;

    try {
      const response = await POST({
        endpoint: '/users/tokens',
        formData: {
          token: this.token,
          platform_os: Platform.OS,
        },
      });
      return response.status < 400 ? response.data : null;
    } catch (error) {
      this.log('Error sending token to backend:', error);
      return null;
    }
  }

  clearAllNotifications = (): void => {
    PushNotification.cancelAllLocalNotifications();
    if (Platform.OS === 'ios') {
      PushNotificationIOS.removeAllDeliveredNotifications();
    }
  };

  deregister = async (): Promise<void> => {
    try {
      const messaging = getMessaging();
      await deleteToken(messaging);
      this.log('FCM token deleted');
    } catch (error) {
      this.log('Error deleting FCM token:', error);
    }

    if (Platform.OS === 'ios') {
      PushNotificationIOS.abandonPermissions();
    } else {
      PushNotification.abandonPermissions();
      PushNotification.unregister();
    }
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
    this.pendingNavigation = null;
    this.token = null;
    this.isInitialized = false;
    this.clearAllNotifications();
  };

  setBadgeCount = (count: number): void => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(count);
    } else {
      PushNotification.setApplicationIconBadgeNumber(count);
    }
  };
}

export default NotificationService;
