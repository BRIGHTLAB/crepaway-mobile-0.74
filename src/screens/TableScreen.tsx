import BottomSheet, { TouchableOpacity } from '@gorhom/bottom-sheet';
import {
  useFocusEffect,
  useNavigation
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon_Cart from '../../assets/SVG/Icon_Cart';
import Icon_Dine_In from '../../assets/SVG/Icon_Dine_In';
import Icon_Sign_Out from '../../assets/SVG/Icon_Sign_Out';
import BannedPopup from '../components/DineIn/BannedPopup';
import OrderedItemsList from '../components/DineIn/OrderedItemsList';
import TableClosedPopup from '../components/DineIn/TableClosedPopup';
import TableUsersList from '../components/DineIn/TableUsersList';
import WelcomePopup from '../components/DineIn/WelcomePopup';
import KingActionsSheet, {
  Action,
} from '../components/Sheets/DineIn/KingActionsSheet';
import WaiterInstructionsSheet from '../components/Sheets/DineIn/WaiterInstructionsSheet';
import Button from '../components/UI/Button';
import { DineInStackParamList } from '../navigation/DineInStack';
import { setIsTableLocked } from '../store/slices/dineInSlice';
import {
  setBranchTable,
  setOrderType,
  setSessionTableId,
} from '../store/slices/userSlice';
import store, { RootState } from '../store/store';
import {
  COLORS,
  DINEIN_SOCKET_URL,
  SCREEN_PADDING,
  TYPOGRAPHY
} from '../theme';
import SocketService from '../utils/SocketService';

export type OrderedItem = {
  id: number;
  plu: string;
  name: string;
  image_url: string | null;
  quantity: number;
  price: number | null
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

type TableUpdateMessage = {
  users: TableUsers,
  waiters: TableWaiters,
  pendingJoinRequests: PendingJoinRequests,
  items: OrderedItems,
  isLocked: boolean,
  bannedUsers: TableBannedUsers;
}

type TableScreenNavigationProp = NativeStackNavigationProp<
  DineInStackParamList,
  'Table'
>;

const kingActions: Action[] = [
  { id: 1, key: 'remove-from-table', text: 'Remove from table' },
  { id: 2, key: 'make-table-admin', text: 'Make table admin' },
];


const TableScreen = () => {
  const dispatch = useDispatch();
  const waiterSheetRef = useRef<BottomSheet>(null);
  const dynamicSheetRef = useRef<BottomSheet>(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [selectedWaiterId, setSelectedWaiterId] = useState<number | null>(null);
  const [selectedUserForKingActions, setSelectedUserForKingActions] =
    useState<TableUser | null>(null);
  const kingActionsSheetRef = useRef<BottomSheet>(null);

  const currentUser = useSelector((state: RootState) => state.user);

  const navigation = useNavigation<TableScreenNavigationProp>();
  const userState = store.getState().user;
  const screenHeight = Dimensions.get('window').height;
  const translateY = useRef(new Animated.Value(screenHeight)).current;

  const [orderedItems, setOrderedItems] = useState<OrderedItems>({});
  const [tableUsers, setTableUsers] = useState<TableUsers>({});
  const [tableWaiters, setTableWaiters] = useState<TableWaiters>({});
  const [bannedUsers, setBannedUsers] = useState<TableBannedUsers>({});
  const [showBannedPopup, setShowBannedPopup] = useState(false);
  const [showTableClosedPopup, setShowTableClosedPopup] = useState(false);

  const isTableLocked = useSelector((state: RootState) => state.dineIn.isTableLocked);

  const [pendingJoinRequests, setPendingJoinRequests] = useState<PendingJoinRequests>({});

  const socketInstance = SocketService.getInstance();
  const { top, bottom } = useSafeAreaInsets();



  const handleInstructionSelect = (instruction: WaiterInstruction) => {
    // Emit table instruction event
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

    waiterSheetRef.current?.close();
  };

  const handleViewMenu = () => {
    setShowWelcomePopup(false);
    navigation.navigate('OrderStack');
    // navigation.navigate('Menu');
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
          return true; // Prevent default behavior
        },
      );

      // Cleanup function that runs when screen loses focus or unmounts
      return () => backHandler.remove();
    }, [dispatch]),
  );

  const handleLeaveTable = () => {
    if (!userState) return;

    const socketInstance = SocketService.getInstance();

    // Emit leave table event
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
      // response => {
      //   console.log('Left table response:', response);

      //   if (response.success) {
      //     // Reset session ID and order type in Redux store

      //   }
      // },
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
    // Animate out when component unmounts
    return () => {
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };
  }, []);

  // Watch for popup visibility changes
  useEffect(() => {
    if (!showWelcomePopup) {
      // Trigger entrance animation when popup is closed
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [showWelcomePopup]);



  useEffect(() => {
    // dynamicSheetRef.current?.expand();

    if (!userState) return;
    // connect to the socket
    const socketInstance = SocketService.getInstance();
    socketInstance.connect(DINEIN_SOCKET_URL, {
      authorization: `Bearer ${userState.jwt}` || '',
    });

    // listen for kicking this user
    socketInstance.on('userKicked', (message) => {
      console.log('userKicked ', message);
      dispatch(setSessionTableId(null));
      dispatch(setBranchTable(null));
      setShowWelcomePopup(false);
      setShowBannedPopup(true);
    })

    // listen for updates
    socketInstance.on('tableUpdate', (message: TableUpdateMessage) => {
      console.log('tableUpdate ', message);


      if (message.users) {
        setTableUsers(message.users);
      }

      if (message.items) {
        setOrderedItems(message.items as Record<string, OrderedItem>);
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
    });

    socketInstance.on('tableClosed', () => {
      dispatch(setSessionTableId(null));
      dispatch(setBranchTable(null));
      setShowWelcomePopup(false);
      setShowBannedPopup(false);
      setShowTableClosedPopup(true);
    });

    // return () => {
    //   socketInstance.disconnect();
    // };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (dynamicSheetRef.current) {
        setTimeout(() => {
          dynamicSheetRef.current?.expand();
        }, 100);
      }

      return () => { };
    }, []),
  );

  const handleUserPress = (user: TableUser) => {
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

    // Close the sheet
    kingActionsSheetRef.current?.close();
  };

  // Render waiter item for FlatList
  const renderWaiterItem = ({ item }: { item: TableWaiter }) => (
    <TouchableOpacity
      onPress={() => {
        console.log('selectedWAiterId', tableWaiters?.[item.id]);
        setSelectedWaiterId(item.id);
        waiterSheetRef.current?.expand();
      }}
      style={styles.waiterContainer}>
      <FastImage
        style={styles.waiterImage}
        source={{ uri: item.image_url || 'https://placehold.co/200x200/png' }}
      />
      <Text style={styles.waiterText}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Key extractor for FlatList

  // filter out the deleted = 1
  const filteredOrderedItems = Object.fromEntries(
    Object.entries(orderedItems).filter(([_, item]) => item.deleted === 0),
  );

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
    // Reset the order type and session after user acknowledges
    dispatch(
      setOrderType({
        menuType: null,
        orderTypeAlias: null,
      }),
    );
  };




  return (
    <View style={[styles.container, {
      paddingTop: top
    }]}>
      <View style={styles.headerContainer}>
        {(() => {
          const waiter = Object.values(tableWaiters)[0];
          if (!waiter) return <View style={{ flex: 1 }} />;

          const getInitials = (name: string) => {
            return name.split(' ').map(str => str.charAt(0).toUpperCase()).join('');
          };

          return (
            <TouchableOpacity
              onPress={() => {
                setSelectedWaiterId(waiter.id);
                setTimeout(() => {
                  waiterSheetRef.current?.expand();
                }, 100);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              {waiter?.image_url ? (
                <FastImage
                  source={{ uri: waiter.image_url }}
                  style={{ width: 44, height: 44, borderRadius: 22 }}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: COLORS.darkColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{
                    color: COLORS.white,
                    fontSize: 16,
                    fontWeight: 'bold',
                    fontFamily: 'Poppins-SemiBold',
                  }}>
                    {getInitials(waiter?.name || '')}
                  </Text>
                </View>
              )}
              <Text style={{ color: COLORS.white, fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>
                {waiter?.name}
              </Text>
            </TouchableOpacity>
          );
        })()}

        {/* Action icons */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={handleOrderPress}
            style={{ backgroundColor: COLORS.white, padding: 10, borderRadius: 27 }}>
            <Icon_Dine_In color="#7CB342" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Checkout')}
            style={{ backgroundColor: COLORS.white, padding: 10, borderRadius: 27 }}>
            <Icon_Cart color="#FF6D00" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLeaveTable}
            style={{ backgroundColor: COLORS.white, padding: 10, borderRadius: 27 }}>
            <Icon_Sign_Out color={COLORS.foregroundColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content View */}
      <Animated.View
        style={[
          styles.mainContent,
          {
            transform: [{ translateY }],
          },
        ]}>
        <View style={styles.usersListWrapper}>
          <TableUsersList
            pendingUsers={Object.fromEntries(
              Object.entries(pendingJoinRequests).map(
                ([key, { user }]) => [key, user]
              )
            )}
            users={tableUsers}
            bannedUsers={bannedUsers}
            currentUser={
              currentUser.id ? tableUsers?.[currentUser.id] : undefined
            } // current user to determine if the y re king
            onUserPress={handleUserPress}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
            onUnkickUser={handleUnkickUser}
          />
        </View>
        <OrderedItemsList items={filteredOrderedItems} users={tableUsers} waiters={tableWaiters} />
        <View style={styles.orderButtonContainer}>
          <Button onPress={handleOrderPress} disabled={isTableLocked}>Add Items</Button>
        </View>
      </Animated.View>

      {/* Waiter Instructions Sheet */}
      {(() => {
        const waiter = Object.values(tableWaiters)[0];
        const selectedWaiter = selectedWaiterId ? tableWaiters?.[selectedWaiterId] : waiter;
        if (!selectedWaiter) return null;
        return (
          <WaiterInstructionsSheet
            waiter={selectedWaiter}
            onSelectInstruction={handleInstructionSelect}
            ref={waiterSheetRef}
          />
        );
      })()}

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
          // Reset the order type and session after user acknowledges
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
    </View>
  );
};

export default TableScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryColor,
  },
  headerContainer: {
    flexDirection: 'row',
    height: 80,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING.horizontal,
    gap: 10,
  },
  headerTitle: {
    ...TYPOGRAPHY.HEADLINE,
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  waitersList: {},
  waiterSeparator: {
    width: 16,
  },
  waiterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  waiterImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  waiterText: {
    ...TYPOGRAPHY.BODY,
    color: 'white',
  },
  mainContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 70, // Space for the order button
    overflow: 'hidden', // Ensure content doesn't overflow the rounded corners
  },
  usersListWrapper: {
    backgroundColor: COLORS.white,
  },
  orderButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: `${COLORS.foregroundColor}20`,
    marginBottom: 10,
  },
  // Pending Screen Styles
  pendingContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  pendingContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  pendingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primaryColor}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pendingTitle: {
    ...TYPOGRAPHY.SUB_HEADLINE,
    color: COLORS.foregroundColor,
    textAlign: 'center',
    marginBottom: 16,
  },
  pendingSubtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.foregroundColor,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  pendingButtonContainer: {
    width: '100%',
  },
});