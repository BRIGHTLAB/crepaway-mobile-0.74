import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { DineInStackParamList } from '../../navigation/DineInStack';
import { OrderedItem, OrderedItems, TableUsers, TableWaiters } from '../../screens/TableScreen';
import { RootState } from '../../store/store';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../../theme';
import SocketService from '../../utils/SocketService';
import OrderedItemCmp from './OrderedItem';

type Props = {
  items: OrderedItems;
  users: TableUsers;
  waiters: TableWaiters;
  contentContainerStyle?: ViewStyle;
};

type NavigationProp = NativeStackNavigationProp<DineInStackParamList>;

const OrderedItemsList = ({ items, users, waiters, contentContainerStyle }: Props) => {
  const navigation = useNavigation<NavigationProp>();
  const socketInstance = SocketService.getInstance();
  const userState = useSelector((state: RootState) => state.user);
  const isTableLocked = useSelector((state: RootState) => state.dineIn.isTableLocked);

  // TODO ask chris if we can rely on the key of users (eza kenit hiye zeta l user id li ana 3ende yeha bel userState)
  const isCurrentUserKing = users?.[userState.id ?? '']?.isKing

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

  const handleDecreaseQuantity = (itemUuid: string, item: OrderedItem) => {
    const newQuantity = item.quantity - 1; // FIXED: Added missing semicolon
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

    console.log('sending to tableUpdate (DecreasingQuantity)', messageData);
    socketInstance.emit('message', {
      type: 'updateItem',
      data: messageData,
    });
  };

  const handleIncreaseQuantity = (itemUuid: string, item: OrderedItem) => {
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

    console.log(
      'sending to tableUpdate (IncreasingQuantity)',
      JSON.stringify(messageData, null, 2),
    );
    socketInstance.emit('message', {
      type: 'updateItem',
      data: messageData,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ordered Items</Text>
      <FlatList
        data={Object.entries(items).map(([key, value]) => ({
          ...value,
          uuid: key,
        }))}
        keyExtractor={item => item.uuid.toString()}
        renderItem={({ item }) => {
          const orderedByUser = Object.values(users).find(
            user => user.id === item.added_by.id,
          );
          const orderedByWaiter = item.added_by.type === 'waiter'
            ? Object.values(waiters).find(waiter => waiter.id === item.added_by.id)
            : undefined;
          const isItemDisabled = isTableLocked || item.is_disabled || (orderedByUser?.id !== userState.id && !isCurrentUserKing) || item.added_by.type === 'waiter'
          return (
            <OrderedItemCmp
              item={item}
              orderedByUser={orderedByUser}
              orderedByWaiter={orderedByWaiter}
              isDisabled={isItemDisabled}
              currentUserId={userState.id}
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
          );
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items ordered yet</Text>
          </View>
        )}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      />
    </View>
  );
};

export default OrderedItemsList;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    flex: 1,
    backgroundColor: COLORS.white,
  },
  sectionTitle: {
    ...TYPOGRAPHY.HEADLINE,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    color: COLORS.darkColor,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingBottom: 25,
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
});
