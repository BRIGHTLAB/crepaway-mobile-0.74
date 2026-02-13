import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Icon_Arrow_Right from '../../assets/SVG/Icon_Arrow_Right';
import Icon_Location from '../../assets/SVG/Icon_Location';
import Icon_Motorcycle from '../../assets/SVG/Icon_Motorcycle';
import Icon_Spine from '../../assets/SVG/Icon_Spine';
import Icon_Star from '../../assets/SVG/Icon_Star';
import { OrderItem, OrderListItem, useGetOrdersQuery } from '../api/ordersApi';
import HeaderShadow from '../components/HeaderShadow';
import Item from '../components/Order/Item';
import OrderRatingSheet, { OrderRatingSheetRef } from '../components/Sheets/OrderRatingSheet';
import Button from '../components/UI/Button';
import { DeliveryTakeawayStackParamList } from '../navigation/DeliveryTakeawayStack';
import { COLORS, SCREEN_PADDING } from '../theme';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

const OrderComponent = React.memo(
  ({
    item,
    onTrackOrder,
    onRateOrder,
    // onReorder,
    sectionTitle,
  }: {
    item: OrderListItem;
    onTrackOrder: (order: OrderListItem) => void;
    onRateOrder: (order: OrderListItem) => void;
    // onReorder: (order: OrderListItem) => void;
    sectionTitle: string;
  }) => {
    const navigation =
      useNavigation<
        NativeStackNavigationProp<DeliveryTakeawayStackParamList>
      >();

    const renderOrderItem = useCallback(
      ({ item: orderItem }: { item: OrderItem }) => (
        <Item item={orderItem} />
      ),
      [],
    );

    const keyExtractor = useCallback(
      (orderItem: OrderItem) => orderItem.uuid,
      [],
    );

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
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon_Motorcycle color={COLORS.darkColor} />
            <View style={{ flexDirection: 'column', gap: 0 }}>
              <Text style={styles.orderNumber}>{item.order_number}</Text>
              <Text style={styles.orderDate}>
                {item.status === 'delivered' ? 'Delivered on ' : 'Ordered at '}
                {/* TODO we need to add delivered at in the backend */}
                {dayjs(item.status === 'delivered' ? item.delivered_at : item.order_date).format('dddd, MMM D, YYYY, hh:mm A')}
              </Text>
            </View>
          </View>
          <Icon_Arrow_Right
            width={20}
            height={20}
            color={COLORS.foregroundColor}
          />
        </TouchableOpacity>

        {/* Items Summary */}
        <View style={styles.itemsSummary}>
          {item.items.slice(0, 3).map((orderItem, index) => (
            <Text key={orderItem.uuid || index} style={styles.itemSummaryText} numberOfLines={1}>
              {orderItem.quantity}× {orderItem.name}
            </Text>
          ))}
          {item.items.length > 3 && (
            <Text style={styles.moreItemsText}>
              +{item.items.length - 3} other item{item.items.length - 3 > 1 ? 's' : ''}...
            </Text>
          )}
        </View>

        {/* Total Amount */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {item.currency?.symbol ?? ''} {item.total}
          </Text>
        </View>

        {/* <TouchableOpacity onPress={() => console.log('pressed')}>
          <Text>Test</Text>
        </TouchableOpacity> */}

        {sectionTitle === 'Past Orders' && (
          <Button
            iconPosition="left"
            icon={<Icon_Star width={20} height={20} color={COLORS.white} />}
            onPress={() => onRateOrder(item)}>
            {item.food_rating ? 'View Rating' : 'Rate Order'}
          </Button>
        )}
        {sectionTitle === 'Ongoing Orders' && item.status !== 'delivered' && (
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
    useNavigation<NativeStackNavigationProp<DeliveryTakeawayStackParamList>>();
  const isFocused = useIsFocused();

  const {
    data: orders,
    isLoading: loading,
    refetch,
    isFetching,
  } = useGetOrdersQuery(undefined, {
    pollingInterval: isFocused ? 2000 : undefined,
  });

  const { refreshing, onRefresh } = usePullToRefresh({
    refetch,
    isFetching,
    isLoading: loading,
  });

  const ratingSheetRef = useRef<OrderRatingSheetRef>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderListItem | null>(null);

  const handleTrackOrder = useCallback((order: OrderListItem) => {
    navigation.navigate('TrackOrder', {
      orderId: order.id,
      order_type: order.order_type,
      addressLatitude: order.address?.latitude,
      addressLongitude: order.address?.longitude,
    });
  }, []);


  const handleRateOrder = useCallback((order: OrderListItem) => {
    setSelectedOrder(order);
    ratingSheetRef.current?.expand();
  }, []);

  const handleCloseRatingSheet = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  // const handleReorder = useCallback((order: Order) => {
  //   // console.log('Reorder:', order.id);
  // }, []);

  const renderOrder = useCallback(
    ({ item, section }: { item: OrderListItem; section: { title: string } }) => {
      return (
        <OrderComponent
          item={item}
          onTrackOrder={handleTrackOrder}
          onRateOrder={handleRateOrder}
          // onReorder={handleReorder}
          sectionTitle={section.title}
        />
      );
    },
    [handleTrackOrder, handleRateOrder],
  );

  const keyExtractor = useCallback((item: OrderListItem) => item.id.toString(), []);

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
    () => {
      return (
        <View style={styles.loadingContainer}>
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item>
              {/* Section Title */}
              <SkeletonPlaceholder.Item
                width={160}
                height={24}
                borderRadius={4}
                marginBottom={10}
                marginTop={16}
              />

              {[...Array(3)].map((_, index) => (
                <SkeletonPlaceholder.Item
                  key={index}
                  backgroundColor={COLORS.lightColor}
                  borderRadius={12}
                  padding={16}
                  marginBottom={8}
                  gap={10}>
                  {/* Order Header */}
                  <SkeletonPlaceholder.Item
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    marginBottom={8}>
                    <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" gap={6}>
                      <SkeletonPlaceholder.Item width={24} height={24} borderRadius={12} />
                      <SkeletonPlaceholder.Item>
                        <SkeletonPlaceholder.Item width={120} height={16} borderRadius={4} marginBottom={4} />
                        <SkeletonPlaceholder.Item width={200} height={10} borderRadius={4} />
                      </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder.Item>
                    <SkeletonPlaceholder.Item width={20} height={20} borderRadius={10} />
                  </SkeletonPlaceholder.Item>

                  {/* Items Summary */}
                  <SkeletonPlaceholder.Item gap={4} paddingVertical={8}>
                    <SkeletonPlaceholder.Item width="75%" height={12} borderRadius={4} />
                    <SkeletonPlaceholder.Item width="60%" height={12} borderRadius={4} />
                    <SkeletonPlaceholder.Item width="45%" height={12} borderRadius={4} />
                  </SkeletonPlaceholder.Item>

                  {/* Total Row */}
                  <SkeletonPlaceholder.Item
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    paddingTop={12}
                    borderTopWidth={1}
                    borderTopColor="#F0F0F0">
                    <SkeletonPlaceholder.Item width={50} height={16} borderRadius={4} />
                    <SkeletonPlaceholder.Item width={90} height={16} borderRadius={4} />
                  </SkeletonPlaceholder.Item>

                  {/* Action Button */}
                  <SkeletonPlaceholder.Item width="100%" height={48} borderRadius={8} marginTop={8} />
                </SkeletonPlaceholder.Item>
              ))}
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        </View>
      );
    },
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryColor}
            colors={[COLORS.primaryColor]}
          />
        }
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
    refreshing,
    onRefresh,
  ]);

  return (
    <View style={styles.container}>

      {/* custom header inside the page */}
      <HeaderShadow />

      <View style={{ paddingHorizontal: SCREEN_PADDING.horizontal, flex: 1 }}>
        {renderContent()}
      </View>

      <OrderRatingSheet
        ref={ratingSheetRef}
        onClose={handleCloseRatingSheet}
        orderId={selectedOrder?.id ?? 0}
        rating={selectedOrder?.food_rating ? {
          food_rating: selectedOrder.food_rating,
          experience_rating: selectedOrder.experience_rating || 0,
          service_rating: selectedOrder.service_rating || 0,
          review_comment: selectedOrder.review_comment,
        } : null}
        disabled={!!selectedOrder?.food_rating}
      />
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  loadingContainer: {
    flex: 1,
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
    backgroundColor: COLORS.card,
    gap: 10,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderColor,

    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.darkColor,
  },
  totalValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.primaryColor,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: COLORS.primaryColor,
  },
  itemsSummary: {
    gap: 4,
    paddingVertical: 8,
  },
  itemSummaryText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.darkColor,
  },
  moreItemsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.foregroundColor,
    fontStyle: 'italic',
  },
});
