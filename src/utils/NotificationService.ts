import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {NavigationContainerRef} from '@react-navigation/native';
import {Alert, AppState, Platform} from 'react-native';
import PushNotification, {Importance} from 'react-native-push-notification';
import {POST} from '../api';
import store from '../store/store';
import type { NavParams } from './NavigationHelper';

// Lazy import to avoid circular dependency
const getNavigationHelper = () => require('./NavigationHelper').default;

/**
 * IMPORTANT: Foreground Notification Handling on Android
 * 
 * On Android, react-native-push-notification's onNotification callback is ONLY called
 * when the app receives a DATA-ONLY payload (no "notification" field).
 * 
 * When AWS SNS sends a payload with BOTH "notification" and "data":
 * - Background/Killed: System shows notification, onNotification called when user taps
 * - Foreground: System shows notification automatically, onNotification is NOT called
 * 
 * When AWS SNS sends a DATA-ONLY payload (only "data" field):
 * - Background/Killed: System may show notification (if configured), onNotification called
 * - Foreground: onNotification SHOULD be called immediately
 * 
 * AWS SNS FCM Payload Format for Foreground Handling:
 * {
 *   "GCM": "{ \"data\": { \"title\": \"...\", \"body\": \"...\", \"screen\": \"...\", ... } }"
 * }
 * 
 * OR for direct FCM:
 * {
 *   "data": {
 *     "title": "...",
 *     "body": "...",
 *     "screen": "...",
 *     "order_type": "...",
 *     "menu_type": "...",
 *     "id": 277
 *   }
 * }
 * 
 * Note: The "notification" field should be omitted for foreground handling.
 */
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

type PushNotificationReceived = {
  title?: string;
  message?: string | object;
  data?: NotificationData | Record<string, unknown>;
  finish?: (fetchResult: string) => void;
  userInteraction?: boolean; // true when user taps notification, false when just received
  [key: string]: unknown;
}

class NotificationService {
  private token: string | null = null;
  private static instance: NotificationService | null = null;
  private isInitialized: boolean = false;
  private navigationRef: NavigationContainerRef<Record<string, unknown>> | null = null;
  private pendingNavigation: NavParams | null = null;
  private appStateSubscription: {remove: () => void} | null = null;

  private constructor() {}

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

  init = (navigationRef: NavigationContainerRef<Record<string, unknown>>): void => {
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

    PushNotification.configure({
      onRegister: (tokenData: {token: string}): void => {
        this.token = tokenData.token;
        this.log('Push notification token registered:', tokenData.token);
        this.sendDeviceTokenToBackend();
      },

      onNotification: (notification: PushNotificationReceived): void => {
        try {
          const appState = AppState.currentState;
          const notificationData = this.extractNotificationData(notification);

          this.log('=== NOTIFICATION RECEIVED ===');
          this.log('App state:', appState);
          this.log('Platform:', Platform.OS);
          this.log('User interaction (tapped):', notification.userInteraction);
          this.log('Notification data:', notificationData);
          this.log('Full notification object:', JSON.stringify(notification, null, 2));

          // On Android, when app is in foreground, manually show notification
          if (Platform.OS === 'android' && appState === 'active') {
            // Extract title and message from notification payload
            // AWS SNS may put title/message in notification object or data payload
            const dataPayload = notification.data as Record<string, unknown> | undefined;
            
            // Try to get title from multiple sources (AWS SNS structure)
            const title = notification.title || 
                         dataPayload?.title as string ||
                         (notificationData.title as string) || 
                         'Notification';
            
            // Try to get message from multiple sources (AWS SNS uses "message" field)
            const message = (typeof notification.message === 'string' ? notification.message : String(notification.message || '')) ||
                           dataPayload?.body as string ||
                           dataPayload?.message as string ||
                           (notificationData.body as string) ||
                           (notificationData.message as string) ||
                           '';

            // Show local notification when app is in foreground
            // Only show if we have at least a message (title can be default)
            if (message) {
              this.log('Showing foreground notification - Title:', title, 'Message:', message);
              this.localNotification(
                String(title),
                String(message),
                {
                  data: notificationData,
                  enableSound: true,
                  channelId: 'default-channel',
                }
              );
            } else {
              this.log('No message found in notification payload, skipping foreground notification display');
              this.log('Available keys in dataPayload:', dataPayload ? Object.keys(dataPayload) : 'none');
              this.log('Available keys in notification:', Object.keys(notification));
            }
          }

          // Handle navigation
          // Only navigate when user taps the notification (userInteraction === true)
          // When notification is just received in foreground (userInteraction === false), don't navigate
          if (notificationData.screen) {
            const params: NavParams = {
              screen: notificationData.screen,
              order_type: notificationData.order_type || 'delivery',
              menu_type: notificationData.menu_type || notificationData.order_type || 'delivery',
              id: notificationData.id,
              ...notificationData.params,
            };
            
            // Check if user tapped the notification
            const userTapped = notification.userInteraction === true;
            
            if (userTapped) {
              // User tapped the notification - navigate immediately
              this.log('User tapped notification - navigating to:', params.screen);
              if (appState === 'active' && this.navigationRef?.isReady()) {
                this.processNavigation(params);
                this.pendingNavigation = null;
              } else {
                // App is opening from background/killed - store for when app becomes active
                this.pendingNavigation = params;
              }
            } else {
              // Notification was just received, not tapped
              // Store navigation params for when user taps the notification later
              this.pendingNavigation = params;
              this.log('Notification received (not tapped) - navigation will happen when user taps notification');
            }
          }

          // Handle custom actions
          if (notificationData.type) {
            this.handleNotificationAction(notificationData.type, notificationData);
          }
        } catch (e) {
          this.log('Error handling notification:', e);
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

      popInitialNotification: true,
      requestPermissions: true,
    });

    if (Platform.OS === 'android') {
      this.createNotificationChannels();
    }
    
    this.isInitialized = true;
  };

  private processNavigation(params: NavParams): void {
    if (!this.navigationRef?.isReady()) return;
    
    // Validate navigation requirements based on order type
    if (!this.validateNavigationRequirements(params)) {
      return; // Validation failed, alert already shown
    }
    
    getNavigationHelper().getInstance().navigate(params);
  }

  private validateNavigationRequirements(params: NavParams): boolean {
    const state = store.getState();
    const orderType = params.order_type || state.user.orderType || 'delivery';
    
    // For delivery: check if address exists
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
    
    // For takeaway: check if branch exists
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

  private extractNotificationData(notification: PushNotificationReceived): NotificationData {
    // Extract notification data - handle app_custom_obj or direct data
    if (Platform.OS === 'android') {
      const data = notification.data as Record<string, unknown> | undefined;
      if (data?.app_custom_obj && typeof data.app_custom_obj === 'object') {
        return data.app_custom_obj as NotificationData;
      }
      return (data as NotificationData) || {};
    } else {
      const data = notification.data as Record<string, unknown> | undefined;
      if (data?.data && typeof data.data === 'object') {
        const nestedData = data.data as Record<string, unknown>;
        if (nestedData.app_custom_obj && typeof nestedData.app_custom_obj === 'object') {
          return nestedData.app_custom_obj as NotificationData;
        }
        return nestedData as NotificationData;
      }
      if (data?.app_custom_obj && typeof data.app_custom_obj === 'object') {
        return data.app_custom_obj as NotificationData;
      }
      return (data as NotificationData) || {};
    }
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
      () => {},
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
      () => {},
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

  deregister = (): void => {
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
    this.clearAllNotifications();
  };

  setBadgeCount = (count: number): void => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(count);
    }
  };
}

export default NotificationService;
