import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  GestureResponderEvent,
} from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store/store';
import FastImage from 'react-native-fast-image';
import Icon_Decrease_Quantity from '../../assets/SVG/Icon_Decrease_Quantity';
import Icon_Increase_Quantity from '../../assets/SVG/Icon_Increase_Quantity';
import Button from '../components/UI/Button';
import Icon_Checkout from '../../assets/SVG/Icon_Checkout';
import Icon_Cart from '../../assets/SVG/Icon_Cart';
import {
  clearCart,
  increaseQuantity,
  decreaseQuantity,
  CartItem,
} from '../store/slices/cartSlice';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../theme';
import CartItemComponent from '../components/Cart/CartItemComponent';
import { RootStackParamList } from '../navigation/NavigationStack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
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

  // if (isLocalLoading) {
  //   return (
  //     <View style={[styles.container, styles.loadingContainer]}>
  //       <ActivityIndicator size="large" color={COLORS.primaryColor} />
  //     </View>
  //   );
  // }

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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.backgroundColor }}>
      <View style={styles.container}>
        {/* Items  */}
        <View style={styles.boxContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6}}>
            <Text style={{...TYPOGRAPHY.SUB_HEADLINE, paddingBottom: 6, color: COLORS.darkColor }}>All Items</Text>
            <Pressable onPress={handleClearCart}>
              <Text
                style={{
                  color: COLORS.primaryColor,
                  ...TYPOGRAPHY.CTA,
                  marginBottom: 6,
                  textDecorationLine: 'underline',
                }}>
                Clear Cart
              </Text>
            </Pressable>
          </View>
          {cartData &&
            Object.entries(cartData.items).map(([uuid, item], idx) => {
              const handleIncreaseQuantity = () => {
                dispatch(increaseQuantity(uuid));

                // Trigger haptic feedback
                ReactNativeHapticFeedback.trigger("impactLight", {
                  enableVibrateFallback: true,
                  ignoreAndroidSystemSettings: false,
                });

              };

              const handleDecreaseQuantity = () => {
                dispatch(decreaseQuantity(uuid));

                // Trigger haptic feedback
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
    // backgroundColor: '#FFF',
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
});
