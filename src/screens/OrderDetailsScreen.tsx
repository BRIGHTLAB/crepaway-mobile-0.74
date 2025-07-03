import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import {RouteProp, useRoute} from '@react-navigation/native';
import {OrdersStackParamList} from '../navigation/DeliveryTakeawayStack';
import {COLORS, SCREEN_PADDING, TYPOGRAPHY} from '../theme';
import TotalSection from '../components/Menu/TotalSection';
import Item from '../components/Order/Item';
import {formatNumberWithCommas} from '../utils/formatNumberWithCommas';
import Icon_Location from '../../assets/SVG/Icon_Location';
import Icon_Driver_Id from '../../assets/SVG/Icon_Driver_Id';
import {ordersApi, useGetOrderQuery} from '../api/ordersApi';
import CartItemComponent from '../components/Cart/CartItemComponent';

type OrderDetailsRouteProp = RouteProp<OrdersStackParamList, 'OrderDetails'>;

const InfoDisplay = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
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
    <View>{icon}</View>
    <View>
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

const OrderDetailsScreen = () => {
  const route = useRoute<OrderDetailsRouteProp>();
  const orderId = route.params?.id || 0;
  const orderType = route.params?.order_type || 'delivery';

  const {data: order, isLoading, error} = useGetOrderQuery(orderId);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryColor} />
      </View>
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
    <ScrollView style={styles.container}>
      <Text
        style={{
          ...TYPOGRAPHY.HEADLINE,
          color: COLORS.black,
        }}>
        {order.order_number}
      </Text>
      <View style={styles.card}>
        {order.branch?.name && (
          <InfoDisplay
            icon={<Icon_Location />}
            title={'Branch'}
            description={order.branch.name}
          />
        )}
        {order.address?.title && (
          <InfoDisplay
            icon={<Icon_Location />}
            title={order.address.title}
            description={`${order.address.city} | ${order.address.building} ${order.address.floor} | ${order.address.additional_info}`}
          />
        )}
        {order.driver?.name && (
          <InfoDisplay
            icon={<Icon_Driver_Id />}
            title={`Driver's Name`}
            description={order.driver.name}
          />
        )}

        <View style={{marginTop: 16}}>
          {order.items.map((item, index) => (
            <React.Fragment key={item.uuid}>
              <CartItemComponent item={item} />
              {index < order.items.length - 1 && (
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#F0F0F0',
                    marginBottom: 10,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
      <View style={{marginTop: 16, marginBottom: 50}}>
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
          pointsRewarded={`+ ${
            formatNumberWithCommas(order?.points_rewarded || 0) || '0'
          } pts`}
          total={`${order?.currency?.symbol} ${formatNumberWithCommas(
            Number(order?.total?.default_currency),
          )}`}
          promoCode={order?.promo_code.code || ''}
          // paymentMethod={order?.payment_method?.title}
          disabled
        />
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
  },
  card: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    borderRadius: 8,
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
});
