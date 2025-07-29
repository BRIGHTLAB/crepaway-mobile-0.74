import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { TableUser, TableUsers } from '../../screens/TableScreen';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../../theme';
import DynamicPopup from '../UI/DynamicPopup';

type Props = {
  users: TableUsers;
  pendingUsers: TableUsers;
  currentUser?: TableUser;
  onUserPress?: (user: TableUser) => void;
  onApproveUser?: (user: TableUser) => void;
  onRejectUser?: (user: TableUser) => void;
};

const TableUsersList = ({
  users,
  pendingUsers,
  currentUser,
  onUserPress,
  onApproveUser,
  onRejectUser
}: Props) => {
  const isCurrentUserKing = currentUser?.isKing;
  const [selectedPendingUser, setSelectedPendingUser] = useState<TableUser | null>(null);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);

  const handleUserPress = (user: TableUser) => {
    if (pendingUsers?.[user.id]) {
      setSelectedPendingUser(user);
      setShowApprovalPopup(true);
    } else if (isCurrentUserKing && !user.isKing && onUserPress) {
      onUserPress(user);
    }
  };

  const handleApprove = () => {
    if (selectedPendingUser && onApproveUser) {
      onApproveUser(selectedPendingUser);
    }
    setShowApprovalPopup(false);
    setSelectedPendingUser(null);
  };

  const handleReject = () => {
    if (selectedPendingUser && onRejectUser) {
      onRejectUser(selectedPendingUser);
    }
    setShowApprovalPopup(false);
    setSelectedPendingUser(null);
  };

  const closePopup = () => {
    setShowApprovalPopup(false);
    setSelectedPendingUser(null);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Table Users</Text>
      <FlatList
        data={[...Object.values(users), ...Object.values(pendingUsers)]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <UserItem
            user={item}
            isUserPending={pendingUsers?.[item.id] !== undefined}
            isCurrentUserKing={isCurrentUserKing}
            onPress={() => handleUserPress(item)}
          />
        )}
      />

      {/* Approval Popup */}
      <DynamicPopup visible={showApprovalPopup} onClose={closePopup}>
        <View style={styles.approvalContent}>
          <View style={styles.userPreview}>
            <FastImage
              style={styles.previewImage}
              source={{
                uri: selectedPendingUser?.image_url || 'https://placehold.co/200x200/png',
              }}
            />
            <Text style={styles.previewName}>{selectedPendingUser?.name}</Text>
          </View>

          <Text style={styles.approvalTitle}>User wants to join the table</Text>
          <Text style={styles.approvalSubtitle}>
            Do you want to approve {selectedPendingUser?.name}?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>
      </DynamicPopup>
    </View>
  );
};

// Separate component for user item to handle individual animations
const UserItem = ({ isUserPending, user, isCurrentUserKing, onPress }: {
  user: TableUser;
  isCurrentUserKing?: boolean;
  onPress: () => void;
  isUserPending: boolean
}) => {


  const isDisabled = (!isCurrentUserKing || user.isKing) && !isUserPending;

  return (
    <TouchableOpacity
      style={[
        styles.userContainer,
        // Add extra padding for pending users to accommodate animations
        isUserPending && styles.pendingUserContainer
      ]}
      onPress={onPress}
      disabled={isDisabled}>
      <Animated.View
        style={[
          styles.userImageContainer,
        ]}>
        <FastImage
          style={[
            styles.userImage,
          ]}
          source={{
            uri: user.image_url || 'https://placehold.co/200x200/png',
          }}
        />

        {/* Status indicator (online/offline) */}
        <View
          style={[
            styles.statusIndicator,
            user.isOnline ? styles.onlineStatus : styles.offlineStatus,
          ]}
        />

        {/* Crown for king/admin user */}
        {user.isKing && (
          <View style={styles.crownContainer}>
            <Text style={styles.crownIcon}>👑</Text>
          </View>
        )}

        {/* Ping animation for pending users */}
        {isUserPending && (
          <PingAnimation />
        )}
      </Animated.View>

      <Text style={[
        styles.userName,
        isUserPending && styles.pendingUserName
      ]} numberOfLines={2}>
        {user.name}
      </Text>
    </TouchableOpacity>
  );
};

// Ping animation component similar to Tailwind's ping animation
const PingAnimation = () => {
  const pingScale = useSharedValue(1);
  const pingOpacity = useSharedValue(1);

  useEffect(() => {
    // Start ping animation
    pingScale.value = withRepeat(
      withTiming(1.4, {
        duration: 1500,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false
    );

    pingOpacity.value = withRepeat(
      withTiming(0, {
        duration: 1500,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false
    );

    return () => {
      cancelAnimation(pingScale);
      cancelAnimation(pingOpacity);
    };
  }, [pingScale, pingOpacity]);

  const pingAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pingScale.value }],
      opacity: pingOpacity.value,
    };
  });

  return (
    <Animated.View style={[styles.pingContainer, pingAnimatedStyle]} />
  );
};

export default TableUsersList;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
  },
  sectionTitle: {
    ...TYPOGRAPHY.HEADLINE,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: 16,
  },
  listContent: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  userContainer: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
    // Ensure no overflow clipping
    overflow: 'visible',
  },
  // Additional padding for pending users to accommodate scaling animation
  pendingUserContainer: {
    paddingHorizontal: 5,
  },
  userImageContainer: {
    position: 'relative',
    // Ensure badges and animations are visible
    overflow: 'visible',
    // Add some padding to accommodate the scaling animation
    padding: 8,
  },
  userImage: {
    width: 50,
    aspectRatio: 1 / 1,
    borderRadius: 25,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 8, // Adjusted for the new padding
    right: 8,  // Adjusted for the new padding
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.borderColor,
  },
  onlineStatus: {
    backgroundColor: '#4CAF50', // Green for online
  },
  offlineStatus: {
    backgroundColor: '#9E9E9E', // Grey for offline
  },
  userName: {
    ...TYPOGRAPHY.TAGS,
    textAlign: 'center',
    marginTop: 8,
  },
  pendingUserName: {
    color: COLORS.primaryColor, // Orange text for pending users
    fontWeight: 'bold',
  },
  crownContainer: {
    position: 'absolute',
    top: 3,  // Adjusted for the new padding
    left: 3, // Adjusted for the new padding
    backgroundColor: 'transparent',
  },
  crownIcon: {
    fontSize: 16,
  },
  pingContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryColor,
    zIndex: -1, // Behind the user image
  },
  // Popup styles
  approvalContent: {
    alignItems: 'center',
    minWidth: 280,
  },
  userPreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  previewName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  approvalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  approvalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
  },
  approveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  rejectButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
  },
  rejectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});