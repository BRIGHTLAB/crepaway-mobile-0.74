import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { useSelector } from 'react-redux';
import Icon_Cart from '../../assets/SVG/Icon_Cart';
import Icon_Checkout from '../../assets/SVG/Icon_Checkout';
import Icon_Spine from '../../assets/SVG/Icon_Spine';
import { useGetLoyaltyTierThresholdQuery } from '../api/dataApi';
import CartItemComponent from '../components/Cart/CartItemComponent';
import Button from '../components/UI/Button';
import DashedProgressBar from '../components/UI/DashedProgressBar';
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
  const totalDashes = 10;
  const filledDashes = Math.round(progress * totalDashes);
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
                <View style={styles.loyaltyCardContent}>
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text style={[styles.loyaltyTierName, { color: isComplete ? '#34C759' : COLORS.primaryColor }]}>
                      {isComplete ? '🎉 Reward Earned!' : 'Loyalty Progress'}
                    </Text>
                    <DashedProgressBar
                      totalDashes={totalDashes}
                      filledDashes={filledDashes}
                      color={isComplete ? '#34C759' : COLORS.primaryColor}
                    />
                    <Text style={styles.loyaltyDescription}>
                      {isComplete
                        ? `You've earned a loyalty reward!`
                        : `Spend ${currencySymbol}${remaining.toFixed(2)} more to earn a reward`}
                    </Text>
                  </View>
                  <View style={styles.loyaltyPointsContainer}>
                    <Text style={styles.loyaltyPointsCount}>
                      {cartTotal >= 1000 ? `${(cartTotal / 1000).toFixed(1)}K` : cartTotal.toFixed(0)}
                    </Text>
                    <Text style={styles.loyaltyPointsUnit}>
                      {currencySymbol}
                    </Text>
                  </View>
                </View>

                {/* Add More Items button - only when reward not reached */}
                {!isComplete && (
                  <TouchableOpacity
                    style={styles.addMoreButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addMoreButtonText}>Add More Items</Text>
                  </TouchableOpacity>
                )}

                {/* Decorative spines */}
                <View style={styles.spineLeft}>
                  <Icon_Spine width={400} height={400} opacity={0.1} />
                </View>
                <View style={styles.spineRight}>
                  <Icon_Spine width={400} height={400} opacity={0.1} />
                </View>
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
    backgroundColor: COLORS.secondaryColor,
    borderRadius: 8,
    padding: 16,
    overflow: 'hidden',
    gap: 12,
  },
  loyaltyCardContent: {
    flexDirection: 'row',
    gap: 15,
  },
  loyaltyTierName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: normalizeFont(14),
  },
  loyaltyDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalizeFont(10),
    color: '#bdbdbd',
  },
  loyaltyPointsContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  loyaltyPointsCount: {
    ...TYPOGRAPHY.HEADLINE,
    fontFamily: 'Poppins-Regular',
    fontWeight: 'bold',
    color: COLORS.white,
  },
  loyaltyPointsUnit: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.white,
  },
  addMoreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addMoreButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: normalizeFont(12),
    color: COLORS.white,
  },
  spineLeft: {
    position: 'absolute',
    left: -150,
    bottom: -325,
  },
  spineRight: {
    position: 'absolute',
    right: -180,
    top: -325,
  },
});
