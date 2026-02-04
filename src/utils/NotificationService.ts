import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {NavigationContainerRef} from '@react-navigation/native';
import {AppState, Platform} from 'react-native';
import PushNotification, {Importance} from 'react-native-push-notification';
import {POST} from '../api';
import type { NavParams } from './NavigationHelper';

// Lazy import to avoid circular dependency
const getNavigationHelper = () => require('./NavigationHelper').default;

/**
 * Backend must include "data" field in FCM payload for foreground notifications.
 * Format: { "notification": {...}, "data": {...} } OR { "data": {...} }
 * Pure "notification" payloads (without "data") won't trigger onNotification in foreground.
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
  [key: string]: unknown;
}

class NotificationService {
  private token: string | null = null;
  private static instance: NotificationService | null = null;
  private isInitialized: boolean = false;
  private initTime: number = 0;
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
        this.sendDeviceTokenToBackend();
      },

      onNotification: (notification: PushNotificationReceived): void => {
        try {
          const appState = AppState.currentState;
          const isInitialPop = Date.now() - this.initTime < 2000 && appState === 'active';
          
          const {title, message, notificationData} = this.extractNotificationData(notification);

          // Show local notification in foreground (except initial pop)
          if (appState === 'active' && !isInitialPop) {
            this.localNotification(title, message, {
              data: notificationData,
              enableSound: true,
              channelId: 'default-channel',
            });
          }

          // Handle navigation
          if (notificationData.screen) {
            const params: NavParams = {
              screen: notificationData.screen,
              order_type: notificationData.order_type || 'delivery',
              menu_type: notificationData.menu_type || notificationData.order_type || 'delivery',
              id: notificationData.id,
              ...notificationData.params,
            };
            
            this.pendingNavigation = params;
            
            if (appState === 'active' && this.navigationRef?.isReady()) {
              this.processNavigation(params);
              this.pendingNavigation = null;
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
    this.initTime = Date.now();
  };

  private processNavigation(params: NavParams): void {
    if (!this.navigationRef?.isReady()) return;
    getNavigationHelper().getInstance().navigate(params);
  }

  private extractNotificationData(notification: PushNotificationReceived): {
    title: string;
    message: string;
    notificationData: NotificationData;
  } {
    const dataObj = notification.data as Record<string, unknown> | undefined;
    
    const getString = (obj: unknown, key: string): string | undefined => {
      if (obj && typeof obj === 'object' && key in obj) {
        const value = (obj as Record<string, unknown>)[key];
        return typeof value === 'string' ? value : undefined;
      }
      return undefined;
    };

    const title =
      (typeof notification.title === 'string' ? notification.title : undefined) ||
      getString(dataObj, 'title') ||
      getString(dataObj?.notification, 'title') ||
      'Notification';

    const message =
      (typeof notification.message === 'string' ? notification.message : undefined) ||
      getString(dataObj, 'body') ||
      getString(dataObj, 'message') ||
      getString(dataObj?.notification, 'body') ||
      'You have a new notification';

    // Extract notification data - handle app_custom_obj or direct data
    let notificationData: NotificationData = {};
    
    if (Platform.OS === 'android') {
      const data = notification.data as Record<string, unknown> | undefined;
      if (data?.app_custom_obj && typeof data.app_custom_obj === 'object') {
        notificationData = data.app_custom_obj as NotificationData;
      } else {
        notificationData = (data as NotificationData) || {};
      }
    } else {
      const data = notification.data as Record<string, unknown> | undefined;
      if (data?.data && typeof data.data === 'object') {
        const nestedData = data.data as Record<string, unknown>;
        if (nestedData.app_custom_obj && typeof nestedData.app_custom_obj === 'object') {
          notificationData = nestedData.app_custom_obj as NotificationData;
        } else {
          notificationData = nestedData as NotificationData;
        }
      } else if (data?.app_custom_obj && typeof data.app_custom_obj === 'object') {
        notificationData = data.app_custom_obj as NotificationData;
      } else {
        notificationData = (data as NotificationData) || {};
      }
    }

    return {title, message, notificationData};
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
