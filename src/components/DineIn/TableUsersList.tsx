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
import { TableBannedUsers, TableUser, TableUsers } from '../../screens/TableScreen';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../../theme';
import DynamicPopup from '../UI/DynamicPopup';
import KingIcon from '../../../assets/SVG/Icon_King';

// Helper component for user images with placeholder
const UserImage = ({
  imageUrl,
  name,
  style,
  isBanned = false
}: {
  imageUrl: string | null;
  name: string;
  style: any;
  isBanned?: boolean;
}) => {
  if (!imageUrl) {
    return (
      <View style={[style, styles.placeholderContainer, isBanned && styles.bannedPlaceholderContainer]}>
        <Text style={[styles.placeholderText, isBanned && styles.bannedPlaceholderText]}>
          {name.split(' ').map(str => str.charAt(0)).join('')}
        </Text>
      </View>
    );
  }

  return (
    <FastImage
      style={style}
      source={{ uri: imageUrl }}
    />
  );
};

type Props = {
  users: TableUsers;
  pendingUsers: TableUsers;
  bannedUsers: TableBannedUsers;
  currentUser?: TableUser;
  onUserPress?: (user: TableUser) => void;
  onApproveUser?: (user: TableUser) => void;
  onRejectUser?: (user: TableUser) => void;
  onUnkickUser?: (user: Pick<TableUser, 'id' | 'name' | 'image_url'>) => void;
};

const TableUsersList = ({
  users,
  pendingUsers,
  bannedUsers,
  currentUser,
  onUserPress,
  onApproveUser,
  onRejectUser,
  onUnkickUser
}: Props) => {
  const isCurrentUserKing = currentUser?.isKing;
  const [selectedPendingUser, setSelectedPendingUser] = useState<TableUser | null>(null);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const [selectedBannedUser, setSelectedBannedUser] = useState<Pick<TableUser, 'id' | 'name' | 'image_url'> | null>(null);
  const [showUnkickPopup, setShowUnkickPopup] = useState(false);

  const handleUserPress = (user: TableUser) => {
    if (pendingUsers?.[user.id]) {
      setSelectedPendingUser(user);
      setShowApprovalPopup(true);
    } else if (isCurrentUserKing && !user.isKing && onUserPress) {
      onUserPress(user);
    }
  };

  const handleBannedUserPress = (bannedUser: Pick<TableUser, 'id' | 'name' | 'image_url'>) => {
    if (isCurrentUserKing && onUnkickUser) {
      setSelectedBannedUser(bannedUser);
      setShowUnkickPopup(true);
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

  const handleUnkick = () => {
    if (selectedBannedUser && onUnkickUser) {
      onUnkickUser(selectedBannedUser);
    }
    setShowUnkickPopup(false);
    setSelectedBannedUser(null);
  };

  const closeUnkickPopup = () => {
    setShowUnkickPopup(false);
    setSelectedBannedUser(null);
  };

  const closePopup = () => {
    setShowApprovalPopup(false);
    setSelectedPendingUser(null);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>People at the same table</Text>
      <FlatList
        data={[
          ...Object.values(users).map(user => ({ ...user, type: 'user' as const })),
          ...Object.values(pendingUsers).map(user => ({ ...user, type: 'pending' as const })),
          ...Object.values(bannedUsers).map(user => ({ ...user, type: 'banned' as const }))
        ]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          if (item.type === 'banned') {
            return (
              <BannedUserItem
                user={item}
                isCurrentUserKing={isCurrentUserKing}
                onPress={() => handleBannedUserPress(item)}
              />
            );
          }

          const isUserPending = item.type === 'pending';

          return (
            <UserItem
              user={item}
              isUserPending={isUserPending}
              isCurrentUserKing={isCurrentUserKing}
              onPress={() => handleUserPress(item)}
            />
          );
        }}
      />

      {/* Approval Popup */}
      <DynamicPopup visible={showApprovalPopup} onClose={closePopup}>
        <View style={styles.approvalContent}>
          <View style={styles.userPreview}>
            <UserImage
              imageUrl={selectedPendingUser?.image_url || null}
              name={selectedPendingUser?.name || ''}
              style={styles.previewImage}
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

      {/* Unkick Popup */}
      <DynamicPopup visible={showUnkickPopup} onClose={closeUnkickPopup}>
        <View style={styles.approvalContent}>
          <View style={styles.userPreview}>
            <UserImage
              imageUrl={selectedBannedUser?.image_url || null}
              name={selectedBannedUser?.name || ''}
              style={styles.previewImage}
            />
            <Text style={styles.previewName}>{selectedBannedUser?.name}</Text>
          </View>

          <Text style={styles.approvalTitle}>Unkick User</Text>
          <Text style={styles.approvalSubtitle}>
            Do you want to allow {selectedBannedUser?.name} back to the table?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.rejectButton} onPress={closeUnkickPopup}>
              <Text style={styles.rejectButtonText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.approveButton} onPress={handleUnkick}>
              <Text style={styles.approveButtonText}>Unkick User</Text>
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
          {
            overflow: 'visible',
          }
        ]}>
        <UserImage
          imageUrl={user.image_url}
          name={user.name}
          style={styles.userImage}
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
            <KingIcon style={styles.crownIcon} />
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

// Banned user item component with X overlay
const BannedUserItem = ({ user, isCurrentUserKing, onPress }: {
  user: Pick<TableUser, 'id' | 'name' | 'image_url'>;
  isCurrentUserKing?: boolean;
  onPress: () => void;
}) => {
  const isDisabled = !isCurrentUserKing;

  return (
    <TouchableOpacity
      style={[
        styles.userContainer,
        styles.bannedUserContainer
      ]}
      onPress={onPress}
      disabled={isDisabled}>
      <Animated.View
        style={[
          styles.userImageContainer,
        ]}>
        <View style={styles.bannedImageWrapper}>
          <UserImage
            imageUrl={user.image_url}
            name={user.name}
            style={[styles.userImage, styles.bannedUserImage]}
            isBanned={true}
          />

          {/* Banned overlay */}
          <View style={styles.bannedOverlay}>
            <Text style={styles.bannedText}>BANNED</Text>
          </View>
        </View>
      </Animated.View>

      <Text style={[
        styles.userName,
        styles.bannedUserName
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
    color: COLORS.darkColor,
  },
  listContent: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingTop: 12, // Add padding to accommodate crown above images
  },
  userContainer: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
    // Ensure no overflow clipping for crown and animations
    overflow: 'visible',
    paddingTop: 4, // Add top padding to accommodate crown overflow
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
  crownIcon: {
    position: 'absolute',
    top: -10, 
    left: 24, 
    backgroundColor: 'transparent',
    zIndex: 10, 
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
  // Placeholder styles
  placeholderContainer: {
    backgroundColor: COLORS.darkColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  bannedPlaceholderContainer: {
    backgroundColor: '#666',
  },
  bannedPlaceholderText: {
    color: '#999',
  },
  // Banned user styles
  bannedUserContainer: {
    opacity: 0.7,
  },
  bannedUserImage: {
    opacity: 0.4,
  },
  bannedUserName: {
    color: '#999',
    textDecorationLine: 'line-through',
    opacity: 0.8,
  },
  bannedImageWrapper: {
    position: 'relative',
    width: 50,
    height: 50,
  },
  bannedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.3)',
    borderRadius: 25,
  },
  bannedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});