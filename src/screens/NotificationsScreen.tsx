import LottieView from 'lottie-react-native';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {COLORS, SCREEN_PADDING, TYPOGRAPHY} from '../theme';
import Button from '../components/UI/Button';
import Icon_Add from '../../assets/SVG/Icon_Add';
import FastImage from 'react-native-fast-image';
import Icon_Logo_Spine from '../../assets/SVG/Icon_Logo_Spine';
import Icon_Home from '../../assets/SVG/Icon_Home';
import {useSelector} from 'react-redux';
import {RootState} from '../store/store';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/NavigationStack';
import {FlatList} from 'react-native-gesture-handler';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Define group type
type NotificationGroupType = {
  title: string;
  data: Notification[];
};

const NotificationsScreen = () => {
  const state = useSelector((state: RootState) => state.notifications);
  const notifications = state.data;

  // Format date string based on how recent it is
  const formatDate = (dateString: string) => {
    const date = dayjs(dateString);
    const now = dayjs();

    if (date.isAfter(now.subtract(1, 'minute'))) {
      return 'Just now';
    } else if (date.isAfter(now.subtract(1, 'hour'))) {
      return `${date.diff(now, 'minute') * -1}m`;
    } else if (date.isAfter(now.subtract(24, 'hour'))) {
      return `${date.diff(now, 'hour') * -1}h`;
    } else if (date.isAfter(now.subtract(7, 'day'))) {
      return date.format('dddd'); // Day name
    } else if (date.isAfter(now.subtract(1, 'year'))) {
      return date.format('D MMM'); // 25 Nov
    } else {
      return date.format('D MMM YYYY'); // 25 Nov 2023
    }
  };

  // Group notifications by date for headers
  const groupedNotifications = React.useMemo(() => {
    if (!notifications || notifications.length === 0) {
      return [] as NotificationGroupType[];
    }

    const result: NotificationGroupType[] = [];
    let currentDate = '';
    let currentGroup: Notification[] = [];

    // Sort notifications by date (newest first)
    const sortedNotifications = [...notifications].sort(
      (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
    );

    sortedNotifications.forEach(notification => {
      const notificationDate = dayjs(notification.date);
      const now = dayjs();

      let dateGroup;

      if (notificationDate.isSame(now, 'day')) {
        dateGroup = 'Today';
      } else if (notificationDate.isSame(now.subtract(1, 'day'), 'day')) {
        dateGroup = 'Yesterday';
      } else if (notificationDate.isAfter(now.subtract(7, 'day'))) {
        dateGroup = 'This Week';
      } else if (notificationDate.isAfter(now.subtract(1, 'month'))) {
        dateGroup = 'This Month';
      } else {
        dateGroup = 'Older';
      }

      if (dateGroup !== currentDate) {
        if (currentGroup.length > 0) {
          result.push({
            title: currentDate,
            data: currentGroup,
          });
        }
        currentDate = dateGroup;
        currentGroup = [notification];
      } else {
        currentGroup.push(notification);
      }
    });

    if (currentGroup.length > 0) {
      result.push({
        title: currentDate,
        data: currentGroup,
      });
    }

    return result;
  }, [notifications]);

  return (
    <View style={styles.container}>
      <FlatList<NotificationGroupType>
        data={groupedNotifications}
        style={{backgroundColor: COLORS.white}}
        renderItem={({item: group}) => (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{group.title}</Text>
            </View>
            {group.data.map(item => (
              <View
                key={item.id.toString()}
                style={[
                  styles.notification,
                  {
                    backgroundColor: item.is_read ? 'transparent' : '#F3F4F6',
                  },
                ]}>
                <Icon_Logo_Spine
                  color={item.is_read ? '#8391A1' : COLORS.primaryColor}
                />
                <View style={styles.notificationContent}>
                  <Text
                    style={{
                      ...TYPOGRAPHY.BODY,
                      color: COLORS.darkColor,
                    }}>
                    {item.content}
                  </Text>
                  <Text
                    style={{
                      ...TYPOGRAPHY.TAGS,
                      color: COLORS.foregroundColor,
                    }}>
                    {formatDate(item.date)}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
        ListEmptyComponent={EmptyNotificationsView}
        keyExtractor={item => item.title}
      />
    </View>
  );
};

const EmptyNotificationsView = () => {
  const navigation = useNavigation<any>();

  const handleHomePress = () => {
    navigation.navigate('HomeStack', {screen: 'Home'});
  };

  return (
    <View style={styles.emptyNotificationsContainer}>
      <View style={{alignItems: 'center', justifyContent: 'center'}}>
        <View style={[styles.iconContainer]}>
          <Icon_Logo_Spine width={'100%'} height={'100%'} />
        </View>
        <Text style={styles.noNotificationTitle}>No Notifications</Text>
        <Text style={styles.noNotificationDescription}>
          You have no new notifications
        </Text>
      </View>
      <Button
        onPress={handleHomePress}
        isLoading={false}
        icon={<Icon_Home />}
        iconPosition="left">
        Home
      </Button>
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyNotificationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING.horizontal,
    gap: 24,
  },
  iconContainer: {
    width: 150,
    height: 150,
  },
  noNotificationTitle: {
    ...TYPOGRAPHY.MAIN_TITLE,
    textAlign: 'center',
    color: COLORS.darkColor,
    marginTop: 30,
  },
  noNotificationDescription: {
    ...TYPOGRAPHY.SUB_HEADLINE,
    color: COLORS.foregroundColor,
    textAlign: 'center',
  },
  notificationsContainer: {
    flex: 1,
  },
  notification: {
    gap: 8,
    flexDirection: 'row',
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: 8,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 8,
  },
  sectionHeader: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: 8,
  },
  sectionTitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.foregroundColor,
  },
});
