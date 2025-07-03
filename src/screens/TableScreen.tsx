import {
  StyleSheet,
  Text,
  View,
  FlatList,
  BackHandler,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import {
  COLORS,
  DINEIN_SOCKET_URL,
  DRIVER_SOCKET_URL,
  SCREEN_PADDING,
  TYPOGRAPHY,
} from '../theme';
import FastImage from 'react-native-fast-image';
import BottomSheet from '@gorhom/bottom-sheet';
import TableUsersList from '../components/DineIn/TableUsersList';
import OrderedItemsList from '../components/DineIn/OrderedItemsList';
import WaiterInstructionsSheet, {
  InstructionType,
} from '../components/Sheets/DineIn/WaiterInstructionsSheet';
import WelcomePopup from '../components/DineIn/WelcomePopup';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DineInStackParamList } from '../navigation/DineInStack';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import DynamicSheet from '../components/Sheets/DynamicSheet';
import SocketService from '../utils/SocketService';
import { useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '../store/store';
import {
  setBranchTable,
  setOrderType,
  setSessionTableId,
} from '../store/slices/userSlice';
import { RootStackParamList } from '../navigation/NavigationStack';
import Icon_Alert from '../../assets/SVG/Icon_Alert';
import Button from '../components/UI/Button';
import Icon_Sign_Out from '../../assets/SVG/Icon_Sign_Out';
import KingActionsSheet, {
  Action,
} from '../components/Sheets/DineIn/KingActionsSheet';
import { user } from '../api/userApi';

export type OrderedItem = {
  id: number;
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
  disabled: boolean;
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
  isPending: boolean;
};

export type TableUsers = Record<string, TableUser>;

export type TableWaiter = {
  id: number;
  name: string;
  image_url: string | null;
  isOnline: boolean;
};

export type TableWaiters = Record<string, TableWaiter>;

const waiterInstructions = [
  { id: 1, text: 'Need more napkins' },
  { id: 2, text: 'Request water refill' },
  { id: 3, text: 'Ask for the check' },
  { id: 4, text: 'Need assistance with menu' },
  { id: 5, text: 'Request another set of utensils' },
];

type TableScreenNavigationProp = NativeStackNavigationProp<
  DineInStackParamList,
  'Table'
>;

const kingActions: Action[] = [
  { id: 1, key: 'remove-from-table', text: 'Remove from table' },
  { id: 2, key: 'make-table-admin', text: 'Make table admin' },
  // Add more actions as needed
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
  const [isTableLocked, setIsTableLocked] = useState(false);

  const handleInstructionSelect = (instruction: InstructionType) => {
    // In a real app, this would send the instruction to the backend
    console.log(`Sending instruction: ${instruction.text}`);
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

  const joinTable = () => {
    if (!userState) return;
    const socketInstance = SocketService.getInstance();
    console.log('sending table session', userState.tableSessionId);
    console.log('sending table name', userState.branchTable);
    socketInstance.emit(
      'message',
      {
        type: 'UserJoinTable',
        data: {
          tableName: userState.branchTable,
          user: {
            id: userState.id,
            name: userState.name,
            image_url: userState.image_url,
          },
          session_table: userState.tableSessionId,
        },
      },
      response => {
        console.log('hello', response);
        console.log('tableSessionId', userState.tableSessionId);
        console.log('server Session', response.session_table);

        if (response.success) {
          setShowWelcomePopup(true);
          dispatch(setSessionTableId(response.session_table));
          console.log('new Tablesession', response.session_table);
          return;
        } else {
          dispatch(
            setOrderType({
              menuType: null,
              orderTypeAlias: null,
            }),
          );
          dispatch(setSessionTableId(null));
          console.log('cant join the table:', response);
        }
      },
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

    // join Table
    joinTable();

    // listen for updates
    socketInstance.on('tableUpdate', message1 => {
      // console.log('tableUpdate ', message);
      const message = {
        "waiters": {},
        "users": {
          "28": {
            "id": 28,
            "name": "Serge Massaad",
            "image_url": "https://d3u6vq5nc7ocvb.cloudfront.net/users/users_utYt0QhGbx.jpg",
            "socketId": "xgwv3QNT62KMvV2dAAAZ",
            "isOnline": true,
            "isKing": true,
            "isPending": false
          },
          "31": {
            "id": 31,
            "name": "BL Test Phase 1",
            "image_url": "http://picsum.photos/500",
            "socketId": "dIiBwfGFs17o0WJTAAAC",
            "isOnline": true,
            "isKing": false,
            "isPending": true
          }
        },
        "activity": [],
        "items": {
          "ec47018b-b616-463e-bb5e-58b9d6445ef9": {
            "id": 1857,
            "name": "CAJUN CHICKEN TAQUITOS",
            "image_url": "https://d3vfh4cqgoixck.cloudfront.net/items/items_GeqIplzwK9.webp",
            "price": 5.25,
            "symbol": "$",
            "quantity": 1,
            "special_instruction": "",
            "modifier_groups": [],
            "epoch": 1750420919984,
            "status": "pending",
            "deleted": 1,
            "added_by": {
              "id": 28,
              "name": "Serge Massaad",
              "image_url": "https://d3u6vq5nc7ocvb.cloudfront.net/users/users_utYt0QhGbx.jpg",
              "type": "user"
            },
            "uuid": "ec47018b-b616-463e-bb5e-58b9d6445ef9",
            "disabled": false,
          },
          "dd577b21-e04a-4a2b-b883-f294551aa01a": {
            "id": 1857,
            "name": "CAJUN CHICKEN TAQUITOS",
            "image_url": "https://d3vfh4cqgoixck.cloudfront.net/items/items_GeqIplzwK9.webp",
            "price": 5.25,
            "symbol": "$",
            "quantity": 1,
            "special_instruction": "",
            "modifier_groups": [
              {
                "id": 777,
                "name": "Remove Ingredients",
                "modifier_groups_id": 83,
                "modifier_items": [
                  {
                    "id": 3192,
                    "name": "Cheese Spices",
                    "price": null,
                    "quantity": 1,
                    "plu": "20168",
                    "modifier_items_id": 149
                  }
                ]
              },
              {
                "id": 778,
                "name": "Choose Dip",
                "modifier_groups_id": 86,
                "modifier_items": [
                  {
                    "id": 3193,
                    "name": "Cajun Dip",
                    "price": null,
                    "quantity": 2,
                    "plu": "3977",
                    "modifier_items_id": 128
                  }
                ]
              }
            ],
            "epoch": 1750422688096,
            "status": "pending",
            "deleted": 0,
            "added_by": {
              "id": 28,
              "name": "Serge Massaad",
              "image_url": "https://d3u6vq5nc7ocvb.cloudfront.net/users/users_utYt0QhGbx.jpg",
              "type": "user"
            },
            "disabled": false,
          }
        },
        "session_table": "1750420670573",
        "isLocked": false
      }
      if (message.users) {
        setTableUsers(message.users);
      }
      if (message.items) {
        setOrderedItems(message.items as Record<string, OrderedItem>);
      }

      if (message.isLocked) {
        setIsTableLocked(message.isLocked)
      }

      if (message.waiters) {
        setTableWaiters(message.waiters);
      }
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
    kingActionsSheetRef.current?.snapToIndex(0);
  };

  const handleKingActionSelect = (action: Action) => {
    if (!selectedUserForKingActions) return;
    switch (action.key) {
      case 'remove-from-table':
        break;
      case 'make-table-admin':
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

  console.log(filteredOrderedItems);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <FlatList
          data={Object.values(tableWaiters)}
          renderItem={renderWaiterItem}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.waitersList}
          ItemSeparatorComponent={() => <View style={styles.waiterSeparator} />}
        />
        <TouchableOpacity onPress={handleLeaveTable}>
          <Icon_Sign_Out color={COLORS.white} />
        </TouchableOpacity>
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
            users={tableUsers}
            currentUser={
              currentUser.id ? tableUsers?.[currentUser.id] : undefined
            } // current user to determine if the y re king
            onUserPress={handleUserPress}
          />
        </View>
        <OrderedItemsList items={filteredOrderedItems} users={tableUsers} isTableLocked={isTableLocked} />
        <View style={styles.orderButtonContainer}>
          <Button onPress={handleOrderPress}>Order</Button>
        </View>
      </Animated.View>

      {/* Waiter Instructions Sheet */}
      {selectedWaiterId && tableWaiters?.[selectedWaiterId] && (
        <WaiterInstructionsSheet
          waiter={tableWaiters?.[selectedWaiterId]}
          instructions={waiterInstructions}
          onSelectInstruction={handleInstructionSelect}
          sheetRef={waiterSheetRef}
        />
      )}

      {/* King Actions Popup */}
      {selectedUserForKingActions && (
        <KingActionsSheet
          user={selectedUserForKingActions}
          actions={kingActions}
          onSelectAction={handleKingActionSelect}
          sheetRef={kingActionsSheetRef}
        />
      )}

      {/* Welcome Popup */}
      <WelcomePopup
        visible={showWelcomePopup}
        onClose={() => setShowWelcomePopup(false)}
        onViewMenu={handleViewMenu}
        waiter={Object.values(tableWaiters)[0] || undefined}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING.horizontal,
    gap: 10,
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
  },
});
