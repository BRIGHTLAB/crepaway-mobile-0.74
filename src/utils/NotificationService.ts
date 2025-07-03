import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {NavigationContainerRef} from '@react-navigation/native';
import {Platform} from 'react-native';
import PushNotification, {Importance} from 'react-native-push-notification';
import {POST} from '../api';

// Type definitions
interface NotificationOptions {
  data?: Record<string, unknown>;
  enableSound?: boolean;
  channelId?: 'default-channel' | 'silent-channel';
  bigText?: string;
  subText?: string;
}

interface NotificationData {
  screen?: string;
  params?: Record<string, unknown>;
  type?: string;
  count?: string;
  [key: string]: unknown;
}

interface Notification {
  data?: NotificationData | Record<string, unknown>;
  finish?: (fetchResult: string) => void;
  [key: string]: unknown;
}

class NotificationService {
  private token: string | null = null;
  private static instance: NotificationService | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  init = (navigationRef: NavigationContainerRef<any>): void => {
    // Configure the notification service
    PushNotification.configure({
      // Called when registered for remote notifications
      onRegister: (tokenData: {token: string}): void => {
        console.log('Device TOKEN:', tokenData);
        this.token = tokenData.token;

        // Optionally send token to backend
        this.sendDeviceTokenToBackend();
      },

      // Required for proper operation
      onNotification: (notification: Notification): void => {
        console.log('NOTIFICATION:', notification);

        // Get notification data based on platform
        const notificationData: NotificationData =
          Platform.OS === 'android'
            ? (notification.data as NotificationData) || {}
            : ((notification.data as Record<string, unknown>)
                ?.data as NotificationData) ||
              (notification.data as NotificationData) ||
              {};

        // Handle navigation from notification
        if (notificationData.screen && navigationRef.isReady()) {
          // Cast params to appropriate type for navigation
          navigationRef.navigate(
            notificationData.screen,
            notificationData.params,
          );
        }

        // Handle custom actions based on notification type
        if (notificationData.type) {
          this.handleNotificationAction(
            notificationData.type,
            notificationData,
          );
        }

        // Required on iOS only
        if (Platform.OS === 'ios' && notification.finish) {
          notification.finish(String(PushNotificationIOS.FetchResult.NoData));
        }
      },

      // Called when registration fails
      onRegistrationError: function (err: Error): void {
        console.error('Registration Error:', err.message, err);
      },

      // IOS ONLY
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });

    // Create notification channels for Android
    if (Platform.OS === 'android') {
      this.createNotificationChannels();
    }
  };

  // Create notification channels for Android
  private createNotificationChannels(): void {
    // Default channel with sound
    // PushNotification.createChannel(
    //   {
    //     channelId: 'default-channel',
    //     channelName: 'Default Channel',
    //     channelDescription: 'Default notifications with sound',
    //     soundName: 'default',
    //     importance: Importance.HIGH,
    //     vibrate: true,
    //   },
    //   (created: boolean) => console.log(`Default channel created: ${created}`),
    // );
    // // Silent channel
    // PushNotification.createChannel(
    //   {
    //     channelId: 'silent-channel',
    //     channelName: 'Silent Channel',
    //     channelDescription: 'Notifications without sound',
    //     soundName: undefined,
    //     importance: Importance.HIGH,
    //     vibrate: false,
    //   },
    //   (created: boolean) => console.log(`Silent channel created: ${created}`),
    // );
  }

  // Handle different notification action types
  private handleNotificationAction = (
    type: string,
    data: NotificationData,
  ): void => {
    switch (type) {
      case 'refresh_data':
        console.log('Refreshing data from notification');
        // Implement your refresh logic
        break;

      case 'update_badge':
        if (Platform.OS === 'ios') {
          const count = parseInt((data.count as string) || '0') || 0;
          PushNotificationIOS.setApplicationIconBadgeNumber(count);
        }
        break;

      default:
        console.log(`Handling notification type: ${type}`);
    }
  };

  // Send a notification with custom options
  localNotification = (
    title: string,
    message: string,
    options: NotificationOptions = {},
  ): void => {
    const {
      data = {},
      enableSound = true,
      channelId = enableSound ? 'default-channel' : 'silent-channel',
      bigText,
      subText,
    } = options;

    const notificationObj = {
      channelId,
      title,
      message,
      playSound: enableSound,
      soundName: enableSound ? 'default' : undefined,
      bigText,
      subText,
      userInfo: data,
    };

    PushNotification.localNotification(notificationObj);
  };

  // Schedule a notification for later
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

    const scheduledNotificationObj = {
      channelId,
      title,
      message,
      date,
      playSound: enableSound,
      soundName: enableSound ? 'default' : undefined,
      bigText,
      subText,
      userInfo: data,
    };

    PushNotification.localNotificationSchedule(scheduledNotificationObj);
  };

  // Get the device token
  getDeviceToken = (): string | null => {
    return this.token;
  };

  // Send device token to backend
  async sendDeviceTokenToBackend() {
    if (!this.token) return null;

    const response = await POST({
      endpoint: '/users/tokens',
      formData: {
        token: this.token,
        platform_os: Platform.OS,
      },
    });
    console.log('responsesa', response);
    if (response.status < 400) {
      return response.data;
    } else {
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

    this.token = null;
    this.clearAllNotifications();

    console.log('Notification permissions abandoned');
  };

  // Set badge count (iOS only)
  setBadgeCount = (count: number): void => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(count);
    }
  };
}

export default NotificationService;
