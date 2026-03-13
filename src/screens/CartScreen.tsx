import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { useSelector } from 'react-redux';
import Icon_Cart from '../../assets/SVG/Icon_Cart';
import Icon_Checkmark from '../../assets/SVG/Icon_Checkmark';
import Icon_Checkout from '../../assets/SVG/Icon_Checkout';

import { useGetLoyaltyTierThresholdQuery } from '../api/dataApi';
import CartItemComponent from '../components/Cart/CartItemComponent';
import Button from '../components/UI/Button';

import { RootStackParamList } from '../navigation/NavigationStack';
import {
  CartItem,
  clearCart,
  decreaseQuantity,
  increaseQuantity,
} from '../store/slices/cartSlice';
import { RootState, useAppDispatch } from '../store/store';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../theme';
import { normalizeFont } from '../utils/normalizeFonts';


interface IProps { }

interface CartData {
  branch: string;
  date_added: string;
  items: {
    [key: string]: CartItem;
  };
  order_type: string;
}

const CartScreen = ({ }: IProps) => {
  const cartData = useSelector((state: RootState) => state.cart);
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: thresholdData } = useGetLoyaltyTierThresholdQuery();

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const calculateCartTotal = () => {
    if (!cartData || !cartData.items) return 0;

    return Object.values(cartData.items).reduce((total, item) => {
      let itemTotal = (item.price || 0) * item.quantity;

      if (item.modifier_groups) {
        item.modifier_groups.forEach(group => {
          group.modifier_items.forEach(modItem => {
            itemTotal += (modItem.price || 0) * (modItem.quantity || 1);
          });
        });
      }

      return total + itemTotal;
    }, 0);
  };

  const getCurrencySymbol = () => {
    if (
      !cartData ||
      !cartData.items ||
      Object.keys(cartData?.items).length === 0
    ) {
      return '$';
    }
    const firstItem = Object.values(cartData.items)[0];
    return firstItem?.symbol || '$';
  };

  const EmptyCartState = () => (
    <View style={styles.emptyContainer}>
      <Icon_Cart
        width={normalizeFont(100)}
        height={normalizeFont(100)}
        color={COLORS.primaryColor}
        style={{ marginBottom: 16 }}
      />
      <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptySubText}>
        Add delicious items to your cart to get started!
      </Text>
      <Button
        style={{ marginTop: 16 }}
        onPress={() =>
          navigation.navigate('HomeStack', {
            screen: 'Home',
          })
        }>
        Browse Menu
      </Button>
    </View>
  );

  if (!cartData || Object.keys(cartData.items).length === 0) {
    return (
      <View style={styles.container}>
        <EmptyCartState />
      </View>
    );
  }

  const cartTotal = calculateCartTotal();
  const threshold = thresholdData?.loyalty_tier_threshold
    ? parseFloat(thresholdData.loyalty_tier_threshold)
    : 0;
  const showLoyalty = threshold > 0;
  const progress = threshold > 0 ? Math.min(cartTotal / threshold, 1) : 0;
  const isComplete = progress >= 1;
  const currencySymbol = getCurrencySymbol();
  const remaining = threshold - cartTotal;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.backgroundColor }}>
      <View style={styles.container}>
        {/* Items  */}
        <View style={styles.boxContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ ...TYPOGRAPHY.SUB_HEADLINE, paddingBottom: 6, color: COLORS.darkColor }}>All Items</Text>
            {/* <Pressable onPress={handleClearCart}>
              <Text
                style={{
                  color: COLORS.primaryColor,
                  ...TYPOGRAPHY.CTA,
                  marginBottom: 6,
                  textDecorationLine: 'underline',
                }}>
                Clear Cart
              </Text>
            </Pressable> */}
          </View>
          {cartData &&
            Object.entries(cartData.items).map(([uuid, item], idx) => {
              const handleIncreaseQuantity = () => {
                dispatch(increaseQuantity(uuid));
                ReactNativeHapticFeedback.trigger("impactLight", {
                  enableVibrateFallback: true,
                  ignoreAndroidSystemSettings: false,
                });
              };

              const handleDecreaseQuantity = () => {
                dispatch(decreaseQuantity(uuid));
                ReactNativeHapticFeedback.trigger("impactLight", {
                  enableVibrateFallback: true,
                  ignoreAndroidSystemSettings: false,
                });
              };

              const handleNavigateToMenuItem = () => {
                navigation.navigate('MenuItem', {
                  itemId: item.id,
                  itemUuid: uuid,
                });
              };
              return (
                <CartItemComponent
                  key={uuid}
                  item={item}
                  onItemPress={handleNavigateToMenuItem}
                  onQuantityDecrease={handleDecreaseQuantity}
                  onQuantityIncrease={handleIncreaseQuantity}
                  isLastItem={idx === Object.keys(cartData.items).length - 1}
                />
              );
            })}
        </View>

        {cartData && Object.keys(cartData.items).length > 0 && (
          <>
            {/* Loyalty Progress Card */}
            {showLoyalty && (
              <View style={styles.loyaltyCard}>
                {isComplete ? (
                  <View style={styles.loyaltyCompleteRow}>
                    <View style={styles.loyaltyCheckCircle}>
                      <Icon_Checkmark width={13} height={13} color="#FFFFFF" />
                    </View>
                    <Text style={styles.loyaltyCompleteText}>
                      This order is counted in your loyalty progress!
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Description */}
                    <Text style={styles.loyaltyDescription}>
                      {`${remaining.toFixed(2)}${currencySymbol} left to count this order in your loyalty progress!`}
                    </Text>

                    {/* Progress bar */}
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${progress * 100}%`,
                            backgroundColor: COLORS.secondaryColor,
                          },
                        ]}
                      />
                    </View>

                    {/* Amounts row */}
                    <View style={styles.loyaltyAmountsRow}>
                      <Text style={styles.loyaltyCurrentAmount}>
                        {currencySymbol}{cartTotal.toFixed(2)}
                      </Text>
                      <Text style={styles.loyaltyThresholdAmount}>
                        {currencySymbol}{threshold.toFixed(2)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}

            <Button
              icon={<Icon_Checkout />}
              iconPosition="left"
              disabled={cartData.isSyncing}
              onPress={() => navigation.navigate('HomeStack', { screen: 'Checkout' })}>
              {`Checkout ${getCurrencySymbol()}${calculateCartTotal().toFixed(2)}`}
            </Button>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    flexDirection: 'column',
    gap: 12,
    paddingBottom: 28,
    backgroundColor: COLORS.backgroundColor,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  boxContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 8,
  },
  boxContainerTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.darkColor,
    marginBottom: 6,
  },
  endContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyCartText: {
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.foregroundColor,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  emptyTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: normalizeFont(22),
    color: COLORS.darkColor,
  },
  emptySubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalizeFont(14),
    color: COLORS.foregroundColor,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // Loyalty progress card
  loyaltyCard: {
    backgroundColor: '#471E8026',
    borderRadius: 4,
    padding: 12,
    gap: 4,
  },
  loyaltyAmountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loyaltyCurrentAmount: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalizeFont(12),
    color: COLORS.secondaryColor,
  },
  loyaltyThresholdAmount: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalizeFont(12),
    color: COLORS.secondaryColor,
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 4,
    backgroundColor: '#D5CAE3',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  loyaltyDescription: {
    fontFamily: 'Poppins-Medium',
    fontSize: normalizeFont(12),
    color: COLORS.secondaryColor,
    marginBottom: 8,
  },
  loyaltyCompleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loyaltyCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 14,
    backgroundColor: COLORS.secondaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loyaltyCompleteText: {
    fontFamily: 'Poppins-Medium',
    fontSize: normalizeFont(12),
    color: COLORS.secondaryColor,
    flexShrink: 1,
  },
});
