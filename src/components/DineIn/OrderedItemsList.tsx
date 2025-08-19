import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { DineInStackParamList } from '../../navigation/DineInStack';
import { OrderedItem, OrderedItems, TableUsers } from '../../screens/TableScreen';
import { RootState } from '../../store/store';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../../theme';
import SocketService from '../../utils/SocketService';
import OrderedItemCmp from './OrderedItem';

type Props = {
  items: OrderedItems;
  users: TableUsers;
  contentContainerStyle?: ViewStyle;
  isTableLocked: boolean;
};

type NavigationProp = NativeStackNavigationProp<DineInStackParamList>;

const OrderedItemsList = ({ items, users, contentContainerStyle, isTableLocked }: Props) => {
  const navigation = useNavigation<NavigationProp>();
  const socketInstance = SocketService.getInstance();
  const userState = useSelector((state: RootState) => state.user);

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
          const isItemDisabled = isTableLocked || item.is_disabled || (orderedByUser?.id !== userState.id && !isCurrentUserKing)
          return (
            <OrderedItemCmp
              item={item}
              orderedByUser={orderedByUser}
              isDisabled={isItemDisabled}
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
    flex: 1,
    backgroundColor: COLORS.white,
  },
  sectionTitle: {
    ...TYPOGRAPHY.HEADLINE,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
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
