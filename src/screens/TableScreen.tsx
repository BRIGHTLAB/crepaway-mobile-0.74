import BottomSheet, { TouchableOpacity } from '@gorhom/bottom-sheet';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import FastImage from 'react-native-fast-image';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import Icon_Add from '../../assets/SVG/Icon_Add';
import Icon_Arrow_Right from '../../assets/SVG/Icon_Arrow_Right';
import Icon_BackArrow from '../../assets/SVG/Icon_BackArrow';
import Icon_Bell from '../../assets/SVG/Icon_Bell';
import Icon_Checkmark from '../../assets/SVG/Icon_Checkmark';
import Icon_Checkout from '../../assets/SVG/Icon_Checkout';
import KingIcon from '../../assets/SVG/Icon_King';
import Icon_Profile from '../../assets/SVG/Icon_Profile';
import Icon_Spine_Thin from '../../assets/SVG/Icon_Spine_Thin';
import BannedPopup from '../components/DineIn/BannedPopup';
import OrderedItemCmp from '../components/DineIn/OrderedItem';
import TableClosedPopup from '../components/DineIn/TableClosedPopup';
import WelcomePopup from '../components/DineIn/WelcomePopup';
import ConfirmationPopup from '../components/Popups/ConfirmationPopup';
import KingActionsSheet, {
  Action,
} from '../components/Sheets/DineIn/KingActionsSheet';
import WaiterInstructionsSheet from '../components/Sheets/DineIn/WaiterInstructionsSheet';
import Button from '../components/UI/Button';
import { DineInStackParamList } from '../navigation/DineInStack';
import { setCanPayBill, setDineInOrderId, setIsTableLocked, setTableBill, TableBill } from '../store/slices/dineInSlice';
import {
  setBranchTable,
  setOrderType,
  setSessionTableId,
} from '../store/slices/userSlice';
import store, { RootState } from '../store/store';
import {
  COLORS,
  SCREEN_PADDING,
  TYPOGRAPHY
} from '../theme';
import SocketService from '../utils/SocketService';
import { normalizeFont } from '../utils/normalizeFonts';

export type OrderedItem = {
  id: number;
  plu: string;
  name: string;
  image_url: string | null;
  quantity: number;
  price: number | null;
  symbol: string;
  special_instruction?: string | null;
  added_by: {
    id: number;
    name: string;
    image_url: string;
    type: 'waiter' | 'user';
  };
  epoch: number;
  deleted: number;
  is_disabled: boolean;
  status: 'pending' | 'in-kitchen';
  isHiddenFromUser?: boolean | null;
  order: number;
  orderMode: 'quick' | 'standard';
  modifier_groups: Array<{
    id: number;
    name: string;
    modifier_groups_id: number;
    modifier_items: Array<{
      id: number;
      menu_items_modifier_groups_id: number;
      modifier_items_id: number;
      min_quantity: number;
      max_quantity: number;
      symbol: string;
      quantity: number;
      is_paused: number;
      paused_from_date: string | null;
      paused_to_date: string | null;
      paused_until: string | null;
      price: number | null;
      order: number | null;
      enabled: number;
      removed: number;
      plu: string;
      name: string;
    }>;
  }>;
};

export type OrderedItems = Record<string, OrderedItem>;

export type TableUser = {
  id: number;
  name: string;
  image_url: string | null;
  isOnline: boolean;
  isKing: boolean;
  isReady?: boolean;
  canPayBill: boolean;
  canOrderReady: boolean;
  canQuickOrder: boolean;
};

export type TableUsers = Record<string, TableUser>;

export type PendingJoinRequests = Record<string, {
  timestamp: number;
  user: TableUser
}>;

export type TableWaiter = {
  id: number;
  name: string;
  image_url: string | null;
  isOnline: boolean;
};

export type TableWaiters = Record<string, TableWaiter>;

export type TableBannedUsers = Record<string, Pick<TableUser, 'id' | 'name' | 'image_url'>>;

export type { TableBill, TableBillPayment } from '../store/slices/dineInSlice';

type TableUpdateMessage = {
  orderId: number | null;
  users: TableUsers,
  waiters: TableWaiters,
  pendingJoinRequests: PendingJoinRequests,
  items: OrderedItems,
  isLocked: boolean,
  bannedUsers: TableBannedUsers;
  bill?: TableBill | null;
}

type TableScreenNavigationProp = NativeStackNavigationProp<
  DineInStackParamList,
  'Table'
>;

type TableScreenRouteProp = RouteProp<DineInStackParamList, 'Table'>;

const kingActions: Action[] = [
  { id: 1, key: 'remove-from-table', text: 'Remove from table' },
  { id: 2, key: 'make-table-admin', text: 'Make table admin' },
];

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const TableScreen = () => {
  const dispatch = useDispatch();
  const waiterSheetRef = useRef<BottomSheet>(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [selectedUserForKingActions, setSelectedUserForKingActions] =
    useState<TableUser | null>(null);
  const kingActionsSheetRef = useRef<BottomSheet>(null);

  const currentUser = useSelector((state: RootState) => state.user);

  const navigation = useNavigation<TableScreenNavigationProp>();
  const route = useRoute<TableScreenRouteProp>();
  const userState = store.getState().user;

  const [orderedItems, setOrderedItems] = useState<OrderedItems>({});
  const [tableUsers, setTableUsers] = useState<TableUsers>({});
  const [tableWaiters, setTableWaiters] = useState<TableWaiters>({});
  const [bannedUsers, setBannedUsers] = useState<TableBannedUsers>({});
  const [showBannedPopup, setShowBannedPopup] = useState(false);
  const [showTableClosedPopup, setShowTableClosedPopup] = useState(false);
  const [showQuickOrderConfirm, setShowQuickOrderConfirm] = useState(false);
  const [selectedPendingUser, setSelectedPendingUser] = useState<TableUser | null>(null);

  // Expanded state for table items groups (collapsed by default)
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const [myItemsExpanded, setMyItemsExpanded] = useState(false);

  const isTableLocked = useSelector((state: RootState) => state.dineIn.isTableLocked);
  const orderId = useSelector((state: RootState) => state.dineIn.orderId);
  const previousTableLockRef = useRef<boolean | null>(null);
  const previousOrderedItemsRef = useRef<OrderedItems | null>(null);
  const previousIsKingRef = useRef<boolean | null>(null);

  const [pendingJoinRequests, setPendingJoinRequests] = useState<PendingJoinRequests>({});

  const socketInstance = SocketService.getInstance();
  const { top, bottom } = useSafeAreaInsets();

  const isCurrentUserKing = tableUsers?.[currentUser.id ?? '']?.isKing;
  const isReady = tableUsers?.[currentUser.id ?? '']?.isReady ?? false;
  const canOrderReady = tableUsers?.[currentUser.id ?? '']?.canOrderReady ?? false;
  const canQuickOrder = tableUsers?.[currentUser.id ?? '']?.canQuickOrder ?? false;

  // Empty state crown animations
  const outerRotation = useSharedValue(0);
  const innerRotation = useSharedValue(0);
  const outerScale = useSharedValue(1);
  const innerScale = useSharedValue(1);

  useEffect(() => {
    // Outer icon: slow clockwise rotation
    outerRotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false,
    );
    // Inner icon: slow counter-clockwise rotation
    innerRotation.value = withRepeat(
      withTiming(-360, { duration: 14000, easing: Easing.linear }),
      -1,
      false,
    );
    // Outer scale pulse
    outerScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    // Inner scale pulse (offset timing)
    innerScale.value = withDelay(
      1500,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const outerIconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${outerRotation.value}deg` },
      { scale: outerScale.value },
    ],
  }));

  const innerIconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${innerRotation.value}deg` },
      { scale: innerScale.value },
    ],
  }));

  const handleInstructionSelect = (instruction: WaiterInstruction) => {
    socketInstance.emit(
      'message',
      {
        type: 'sendTableNotification',
        data: {
          tableName: userState.branchTable,
          user: {
            id: userState.id,
            name: userState.name
          },
          notification: {
            id: instruction.id,
            type: 'order',
            message: instruction.description
          }
        },
      },)
  };

  const handleOpenWaiterSheet = () => {
    waiterSheetRef.current?.snapToIndex(0);
  };

  const handleViewMenu = () => {
    setShowWelcomePopup(false);
    navigation.navigate('OrderStack');
  };

  const handleOrderPress = () => {
    navigation.navigate('OrderStack');
  };

  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          dispatch(
            setOrderType({
              menuType: null,
              orderTypeAlias: null,
            }),
          );
          return true;
        },
      );
      return () => backHandler.remove();
    }, [dispatch]),
  );

  const handleLeaveTable = () => {
    if (!userState) return;

    const socketInstance = SocketService.getInstance();

    socketInstance.emit(
      'message',
      {
        type: 'UserLeaveTable',
        data: {
          tableName: userState.branchTable,
          user: {
            id: userState.id,
          },
        },
      },
    );

    dispatch(setSessionTableId(null));
    dispatch(setBranchTable(null));
    dispatch(
      setOrderType({
        menuType: null,
        orderTypeAlias: null,
      }),
    );
  };



  useEffect(() => {
    if (!userState) return;
    const socketInstance = SocketService.getInstance();
    socketInstance.connect(route.params.socketUrl, {
      authorization: `Bearer ${userState.jwt}` || '',
    });

    socketInstance.on('userKicked', (message) => {
      console.log('userKicked ', message);
      dispatch(setSessionTableId(null));
      dispatch(setBranchTable(null));
      setShowWelcomePopup(false);
      setShowBannedPopup(true);
    })

    socketInstance.on('tableUpdate', (message: TableUpdateMessage) => {
      console.log('tableUpdate ', message);

      if (message.users && currentUser?.id) {
        const currentUserData = message.users[currentUser.id];
        const currentIsKing = currentUserData?.isKing || false;
        const previousIsKing = previousIsKingRef.current;

        if (previousIsKing !== null && !previousIsKing && currentIsKing) {
          Toast.show({
            type: 'success',
            text1: 'You are now the king! 👑',
            visibilityTime: 4000,
            position: 'bottom',
          });
        }

        previousIsKingRef.current = currentIsKing;
      }

      if (message.users) {
        setTableUsers(message.users);

        // Dispatch current user's canPayBill to Redux for checkout screen
        if (currentUser?.id) {
          const currentUserData = message.users[currentUser.id];
          dispatch(setCanPayBill(currentUserData?.canPayBill ?? false));
        }
      }

      if (message.items) {
        const filteredItems = Object.fromEntries(
          Object.entries(message.items as Record<string, OrderedItem>).filter(
            ([key, value]) => value.isHiddenFromUser !== true
          )
        );
        setOrderedItems(filteredItems);
      }

      dispatch(setIsTableLocked(message.isLocked))

      if (message.waiters) {
        setTableWaiters(message.waiters);
      }

      if (message.pendingJoinRequests) {
        setPendingJoinRequests(message.pendingJoinRequests);
      }

      if (message.bannedUsers) {
        setBannedUsers(message.bannedUsers);
      }

      if (message.bill !== undefined) {
        dispatch(setTableBill(message.bill ?? null));
      }

      if (message.orderId !== undefined) {
        dispatch(setDineInOrderId(message.orderId));
      }
    });

    socketInstance.on('tableClosed', () => {
      dispatch(setSessionTableId(null));
      dispatch(setBranchTable(null));
      setShowWelcomePopup(false);
      setShowBannedPopup(false);
      setShowTableClosedPopup(true);
    });
  }, []);

  useEffect(() => {
    if (previousTableLockRef.current === null) {
      previousTableLockRef.current = isTableLocked;
      return;
    }

    if (!previousTableLockRef.current && isTableLocked) {
      ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
    }

    previousTableLockRef.current = isTableLocked;
  }, [isTableLocked]);

  useEffect(() => {
    const previousItems = previousOrderedItemsRef.current;

    if (!previousItems || Object.keys(previousItems).length === 0) {
      previousOrderedItemsRef.current = orderedItems;
      return;
    }

    const hasNewInKitchen = Object.entries(orderedItems).some(([key, item]) => {
      if (item.deleted === 1) return false;
      const previousStatus = previousItems?.[key]?.status;
      return item.status === 'in-kitchen' && previousStatus !== 'in-kitchen';
    });

    if (hasNewInKitchen) {
      ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
      setTimeout(() => {
        ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
      }, 150);
    }

    previousOrderedItemsRef.current = orderedItems;
  }, [orderedItems]);



  const handleUserPress = (user: TableUser) => {
    if (!isCurrentUserKing) return;
    if (String(user.id) === String(currentUser.id)) return;
    setSelectedUserForKingActions(user);
    kingActionsSheetRef.current?.expand();
  };

  const handleKingActionSelect = (action: Action) => {
    if (!userState || !selectedUserForKingActions) return;

    const socketInstance = SocketService.getInstance();
    switch (action.key) {
      case 'remove-from-table':
        console.log('kicking user', selectedUserForKingActions.id)
        socketInstance.emit(
          'message',
          {
            type: 'kickUser',
            data: {
              tableName: userState.branchTable,
              userToKick: {
                id: selectedUserForKingActions.id,
              },
            },
          },)
        break;
      case 'make-table-admin':
        socketInstance.emit(
          'message',
          {
            type: 'promoteUserToKing',
            data: {
              tableName: userState.branchTable,
              user_id: selectedUserForKingActions.id,
            },
          },)
        break;
      default:
        break;
    }

    kingActionsSheetRef.current?.close();
  };

  // filter out the deleted = 1
  const filteredOrderedItems = Object.fromEntries(
    Object.entries(orderedItems).filter(([_, item]) => item.deleted === 0),
  );

  // Split items into My Items and Table Items
  const myItems = useMemo(() => {
    return Object.entries(filteredOrderedItems)
      .filter(([_, item]) => !item.isHiddenFromUser && item.added_by.type === 'user' && String(item.added_by.id) === String(currentUser.id))
      .map(([key, item]) => ({ ...item, uuid: key }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [filteredOrderedItems, currentUser.id]);

  // Split my items into kitchen items and new (pending) items
  const myKitchenItems = useMemo(() => myItems.filter(item => item.status === 'in-kitchen' || item.orderMode === 'quick'), [myItems]);
  const myNewItems = useMemo(() => myItems.filter(item => item.status !== 'in-kitchen' && item.orderMode !== 'quick'), [myItems]);

  // Calculate total price for my items including modifiers
  const myItemsTotal = useMemo(() => {
    return myItems.reduce((acc, item) => {
      let itemTotal = item?.price ? item.price * item.quantity : 0;
      if (item.modifier_groups) {
        item.modifier_groups.forEach(group => {
          group.modifier_items.forEach(modItem => {
            itemTotal += (modItem.price || 0) * (modItem.quantity || 1);
          });
        });
      }
      return acc + itemTotal;
    }, 0);
  }, [myItems]);

  // Group table items by user
  const tableItemsByUser = useMemo(() => {
    const otherItems = Object.entries(filteredOrderedItems)
      .filter(([_, item]) => !item.isHiddenFromUser && !(item.added_by.type === 'user' && String(item.added_by.id) === String(currentUser.id)))
      .map(([key, item]) => ({ ...item, uuid: key }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const grouped: Record<string, {
      user: { id: number; name: string; image_url: string; type: 'waiter' | 'user' };
      items: (OrderedItem & { uuid: string })[];
      totalPrice: number;
    }> = {};

    otherItems.forEach(item => {
      const key = `${item.added_by.type}_${item.added_by.id}`;
      if (!grouped[key]) {
        grouped[key] = {
          user: item.added_by,
          items: [],
          totalPrice: 0,
        };
      }
      grouped[key].items.push(item);

      // Calculate item total including modifiers
      let itemTotal = item?.price ? item.price * item.quantity : 0;
      if (item.modifier_groups) {
        item.modifier_groups.forEach(group => {
          group.modifier_items.forEach(modItem => {
            itemTotal += (modItem.price || 0) * (modItem.quantity || 1);
          });
        });
      }
      grouped[key].totalPrice += itemTotal;
    });

    return grouped;
  }, [filteredOrderedItems, currentUser.id]);

  const tableItemsCount = useMemo(() => {
    return Object.values(tableItemsByUser).reduce((acc, group) => acc + group.items.length, 0);
  }, [tableItemsByUser]);

  const handleDecreaseQuantity = (itemUuid: string, item: OrderedItem) => {
    const isOwnItem = item.added_by.type === 'user' && String(item.added_by.id) === String(currentUser.id);
    if (isOwnItem) {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }

    const newQuantity = item.quantity - 1;
    const messageData: {
      tableName: string | null;
      item: Record<string, Partial<OrderedItem>>;
    } = {
      tableName: userState.branchTable,
      item: {
        [itemUuid]: { ...item, epoch: Date.now() },
      },
    };

    if (newQuantity === 0) {
      messageData.item[itemUuid].deleted = 1;
    } else {
      messageData.item[itemUuid].quantity = newQuantity;
    }

    socketInstance.emit('message', {
      type: 'updateItem',
      data: messageData,
    });
  };

  const handleIncreaseQuantity = (itemUuid: string, item: OrderedItem) => {
    const isOwnItem = item.added_by.type === 'user' && String(item.added_by.id) === String(currentUser.id);
    if (isOwnItem) {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }

    const newQuantity = item.quantity + 1;
    const messageData: {
      tableName: string | null;
      item: Record<string, Partial<OrderedItem>>;
    } = {
      tableName: userState.branchTable,
      item: {
        [itemUuid]: {
          ...item,
          epoch: Date.now(),
          quantity: newQuantity,
        },
      },
    };

    socketInstance.emit('message', {
      type: 'updateItem',
      data: messageData,
    });
  };

  const handleItemClick = (itemUuid: string, item: OrderedItem) => {
    navigation.navigate('OrderStack', {
      screen: 'MenuItem',
      params: {
        itemId: item.id,
        itemUuid,
        item,
      },
    });
  };

  const handleApproveUser = (user: TableUser) => {
    socketInstance.emit(
      'message',
      {
        type: 'approveJoinRequest',
        data: {
          tableName: userState.branchTable,
          user_id: user.id,
          approved: true
        },
      },)
  }

  const handleRejectUser = (user: TableUser) => {
    socketInstance.emit(
      'message',
      {
        type: 'approveJoinRequest',
        data: {
          tableName: userState.branchTable,
          user_id: user.id,
          approved: false
        },
      },)
  }

  const handlePendingUserPress = (user: TableUser) => {
    if (!isCurrentUserKing) return;
    setSelectedPendingUser(user);
  };

  const handleUnkickUser = (user: Pick<TableUser, 'id' | 'name' | 'image_url'>) => {
    console.log('unKicking user', user);
    socketInstance.emit(
      'message',
      {
        type: 'unKickUser',
        data: {
          tableName: userState.branchTable,
          userToUnKick: {
            id: user.id
          }
        },
      },)
  }

  const handleTableClosedPopupClose = () => {
    setShowTableClosedPopup(false);
    dispatch(
      setOrderType({
        menuType: null,
        orderTypeAlias: null,
      }),
    );
  };

  const handleSetReady = (ready: boolean) => {
    socketInstance.emit(
      'message',
      {
        type: 'setUserReady',
        data: {
          tableName: userState.branchTable,
          isReady: ready,
        },
      },
    );
  };

  const toggleUserExpanded = (key: string) => {
    setExpandedUsers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(str => str.charAt(0).toUpperCase()).join('');
  };

  const getAbbreviatedName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length <= 1) return name;
    return `${parts[0]} ${parts[1].charAt(0)}.`;
  };

  const renderUserBubble = (user: TableUser, isMe: boolean) => {
    const isKing = user.isKing;

    return (
      <TouchableOpacity
        key={user.id}
        onPress={() => handleUserPress(user)}
        disabled={isMe}
        style={[styles.userBubble, isMe && styles.userBubbleMe]}
        activeOpacity={0.8}
      >
        {user.isReady ? (
          // Ready user gets green checkmark avatar
          <View style={styles.readyAvatar}>
            <Icon_Checkmark width={16} height={16} color={COLORS.white} />
          </View>
        ) : isKing ? (
          // King gets purple tinted crown background
          <View style={styles.kingAvatar}>
            <KingIcon width={14} height={10} />
          </View>
        ) : isMe ? (
          // Current user (non-king) gets dark initials avatar
          <View style={styles.initialsAvatar}>
            <Text style={styles.initialsText}>{getInitials(user.name)}</Text>
          </View>
        ) : user.image_url ? (
          <FastImage
            source={{ uri: user.image_url }}
            style={styles.userAvatar}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={styles.initialsAvatar}>
            <Text style={styles.initialsText}>{getInitials(user.name)}</Text>
          </View>
        )}
        <Text style={[styles.userBubbleName, isMe && styles.userBubbleNameMe]} numberOfLines={1}>
          {isMe ? 'Me' : getAbbreviatedName(user.name)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, {
      paddingTop: top
    }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => {
            dispatch(setOrderType({ menuType: null, orderTypeAlias: null }));
          }}
          style={styles.headerBackButton}
        >
          <Icon_BackArrow width={18} height={18} color={COLORS.darkColor} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Table</Text>

        <View style={styles.headerRightButtons}>
          <View style={{ opacity: orderId == null ? 0.4 : 1 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Checkout', { orderId: orderId! })}
              style={styles.headerIconButton}
              activeOpacity={0.7}
              disabled={orderId == null}
            >
              <Icon_Checkout width={20} height={16} color={orderId == null ? COLORS.foregroundColor : COLORS.primaryColor} />
            </TouchableOpacity>
          </View>

          <View style={{ opacity: Object.keys(tableWaiters).length === 0 ? 0.4 : 1 }}>
            <TouchableOpacity
              onPress={handleOpenWaiterSheet}
              style={styles.headerIconButton}
              disabled={Object.keys(tableWaiters).length === 0}
              activeOpacity={0.7}
            >
              <Icon_Bell width={20} height={18} color={Object.keys(tableWaiters).length === 0 ? COLORS.foregroundColor : COLORS.primaryColor} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Users Row - sticky, outside ScrollView */}
      <View style={styles.usersRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.usersScrollContent}
        >
          {/* Current user first */}
          {currentUser.id && tableUsers[currentUser.id] &&
            renderUserBubble(tableUsers[currentUser.id], true)
          }
          {/* Other users */}
          {Object.values(tableUsers)
            .filter(u => String(u.id) !== String(currentUser.id))
            .map(user => renderUserBubble(user, false))
          }
          {/* Pending users */}
          {Object.values(pendingJoinRequests).map(request => (
            <TouchableOpacity
              key={`pending-${request.user.id}`}
              onPress={() => handlePendingUserPress(request.user)}
              style={[styles.userBubble, { opacity: 0.7 }]}
              activeOpacity={0.8}
            >
              <View>
                {request.user.image_url ? (
                  <FastImage
                    source={{ uri: request.user.image_url }}
                    style={styles.userAvatar}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                ) : (
                  <View style={styles.initialsAvatar}>
                    <Text style={styles.initialsText}>{getInitials(request.user.name)}</Text>
                  </View>
                )}
                <View style={styles.pendingDot} />
              </View>
              <Text style={styles.userBubbleName} numberOfLines={1}>
                {getAbbreviatedName(request.user.name)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content View */}
      <View style={styles.mainContent}>
        {Object.keys(filteredOrderedItems).length === 0 ? (
          /* Empty State - when no items at all */
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcons}>
              <Animated.View style={[{ position: 'absolute' }, outerIconStyle]}>
                <Icon_Spine_Thin width={120} height={120} color={COLORS.primaryColor} />
              </Animated.View>
              <Animated.View style={innerIconStyle}>
                <Icon_Spine_Thin width={90} height={90} color={COLORS.secondaryColor} />
              </Animated.View>
            </View>
            <Text style={styles.emptyStateTitle}>Still not decided?</Text>
            <Text style={styles.emptyStateSubtitle}>Add items to see them here</Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 180 }}
            showsVerticalScrollIndicator={false}
          >

            {/* My Items Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Items</Text>
                <Text style={styles.sectionCount}>{myItems.length} {myItems.length === 1 ? 'item' : 'items'}</Text>
              </View>

              <View style={styles.tableUserCard}>
                {/* Collapsible header */}
                <TouchableOpacity
                  onPress={() => setMyItemsExpanded(!myItemsExpanded)}
                  style={styles.tableUserHeader}
                  activeOpacity={0.8}
                >
                  <View style={styles.tableUserInfo}>
                    {isReady ? (
                      <View style={styles.readyAvatarLarge}>
                        <Icon_Checkmark width={18} height={18} color={COLORS.white} />
                      </View>
                    ) : isCurrentUserKing ? (
                      <View style={styles.tableUserKingAvatar}>
                        <KingIcon width={15} height={12} />
                      </View>
                    ) : (
                      <View style={styles.initialsAvatar}>
                        <Text style={styles.initialsText}>
                          {getInitials(currentUser.name || 'Me')}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text style={styles.tableUserName}>Me</Text>
                      <Text style={styles.tableUserItemCount}>
                        {myItems.length} {myItems.length === 1 ? 'item' : 'items'} ordered
                      </Text>
                    </View>
                  </View>
                  <View style={styles.tableUserRight}>
                    <Text style={styles.tableUserTotal}>
                      ${myItemsTotal.toFixed(1)}
                    </Text>
                    <View style={{ transform: [{ rotate: myItemsExpanded ? '-90deg' : '90deg' }] }}>
                      <Icon_Arrow_Right width={18} height={18} color={COLORS.primaryColor} />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Expanded items */}
                {myItemsExpanded && (
                  <View style={styles.expandedItemsContainer}>
                    {myItems.length === 0 ? (
                      <View style={styles.myItemsEmptyContainer}>
                        <Text style={styles.myItemsEmptyText}>No items added, add items to your order.</Text>
                      </View>
                    ) : (
                      <>
                        {/* In-Kitchen items - checkout style */}
                        {myKitchenItems.map((item, index) => (
                          <View
                            key={item.uuid}
                            style={[
                              styles.kitchenItemContainer,
                              index < myKitchenItems.length - 1 && myNewItems.length === 0
                                ? styles.kitchenItemBorder
                                : index < myKitchenItems.length - 1
                                  ? styles.kitchenItemBorder
                                  : undefined,
                            ]}
                          >
                            <View style={styles.kitchenItemRow}>
                              <View style={styles.kitchenItemLeft}>
                                <Text style={styles.kitchenItemQuantity}>{item.quantity}</Text>
                                <Text style={styles.kitchenItemName} numberOfLines={2}>
                                  {item.name}
                                  {item.orderMode === 'quick' && (
                                    <Text style={styles.quickOrderBadgeText}> ⚡ Quick</Text>
                                  )}
                                </Text>
                              </View>
                              <Text style={styles.kitchenItemPrice}>
                                {item.symbol} {item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}
                              </Text>
                            </View>
                            {item.modifier_groups?.map((modGroup) => (
                              <View key={modGroup.id} style={styles.kitchenModifierGroup}>
                                <Text style={styles.kitchenModifierGroupName}>{modGroup.name}</Text>
                                {modGroup.modifier_items.map((modItem) => (
                                  <View key={modItem.id} style={styles.kitchenModifierItemRow}>
                                    <View style={styles.kitchenItemLeft}>
                                      {modItem.quantity > 1 ? (
                                        <Text style={styles.kitchenModifierItemQuantity}>{modItem.quantity}</Text>
                                      ) : null}
                                      <Text style={styles.kitchenModifierItemName}>{modItem.name}</Text>
                                    </View>
                                    {modItem.price && modItem.price > 0 ? (
                                      <Text style={styles.kitchenModifierItemPrice}>{item.symbol} {modItem.price}</Text>
                                    ) : null}
                                  </View>
                                ))}
                              </View>
                            ))}
                            {item.special_instruction ? (
                              <Text numberOfLines={1} style={styles.kitchenItemNote}>Note: {item.special_instruction}</Text>
                            ) : null}
                          </View>
                        ))}

                        {/* New Items sub-header */}
                        {myNewItems.length > 0 && (
                          <Text style={styles.newItemsSubHeader}>New Items</Text>
                        )}

                        {/* Pending items - original OrderedItemCmp */}
                        {myNewItems.map((item, index) => {
                          const isWaiterItem = item.added_by.type === 'waiter';
                          const isOwnItem = item.added_by.type === 'user' && String(item.added_by.id) === String(currentUser.id);
                          const canKingEdit = isCurrentUserKing && !isWaiterItem;
                          const canUserEdit = isOwnItem;
                          const isItemDisabled = isTableLocked || item.is_disabled || isWaiterItem || (!canKingEdit && !canUserEdit);

                          return (
                            <View key={item.uuid} style={styles.itemWrapper}>
                              <OrderedItemCmp
                                item={item}
                                isDisabled={isItemDisabled}
                                currentUserId={currentUser.id}
                                isTableLocked={isTableLocked}
                                isCurrentUserKing={isCurrentUserKing}
                                isLastItem={index === myNewItems.length - 1}
                                onQuantityDecrease={
                                  !isItemDisabled
                                    ? () => handleDecreaseQuantity(item.uuid, item)
                                    : undefined
                                }
                                onQuantityIncrease={
                                  !isItemDisabled
                                    ? () => handleIncreaseQuantity(item.uuid, item)
                                    : undefined
                                }
                                onItemImageClick={
                                  !isItemDisabled
                                    ? () => handleItemClick(item.uuid, item)
                                    : undefined
                                }
                              />
                            </View>
                          );
                        })}
                      </>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Table Items Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Table items</Text>
                <Text style={styles.sectionCount}>{tableItemsCount} {tableItemsCount === 1 ? 'item' : 'items'}</Text>
              </View>

              {Object.keys(tableItemsByUser).length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No items from other users</Text>
                </View>
              ) : (
                Object.entries(tableItemsByUser).map(([groupKey, group]) => {
                  const isExpanded = expandedUsers[groupKey] || false;
                  const tableUser = group.user.type === 'user'
                    ? tableUsers[String(group.user.id)]
                    : undefined;

                  return (
                    <View key={groupKey} style={styles.tableUserCard}>
                      {/* User group header */}
                      <TouchableOpacity
                        onPress={() => toggleUserExpanded(groupKey)}
                        style={styles.tableUserHeader}
                        activeOpacity={0.8}
                      >
                        <View style={styles.tableUserInfo}>
                          {tableUser?.isReady ? (
                            <View style={styles.readyAvatarLarge}>
                              <Icon_Checkmark width={18} height={18} color={COLORS.white} />
                            </View>
                          ) : tableUser?.isKing ? (
                            <View style={styles.tableUserKingAvatar}>
                              <KingIcon width={15} height={12} />
                            </View>
                          ) : (
                            <View style={styles.tableUserInitials}>
                              <Text style={styles.tableUserInitialsText}>
                                {getInitials(group.user.name)}
                              </Text>
                            </View>
                          )}
                          <View>
                            <Text style={styles.tableUserName}>{getAbbreviatedName(group.user.name)}</Text>
                            <Text style={styles.tableUserItemCount}>
                              {group.items.length} {group.items.length === 1 ? 'item' : 'items'} ordered
                            </Text>
                          </View>
                        </View>
                        <View style={styles.tableUserRight}>
                          <Text style={styles.tableUserTotal}>
                            ${group.totalPrice.toFixed(1)}
                          </Text>
                          <View style={{ transform: [{ rotate: isExpanded ? '-90deg' : '90deg' }] }}>
                            <Icon_Arrow_Right width={18} height={18} color={COLORS.primaryColor} />
                          </View>
                        </View>
                      </TouchableOpacity>

                      {/* Expanded items */}
                      {isExpanded && (() => {
                        const groupKitchenItems = group.items.filter(item => item.status === 'in-kitchen' || item.orderMode === 'quick');
                        const groupNewItems = group.items.filter(item => item.status !== 'in-kitchen' && item.orderMode !== 'quick');

                        return (
                          <View style={styles.expandedItemsContainer}>
                            {/* In-Kitchen items - checkout style */}
                            {groupKitchenItems.map((item, index) => (
                              <View
                                key={item.uuid}
                                style={[
                                  styles.kitchenItemContainer,
                                  index < groupKitchenItems.length - 1 ? styles.kitchenItemBorder : undefined,
                                ]}
                              >
                                <View style={styles.kitchenItemRow}>
                                  <View style={styles.kitchenItemLeft}>
                                    <Text style={styles.kitchenItemQuantity}>{item.quantity}</Text>
                                    <Text style={styles.kitchenItemName} numberOfLines={2}>
                                      {item.name}
                                      {item.orderMode === 'quick' && (
                                        <Text style={styles.quickOrderBadgeText}> ⚡ Quick</Text>
                                      )}
                                    </Text>
                                  </View>
                                  <Text style={styles.kitchenItemPrice}>
                                    {item.symbol} {item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}
                                  </Text>
                                </View>
                                {item.modifier_groups?.map((modGroup) => (
                                  <View key={modGroup.id} style={styles.kitchenModifierGroup}>
                                    <Text style={styles.kitchenModifierGroupName}>{modGroup.name}</Text>
                                    {modGroup.modifier_items.map((modItem) => (
                                      <View key={modItem.id} style={styles.kitchenModifierItemRow}>
                                        <View style={styles.kitchenItemLeft}>
                                          {modItem.quantity > 1 ? (
                                            <Text style={styles.kitchenModifierItemQuantity}>{modItem.quantity}</Text>
                                          ) : null}
                                          <Text style={styles.kitchenModifierItemName}>{modItem.name}</Text>
                                        </View>
                                        {modItem.price && modItem.price > 0 ? (
                                          <Text style={styles.kitchenModifierItemPrice}>{item.symbol} {modItem.price}</Text>
                                        ) : null}
                                      </View>
                                    ))}
                                  </View>
                                ))}
                                {item.special_instruction ? (
                                  <Text numberOfLines={1} style={styles.kitchenItemNote}>Note: {item.special_instruction}</Text>
                                ) : null}
                              </View>
                            ))}

                            {/* New Items sub-header */}
                            {groupNewItems.length > 0 && (
                              <Text style={styles.newItemsSubHeader}>New Items</Text>
                            )}

                            {/* Pending items - original inline rendering with image */}
                            {groupNewItems.map((item) => (
                              <View key={item.uuid} style={styles.tableItemRow}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1, gap: 8 }}>
                                  <FastImage
                                    source={{
                                      uri: item.image_url || 'https://placehold.co/600x400/png',
                                      priority: FastImage.priority.normal,
                                    }}
                                    style={styles.tableItemImage}
                                    resizeMode={FastImage.resizeMode.cover}
                                  />
                                  <View style={{ flex: 1 }}>
                                    <Text numberOfLines={2} style={styles.tableItemName}>
                                      {item.quantity > 1 && (
                                        <Text style={styles.tableItemQuantity}>{item.quantity} </Text>
                                      )}
                                      {item.name}
                                      {item.orderMode === 'quick' && (
                                        <Text style={styles.quickOrderBadgeText}> ⚡ Quick</Text>
                                      )}
                                    </Text>
                                    <Text style={styles.tableItemPrice}>
                                      {item.symbol}
                                      {item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}
                                    </Text>

                                    {/* Modifier Groups */}
                                    {item.modifier_groups && item.modifier_groups.length > 0 && (
                                      <View style={{ marginTop: 4 }}>
                                        {item.modifier_groups.map(mg => (
                                          <View key={mg.id}>
                                            <Text style={{
                                              fontFamily: 'Poppins-Medium',
                                              fontSize: 11,
                                              color: COLORS.darkColor,
                                            }}>
                                              {mg.name}:
                                            </Text>
                                            {mg.modifier_items.map(modItem => (
                                              <View
                                                key={modItem.id}
                                                style={{
                                                  flexDirection: 'row',
                                                  alignItems: 'flex-start',
                                                  justifyContent: 'space-between',
                                                }}>
                                                <Text numberOfLines={2} style={{
                                                  flex: 1,
                                                  fontFamily: 'Poppins-Regular',
                                                  fontSize: 10,
                                                  color: COLORS.foregroundColor,
                                                }}>
                                                  {modItem.quantity > 1 && <Text style={{ color: COLORS.primaryColor, fontFamily: 'Poppins-Bold' }}>{modItem.quantity} </Text>}
                                                  {modItem.name}
                                                </Text>
                                                {modItem.price ? (
                                                  <Text style={{
                                                    fontFamily: 'Poppins-Regular',
                                                    fontSize: 10,
                                                    color: COLORS.secondaryColor,
                                                  }}>
                                                    {item.symbol} {modItem.price}
                                                  </Text>
                                                ) : null}
                                              </View>
                                            ))}
                                          </View>
                                        ))}
                                      </View>
                                    )}

                                    {item.special_instruction && (
                                      <Text numberOfLines={1} style={styles.tableItemDescription}>
                                        Note: {item.special_instruction}
                                      </Text>
                                    )}
                                  </View>
                                </View>
                              </View>
                            ))}
                          </View>
                        );
                      })()}
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        )}

        {/* Bottom Action Bar */}
        <View style={[styles.actionBarContainer, { paddingBottom: bottom + 10 }]}>
          {myItems.length > 0 && (
            isReady ? (
              <TouchableOpacity
                onPress={() => handleSetReady(false)}
                activeOpacity={0.8}
                style={styles.readyActiveButton}
              >
                <View style={styles.readyCheckmarkCircle}>
                  <Icon_Checkmark width={15} height={15} color="#FFF" style={{
                    marginTop: 1,
                    marginLeft: 1,
                  }} />
                </View>
                <Text style={styles.readyActiveText}>Ready</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionBarRow}>
                <Button
                  onPress={() => handleSetReady(true)}
                  variant="primary"
                  style={{ flex: 1 }}
                  disabled={!canOrderReady}
                >
                  I'm ready
                </Button>
                <Button
                  onPress={() => setShowQuickOrderConfirm(true)}
                  variant="outline"
                  style={{ flex: 1 }}
                  disabled={!canQuickOrder}
                >
                  Quick Order
                </Button>
              </View>
            )
          )}
          <View style={myItems.length === 0 ? styles.actionBarColumn : styles.actionBarRow}>
            <Button
              onPress={handleOrderPress}
              variant={myItems.length === 0 ? 'primary' : 'outline'}
              icon={myItems.length === 0 ? undefined : <Icon_Add width={14} height={14} color={COLORS.primaryColor} />}
              style={{ flex: myItems.length === 0 ? undefined : 1 }}
            >
              {myItems.length === 0 ? 'Add items' : 'Add more items'}
            </Button>
            <Button
              onPress={handleOpenWaiterSheet}
              variant="outline"
              icon={<Icon_Bell width={16} height={14} color={COLORS.primaryColor} />}
              style={{ flex: myItems.length === 0 ? undefined : 1 }}
              disabled={Object.keys(tableWaiters).length === 0}
            >
              Call waiter
            </Button>
          </View>
        </View>
      </View>

      {/* Waiter Instructions Sheet */}
      {(() => {
        const waiter = Object.values(tableWaiters)[0];
        if (!waiter) return null;
        return (
          <WaiterInstructionsSheet
            waiter={waiter}
            onSelectInstruction={handleInstructionSelect}
            ref={waiterSheetRef}
          />
        );
      })()}

      {/* TODO: REMOVE - Testing only: Submit to kitchen test button */}
      <TouchableOpacity
        onPress={() => {
          socketInstance.emit('message', {
            type: 'submitToKitchenTest',
            data: {
              tableName: userState.branchTable,
            },
          }, (response: any) => {
            console.log('submitToKitchenTest response:', response);
          });
        }}
        style={{
          position: 'absolute',
          bottom: 100,
          right: 20,
          backgroundColor: 'red',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          zIndex: 999,
        }}
      >
        <Text style={{ color: 'white', fontFamily: 'Poppins-Medium', fontSize: 12 }}>Submit Test</Text>
      </TouchableOpacity>

      {/* King Actions Popup */}
      <KingActionsSheet
        user={selectedUserForKingActions}
        actions={selectedUserForKingActions?.isKing ? kingActions.filter((action) => action.key !== 'make-table-admin') : kingActions}
        onSelectAction={handleKingActionSelect}
        ref={kingActionsSheetRef}
      />

      {/* Welcome Popup */}
      <WelcomePopup
        visible={showWelcomePopup}
        onClose={() => setShowWelcomePopup(false)}
        onViewMenu={handleViewMenu}
        waiter={Object.values(tableWaiters)[0] || undefined}
      />

      {/* Banned Popup */}
      <BannedPopup
        visible={showBannedPopup}
        onClose={() => {
          setShowBannedPopup(false);
          dispatch(
            setOrderType({
              menuType: null,
              orderTypeAlias: null,
            }),
          );
        }}
      />

      {/* Table Closed Popup */}
      <TableClosedPopup
        visible={showTableClosedPopup}
        onClose={handleTableClosedPopupClose}
      />

      {/* Pending Join Request Popup */}
      <ConfirmationPopup
        visible={!!selectedPendingUser}
        title={`${selectedPendingUser ? getAbbreviatedName(selectedPendingUser.name) : ''}`}
        message="wants to join your table"
        icon={<Icon_Profile width={100} height={85} />}
        titleStyle={{ fontSize: 20, fontFamily: 'Poppins-Regular', color: COLORS.black }}
        descriptionStyle={{ fontSize: 20, fontFamily: 'Poppins-Regular', color: COLORS.black }}
        confirmText="Approve"
        cancelText="Reject"
        cancelVariant="outline"
        onClose={() => {
          if (selectedPendingUser) handleRejectUser(selectedPendingUser);
          setSelectedPendingUser(null);
        }}
        onConfirm={() => {
          if (selectedPendingUser) handleApproveUser(selectedPendingUser);
          setSelectedPendingUser(null);
        }}
      />

      {/* Quick Order Confirmation Popup */}
      <ConfirmationPopup
        visible={showQuickOrderConfirm}
        title="Quick Order"
        message="Are you sure you want to quick order?"
        confirmText="Yes"
        cancelText="No"
        cancelVariant="outline"
        onClose={() => setShowQuickOrderConfirm(false)}
        onConfirm={() => {
          setShowQuickOrderConfirm(false);
          const itemUuids = myNewItems.map(item => item.uuid);
          socketInstance.emit('message', {
            type: 'setItemsQuickOrder',
            data: {
              tableName: userState.branchTable,
              itemUuids,
            },
          });
        }}
      />
    </View>
  );
};

export default TableScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header
  headerContainer: {
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING.horizontal,
    backgroundColor: COLORS.white,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.SUB_HEADLINE,
    color: COLORS.darkColor,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerIconButton: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Main content
  mainContent: {
    flex: 1,
    overflow: 'hidden',
  },
  // Users row
  usersRow: {
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  usersScrollContent: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    gap: 10,
    alignItems: 'center',
  },
  userBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  kingAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4E148518',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  initialsAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.darkColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyAvatarLarge: {
    width: 32,
    height: 32,
    borderRadius: 18,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
  },
  userBubbleName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: COLORS.darkColor,
  },
  userBubbleMe: {
    backgroundColor: COLORS.lightColor,
    borderColor: '#D9D9D9',
  },
  userBubbleNameMe: {
    color: COLORS.darkColor,
    fontFamily: 'Poppins-SemiBold',
  },
  // Section styles
  sectionContainer: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.HEADLINE,
    color: COLORS.darkColor,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
  },
  sectionCount: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.foregroundColor,
  },
  itemWrapper: {
    // wrapper for my items
  },
  myItemsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  myItemsEmptyContainer: {
    backgroundColor: `${COLORS.secondaryColor}10`,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginVertical: 8,
  },
  myItemsEmptyText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.secondaryColor,
    fontSize: 13,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.foregroundColor,
    opacity: 0.7,
  },
  // Table items group
  tableUserCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  tableUserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tableUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  tableUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 18,
  },
  tableUserInitials: {
    width: 32,
    height: 32,
    borderRadius: 18,
    backgroundColor: COLORS.secondaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableUserKingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 18,
    backgroundColor: '#4E148518',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableUserInitialsText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
  },
  tableUserName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.darkColor,
  },
  tableUserItemCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.foregroundColor,
  },
  tableUserRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableUserTotal: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.secondaryColor,
  },
  chevron: {
    fontSize: 16,
    color: COLORS.primaryColor,
    fontWeight: 'bold',
  },
  expandedItemsContainer: {
    paddingLeft: 8,
  },
  tableItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  tableItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  tableItemName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.darkColor,
  },
  tableItemQuantity: {
    color: COLORS.primaryColor,
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
  tableItemDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.foregroundColor,
  },
  tableItemPrice: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.secondaryColor,
  },
  // Action bar
  actionBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    gap: 10,
  },
  actionBarRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBarOutlineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primaryColor,
  },
  actionBarOutlineText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: COLORS.primaryColor,
  },
  actionBarColumn: {
    flexDirection: 'column',
    gap: 12,
  },
  pendingDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primaryColor,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyStateIcons: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.TITLE,
    marginTop: 2,
    fontFamily: 'Poppins-Medium',

    color: COLORS.darkColor,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.foregroundColor,
    textAlign: 'center',
  },
  readyActiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.secondaryColor}15`,
    borderRadius: 8,
    paddingVertical: 14,
    gap: 10,
  },
  readyCheckmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 14,
    backgroundColor: COLORS.secondaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyActiveText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.secondaryColor,
  },
  // Kitchen (checkout-style) item styles
  kitchenItemContainer: {
    paddingVertical: 10,
  },
  kitchenItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.foregroundColor}15`,
  },
  kitchenItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kitchenItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 6,
  },
  kitchenItemQuantity: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.darkColor,
    minWidth: 18,
  },
  kitchenItemName: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalizeFont(12),
    lineHeight: 23,
    color: COLORS.darkColor,
    flex: 1,
  },
  kitchenItemPrice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.foregroundColor,
    marginLeft: 8,
  },
  kitchenModifierGroup: {
    marginTop: 4,
    marginLeft: 38,
  },
  kitchenModifierGroupName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: COLORS.darkColor,
  },
  kitchenModifierItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kitchenModifierItemQuantity: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: COLORS.darkColor,
    minWidth: 14,
  },
  kitchenModifierItemName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.foregroundColor,
    flex: 1,
  },
  kitchenModifierItemPrice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.secondaryColor,
  },
  kitchenItemNote: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.foregroundColor,
    marginTop: 4,
    marginLeft: 24,
  },
  newItemsSubHeader: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: COLORS.darkColor,
    marginTop: 12,
    marginBottom: 4,
  },
  quickOrderBadgeText: {
    fontSize: 11,
    color: COLORS.primaryColor,
    fontFamily: 'Poppins-SemiBold',
  },
});
