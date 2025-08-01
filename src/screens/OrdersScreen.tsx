import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import React, { useCallback, useMemo } from 'react';
import Button from '../components/UI/Button';
import Icon_Spine from '../../assets/SVG/Icon_Spine';
import Icon_Arrow_Right from '../../assets/SVG/Icon_Arrow_Right';
import Icon_Motorcycle from '../../assets/SVG/Icon_Motorcycle';
import Icon_Location from '../../assets/SVG/Icon_Location';
import Icon_Refresh from '../../assets/SVG/Icon_Refresh';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeliveryTakeawayStackParamList } from '../navigation/DeliveryTakeawayStack';
import Item from '../components/Order/Item';
import { Order, OrderItem, useGetOrdersQuery } from '../api/ordersApi';
import { COLORS, SCREEN_PADDING } from '../theme';
import { RootStackParamList } from '../navigation/NavigationStack';

const OrderComponent = React.memo(
  ({
    item,
    onTrackOrder,
    onReorder,
  }: {
    item: Order;
    onTrackOrder: (order: Order) => void;
    onReorder: (order: Order) => void;
  }) => {
    const navigation =
      useNavigation<
        NativeStackNavigationProp<DeliveryTakeawayStackParamList>
      >();

    const renderOrderItem = useCallback(
      ({ item }: { item: OrderItem }) => <Item item={item} />,
      [],
    );

    const keyExtractor = useCallback(
      (orderItem: OrderItem) => orderItem.uuid,
      [],
    );

    console.log('order item card', item);

    return (
      <View style={styles.orderContainer}>
        <TouchableOpacity
          style={styles.orderHeader}
          onPress={() =>
            navigation.navigate('OrderDetails', {
              id: item.id,
              order_type: item?.order_type,
            })
          }>
          <View
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
            <Icon_Motorcycle color={COLORS.darkColor} />
            <View style={{ flexDirection: 'column', gap: 0 }}>
              <Text style={styles.orderNumber}>{item.order_number}</Text>
              {item.status?.key === 'delivered' && (
                <Text style={styles.orderDate}>
                  Delivered on {new Date(item.order_date).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
          <Icon_Arrow_Right
            width={20}
            height={20}
            color={COLORS.foregroundColor}
          />
        </TouchableOpacity>
        <FlatList
          data={item.items}
          ItemSeparatorComponent={() => (
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#F0F0F0',
              }}
            />
          )}
          renderItem={renderOrderItem}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={5}
        />

        {item?.status?.key === 'delivered' ? (
          <Button
            iconPosition="left"
            icon={<Icon_Refresh color={'#FFF'} />}
            onPress={() => onReorder(item)}>
            Re-order
          </Button>
        ) : (
          <Button
            iconPosition="left"
            icon={<Icon_Location color={'#FFF'} />}
            onPress={() => onTrackOrder(item)}>
            Track Order
          </Button>
        )}
      </View>
    );
  },
);

const SectionTitle = React.memo(({ title }: { title: string }) => (
  <Text
    style={{
      textTransform: 'capitalize',
      fontFamily: 'Poppins-SemiBold',
      fontSize: 20,
      color: COLORS.darkColor,
      marginBottom: 10,
      marginTop: 10,
    }}>
    {title}
  </Text>
));

const OrdersScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    data: orders,
    isLoading: loading,
    refetch: fetchOrders,
  } = useGetOrdersQuery();

  const handleTrackOrder = useCallback((order: Order) => {
    navigation.navigate('HomeStack', {
      screen: 'TrackOrder',
      params: {
        orderId: order.id,
        order_type: order.order_type,
      },
    });
  }, []);

  const handleReorder = useCallback((order: Order) => {
    // console.log('Reorder:', order.id);
  }, []);

  const renderOrder = useCallback(
    ({ item }: { item: Order }) => {
      return (
        <OrderComponent
          item={item}
          onTrackOrder={handleTrackOrder}
          onReorder={handleReorder}
        />
      );
    },
    [handleTrackOrder, handleReorder],
  );

  const keyExtractor = useCallback((item: Order) => item.id.toString(), []);

  const EmptyState = useMemo(
    () => (
      <View style={styles.noOrdersContainer}>
        <Icon_Spine
          width={138}
          height={140}
          color={COLORS.primaryColor}
          style={{ marginBottom: 16 }}
        />
        <Text style={styles.noOrdersText}>No Orders Yet</Text>
        <Text style={styles.noOrdersSubText}>
          Explore our menu and make your first order !
        </Text>
        <Button
          style={{ marginTop: 16 }}
          onPress={() =>
            navigation.navigate('HomeStack', {
              screen: 'MenuItems',
            })
          }>
          Order Now
        </Button>
      </View>
    ),
    [navigation],
  );

  const LoadingState = useMemo(
    () => <Text style={styles.loadingText}>Loading orders...</Text>,
    [],
  );

  const allOrdersSections = useMemo(() => {
    if (!orders) return [];

    return [
      {
        title: 'Ongoing Orders',
        data: orders.ongoing.length > 0 ? orders.ongoing : [],
      },
      {
        title: 'Past Orders',
        data: orders.history.length > 0 ? orders.history : [],
      },
    ].filter(section => section.data.length > 0);
  }, [orders]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <SectionTitle title={section.title} />
    ),
    [],
  );

  const renderContent = useCallback(() => {
    if (loading) {
      return LoadingState;
    }

    if (!orders) {
      return EmptyState;
    }

    if (allOrdersSections.length === 0) {
      return EmptyState;
    }

    return (
      <SectionList
        sections={allOrdersSections}
        keyExtractor={keyExtractor}
        renderItem={renderOrder}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.ordersList}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={EmptyState}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={5}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => <View style={{ height: 16 }} />}
        ListFooterComponent={() => (
          <View style={{ height: SCREEN_PADDING.vertical }} />
        )}
      />
    );
  }, [
    loading,
    orders,
    allOrdersSections,
    renderOrder,
    renderSectionHeader,
    keyExtractor,
    EmptyState,
    LoadingState,
  ]);

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: SCREEN_PADDING.horizontal, flex: 1 }}>
        {renderContent()}
      </View>
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightColor,
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrdersText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 32,
    color: COLORS.darkColor,
  },
  noOrdersSubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.foregroundColor,
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: COLORS.foregroundColor,
  },
  ordersList: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  orderContainer: {
    backgroundColor: 'white',
    gap: 10,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderNumber: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.darkColor,
  },
  orderDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: COLORS.foregroundColor,
  },
  orderStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  orderStatus: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  orderTotal: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.darkColor,
  },
});
