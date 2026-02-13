import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import React, { useCallback } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Icon_Calendar from '../../assets/SVG/Icon_Calendar';
import Icon_Delivery from '../../assets/SVG/Icon_Delivery';
import Icon_Driver_Id from '../../assets/SVG/Icon_Driver_Id';
import Icon_Location from '../../assets/SVG/Icon_Location';
import Icon_Promo from '../../assets/SVG/Icon_Promo';
import { Order, OrderItem, useGetOrderQuery } from '../api/ordersApi';
import TotalSection from '../components/Menu/TotalSection';
import Button from '../components/UI/Button';
import { DeliveryTakeawayStackParamList, OrdersStackParamList } from '../navigation/DeliveryTakeawayStack';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../theme';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { formatNumberWithCommas } from '../utils/formatNumberWithCommas';

type OrderDetailsRouteProp = RouteProp<OrdersStackParamList, 'OrderDetails'>;

const InfoDisplay = ({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
}) => (
  <View
    style={{
      gap: 10,
      alignItems: 'center',
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
      paddingVertical: 16,
    }}>
    {icon && <View>{icon}</View>}
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 12,
          fontFamily: 'Poppins',
          color: COLORS.darkColor,
        }}>
        {title}
      </Text>
      <Text
        style={{
          fontSize: 12,
          fontFamily: 'Poppins',
          color: COLORS.foregroundColor,
        }}>
        {description}
      </Text>
    </View>
  </View>
);

// Simplified order item display without image and description
const OrderItemDisplay = ({
  item,
  symbol,
  isLastItem,
}: {
  item: OrderItem;
  symbol?: string;
  isLastItem?: boolean;
}) => {
  return (
    <View
      style={{
        borderBottomWidth: isLastItem ? 0 : 1,
        borderBottomColor: '#F0F0F0',
        paddingVertical: 12,
      }}>
      {/* Item name and price */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              fontSize: 14,
              color: COLORS.darkColor,
            }}>
            {item.quantity}x {item.name}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            fontSize: 14,
            color: COLORS.secondaryColor,
          }}>
          {symbol || item.symbol} {formatNumberWithCommas(Number(item.total_price))}
        </Text>
      </View>

      {/* Modifier Groups */}
      {item.modifier_groups && item.modifier_groups.length > 0 && (
        <View style={{ marginTop: 6, marginLeft: 16 }}>
          {item.modifier_groups.map(group => (
            <View key={group.id} style={{ marginBottom: 4 }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 11,
                  color: COLORS.darkColor,
                }}>
                {group.name}:
              </Text>
              {group.modifier_items.map(modItem => (
                <View
                  key={modItem.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: 11,
                      color: COLORS.foregroundColor,
                      flex: 1,
                    }}>
                    • {modItem.name}{' '}
                    {modItem.quantity > 1 ? `x${modItem.quantity}` : ''}
                  </Text>
                  {modItem.price && modItem.price > 0 && (
                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        fontSize: 11,
                        color: COLORS.secondaryColor,
                      }}>
                      +{modItem.symbol || symbol || item.symbol} {modItem.price}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Special Instruction */}
      {item.special_instruction && (
        <View style={{ marginTop: 6, marginLeft: 16 }}>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: 11,
              color: COLORS.foregroundColor,
              fontStyle: 'italic',
            }}>
            Note: {item.special_instruction}
          </Text>
        </View>
      )}
    </View>
  );
};

const OrderDetailsScreen = () => {
  const route = useRoute<OrderDetailsRouteProp>();
  const orderId = route.params?.id || 0;
  const orderType = route.params?.order_type || 'delivery';

  const {
    data: order,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetOrderQuery(orderId, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const navigation =
    useNavigation<NativeStackNavigationProp<DeliveryTakeawayStackParamList>>();

  const { refreshing, onRefresh } = usePullToRefresh({
    refetch,
    isFetching,
    isLoading,
  });

  console.log('order.address?.latitude', order);
  const handleTrackOrder = useCallback((order: Order) => {
    navigation.navigate('TrackOrder', {
      orderId: order.id,
      order_type: order.order_type,
      addressLatitude: order.address?.latitude,
      addressLongitude: order.address?.longitude,
    });
  }, []);

  if (isLoading) {
    return (
      <ScrollView style={styles.container}>
        <SkeletonPlaceholder>
          <SkeletonPlaceholder.Item gap={16}>
            {/* Order Number */}
            <SkeletonPlaceholder.Item width={180} height={24} borderRadius={4} />

            {/* Order Info Card */}
            <SkeletonPlaceholder.Item
              backgroundColor={COLORS.white}
              paddingHorizontal={16}
              borderRadius={8}>
              {[...Array(6)].map((_, index) => (
                <SkeletonPlaceholder.Item
                  key={index}
                  flexDirection="row"
                  alignItems="center"
                  gap={10}
                  paddingVertical={16}
                  borderBottomWidth={index < 5 ? 1 : 0}
                  borderBottomColor="#F0F0F0">
                  <SkeletonPlaceholder.Item width={24} height={24} borderRadius={12} />
                  <SkeletonPlaceholder.Item flex={1}>
                    <SkeletonPlaceholder.Item
                      width={index % 2 === 0 ? '50%' : '40%'}
                      height={12}
                      borderRadius={4}
                      marginBottom={6}
                    />
                    <SkeletonPlaceholder.Item
                      width={index % 3 === 0 ? '85%' : index % 3 === 1 ? '70%' : '75%'}
                      height={12}
                      borderRadius={4}
                    />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder.Item>
              ))}
            </SkeletonPlaceholder.Item>

            {/* Order Items Card */}
            <SkeletonPlaceholder.Item
              backgroundColor={COLORS.white}
              paddingHorizontal={16}
              borderRadius={8}>
              {/* Section Title */}
              <SkeletonPlaceholder.Item
                paddingVertical={12}
                borderBottomWidth={1}
                borderBottomColor="#F0F0F0">
                <SkeletonPlaceholder.Item width={110} height={16} borderRadius={4} />
              </SkeletonPlaceholder.Item>
              {/* Order Items */}
              {[...Array(3)].map((_, index) => (
                <SkeletonPlaceholder.Item
                  key={index}
                  paddingVertical={12}
                  borderBottomWidth={index < 2 ? 1 : 0}
                  borderBottomColor="#F0F0F0">
                  <SkeletonPlaceholder.Item
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center">
                    <SkeletonPlaceholder.Item
                      width={index === 0 ? '55%' : index === 1 ? '65%' : '45%'}
                      height={14}
                      borderRadius={4}
                    />
                    <SkeletonPlaceholder.Item width={70} height={14} borderRadius={4} />
                  </SkeletonPlaceholder.Item>
                  {/* Modifier placeholder for first item */}
                  {index === 0 && (
                    <SkeletonPlaceholder.Item marginTop={6} marginLeft={16}>
                      <SkeletonPlaceholder.Item width="35%" height={11} borderRadius={4} marginBottom={4} />
                      <SkeletonPlaceholder.Item width="25%" height={11} borderRadius={4} />
                    </SkeletonPlaceholder.Item>
                  )}
                </SkeletonPlaceholder.Item>
              ))}
            </SkeletonPlaceholder.Item>

            {/* Total Section */}
            <SkeletonPlaceholder.Item marginBottom={50}>
              <SkeletonPlaceholder.Item
                backgroundColor={COLORS.white}
                paddingHorizontal={16}
                borderRadius={8}
                paddingVertical={12}>
                {['Subtotal', 'Delivery', 'Points', 'Total'].map(
                  (label, index) => (
                    <SkeletonPlaceholder.Item
                      key={label}
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      paddingVertical={8}
                      borderTopWidth={index === 3 ? 1 : 0}
                      borderTopColor="#F0F0F0"
                      marginTop={index === 3 ? 4 : 0}>
                      <SkeletonPlaceholder.Item
                        width={index === 3 ? 60 : index === 2 ? 110 : 80}
                        height={index === 3 ? 16 : 14}
                        borderRadius={4}
                      />
                      <SkeletonPlaceholder.Item
                        width={index === 2 ? 60 : 75}
                        height={index === 3 ? 16 : 14}
                        borderRadius={4}
                      />
                    </SkeletonPlaceholder.Item>
                  ),
                )}
              </SkeletonPlaceholder.Item>
              {/* Track Order Button */}
              <SkeletonPlaceholder.Item
                width="100%"
                height={48}
                borderRadius={8}
                marginTop={20}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      </ScrollView>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load order details</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primaryColor}
          colors={[COLORS.primaryColor]}
        />
      }
    >
      <Text
        style={{
          ...TYPOGRAPHY.HEADLINE,
          color: COLORS.black,
        }}>
        {order.order_number}
      </Text>

      {/* Order Info Card */}
      <View style={styles.card}>
        {/* Branch */}
        {order.branch?.name && (
          <InfoDisplay
            icon={<Icon_Location />}
            title={'Branch'}
            description={order.branch.name}
          />
        )}

        {/* Order Type */}
        {order.order_type && (
          <InfoDisplay
            icon={<Icon_Delivery color={COLORS.foregroundColor} />}
            title={'Order Type'}
            description={order.order_type.charAt(0).toUpperCase() + order.order_type.slice(1)}
          />
        )}

        {/* Delivery Address */}
        {order.address?.title && order.order_type === 'delivery' && (
          <InfoDisplay
            // icon={<Icon_Location />}
            title={order.address.title}
            description={`${order.address.building || ''} ${order.address.floor || ''} ${order.address.additional_info ? `| ${order.address.additional_info}` : ''}`}
          />
        )}

        {/* Driver */}
        {order.driver?.name && (
          <InfoDisplay
            icon={<Icon_Driver_Id />}
            title={`Driver's Name`}
            description={order.driver.name}
          />
        )}

        {/* Scheduled Order / Delivery Time */}
        {order.schedule_order === 1 && order.schedule_date && (
          <InfoDisplay
            icon={<Icon_Calendar />}
            title={'Scheduled For'}
            description={dayjs(order.schedule_date).format('dddd, MMM D, YYYY, hh:mm A')}
          />
        )}

        {/* Ordered At - always show */}
        {order.order_date && (
          <InfoDisplay
            // icon={<Icon_Calendar />}
            title={'Ordered At'}
            description={dayjs(order.order_date).format('dddd, MMM D, YYYY, hh:mm A')}
          />
        )}

        {/* Delivered At - only for delivered orders */}
        {order.status?.key === 'delivered' && order.delivered_at && (
          <InfoDisplay
            icon={<Icon_Calendar />}
            title={'Delivered At'}
            description={dayjs(order.delivered_at).format('dddd, MMM D, YYYY, hh:mm A')}
          />
        )}

        {/* Estimated Arrival - only for non-delivered orders */}
        {order.status?.key !== 'delivered' && order.estimated_arrival && (
          <InfoDisplay
            // icon={<Icon_Calendar />}
            title={order.order_type === 'delivery' ? 'Estimated Arrival' : 'Estimated Ready Time'}
            description={order.estimated_arrival}
          />
        )}

        {/* Promo Code */}
        {order.promo_code?.code && (
          <InfoDisplay
            icon={<Icon_Promo />}
            title={'Promo Code Applied'}
            description={`${order.promo_code.code}${order.promo_code.name ? ` - ${order.promo_code.name}` : ''}`}
          />
        )}

        {/* Cutleries - requires backend field */}
        {order.cutleries !== undefined && order.cutleries !== null && (
          <InfoDisplay
            // icon={<Icon_Checkout color={COLORS.foregroundColor} />}
            title={'Cutleries'}
            description={order.cutleries ? 'Included' : 'Not requested'}
          />
        )}

        {/* Delivery Instructions */}
        {order.delivery_instructions && order.delivery_instructions.length > 0 && (
          <InfoDisplay
            icon={<Icon_Driver_Id />}
            title={'Delivery Instructions'}
            description={order.delivery_instructions.map(i => i.title).join(', ')}
          />
        )}

        {/* Special Delivery Instructions */}
        {order.special_delivery_instructions && (
          <InfoDisplay
            icon={<Icon_Driver_Id />}
            title={'Special Notes'}
            description={order.special_delivery_instructions}
          />
        )}

        {/* Payment Method */}
        {order.payment_method?.title && (
          <InfoDisplay
            icon={<Icon_Driver_Id />}
            title={'Payment Method'}
            description={order.payment_method.title}
          />
        )}
      </View>

      {/* Order Items Card */}
      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items.map((item, index) => (
          <OrderItemDisplay
            key={item.uuid}
            item={item}
            symbol={order.currency?.symbol}
            isLastItem={index === order.items.length - 1}
          />
        ))}
      </View>

      {/* Total Section */}
      <View style={{ marginTop: 16, marginBottom: 50 }}>
        <TotalSection
          orderType={order?.order_type}
          subtotal={`${order?.currency?.symbol} ${formatNumberWithCommas(
            Number(order?.sub_total),
          )}`}
          deliveryCharge={
            order.delivery_charge && order?.order_type === 'delivery'
              ? `${order?.currency?.symbol} ${formatNumberWithCommas(
                Number(order?.delivery_charge),
              )}`
              : ''
          }
          pointsRewarded={`+ ${formatNumberWithCommas(order?.points_rewarded || 0) || '0'
            } pts`}
          total={`${order?.currency?.symbol} ${formatNumberWithCommas(
            Number(order?.total?.default_currency),
          )}`}
          promoCode={order?.promo_code.code || ''}
          disabled
        />
        {order?.status?.key !== 'delivered' && (
          <View style={styles.trackOrderContainer}>
            <Button
              iconPosition="left"
              icon={<Icon_Location color={'#FFF'} />}
              onPress={() => handleTrackOrder(order)}>
              Track Order
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    paddingVertical: SCREEN_PADDING.vertical,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    backgroundColor: COLORS.backgroundColor,
  },
  card: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.darkColor,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.errorColor || 'red',
    textAlign: 'center',
  },
  trackOrderContainer: {
    paddingVertical: 20
  }
});

