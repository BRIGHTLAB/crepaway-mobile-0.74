import { BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import Icon_Credit_Card from '../../assets/SVG/Icon_Credit_Card';
import Icon_Delete from '../../assets/SVG/Icon_Delete';
import { useDeleteSavedCardMutation, useGetCheckoutQuery, useGetPaymentMethodsQuery, useGetSavedCardsQuery, useLazyGetPaymentStatusQuery, usePlaceOrderMutation } from '../api/checkoutApi';
import PaymentWebViewModal from '../components/Checkout/PaymentWebViewModal';
import TotalSection from '../components/Menu/TotalSection';
import PartialPaymentSheet, { OrderItem, PaymentMode } from '../components/Sheets/DineIn/PartialPaymentSheet';
import DynamicSheet from '../components/Sheets/DynamicSheet';
import BottomSheetInput from '../components/UI/BottomSheetInput';
import Button from '../components/UI/Button';
import RadioButton from '../components/UI/RadioButton';
import { DineInStackParamList } from '../navigation/DineInStack';
import {
  clearCart,
  setCouponCode as setReduxCouponCode,
  setPromoCode as setReduxPromoCode,
} from '../store/slices/cartSlice';
import { RootState, useAppDispatch } from '../store/store';
import { COLORS, SCREEN_PADDING } from '../theme';

const DineInCheckoutScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<DineInStackParamList>>();

  const promoCodeSheetRef = useRef<BottomSheetMethods | null>(null);
  const paymentMethodSheetRef = useRef<BottomSheetMethods | null>(null);
  const partialPaymentSheetRef = useRef<BottomSheetMethods | null>(null);
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.user);
  const cart = useSelector((state: RootState) => state.cart);

  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<number | null>(null);
  const [saveCard, setSaveCard] = useState<boolean>(false);

  // Ordered items expand/collapse
  const COLLAPSED_HEIGHT = 200;
  const [isOrderedItemsExpanded, setIsOrderedItemsExpanded] = useState(false);
  const [orderedItemsContentHeight, setOrderedItemsContentHeight] = useState(0);
  const orderedItemsHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;

  // Tips state
  const tipOptions = [10, 15, 20];
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState<string>('');
  const [isCustomTipActive, setIsCustomTipActive] = useState(false);

  const handleTipSelect = (tip: number) => {
    if (selectedTip === tip) {
      // Deselect if already selected
      setSelectedTip(null);
      return;
    }
    setSelectedTip(tip);
    setCustomTip('');
    setIsCustomTipActive(false);
  };

  const handleCustomTipChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    setCustomTip(numericText);
    setSelectedTip(null);
    setIsCustomTipActive(true);
  };

  // Promo code state
  const promoCode = cart.promoCode;
  const [promoError, setPromoError] = useState<string | null>(null);
  const [debouncedPromoCode, setDebouncedPromoCode] = useState<string>(cart.promoCode);
  const [sheetPromoCode, setSheetPromoCode] = useState<string>('');

  // Coupon code state
  const couponCode = cart.couponCode;
  const [couponError, setCouponError] = useState<string | null>(null);
  const [debouncedCouponCode, setDebouncedCouponCode] = useState<string>(cart.couponCode);
  const [sheetCouponCode, setSheetCouponCode] = useState<string>('');
  const couponCodeSheetRef = useRef<BottomSheetMethods | null>(null);

  // Sync local state when Redux codes change (e.g. clearCart after order)
  useEffect(() => {
    setDebouncedPromoCode(promoCode);
    setSheetPromoCode(promoCode);
    if (!promoCode) setPromoError(null);
  }, [promoCode]);

  useEffect(() => {
    setDebouncedCouponCode(couponCode);
    setSheetCouponCode(couponCode);
    if (!couponCode) setCouponError(null);
  }, [couponCode]);

  // Payment WebView state (for card payments)
  const [paymentWebViewUrl, setPaymentWebViewUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);

  // Payment polling state (waiting for order_id after successful card payment)
  const [isWaitingForOrder, setIsWaitingForOrder] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState<number | null>(null);

  // Save card dialog state
  const [showSaveCardDialog, setShowSaveCardDialog] = useState(false);

  // Partial payment sheet mode state
  const [partialPaymentInitialMode, setPartialPaymentInitialMode] = useState<PaymentMode>('myOrder');

  const { bottom } = useSafeAreaInsets();

  const {
    data,
    isLoading,
    isFetching,
    refetch,
    error: getCheckoutError,
  } = useGetCheckoutQuery({
    promoCode: debouncedPromoCode,
    couponCode: debouncedCouponCode,
  });

  const { data: paymentMethodsData, isLoading: isPaymentMethodsLoading } = useGetPaymentMethodsQuery();

  const [placeOrder, { isLoading: isSubmitLoading, error: placeOrderError }] =
    usePlaceOrderMutation();

  // Lazy query for polling payment status
  const [getPaymentStatus] = useLazyGetPaymentStatusQuery();

  // Fetch saved cards for the user
  const { data: savedCardsData } = useGetSavedCardsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [deleteSavedCard] = useDeleteSavedCardMutation();

  // Set default payment method when payment methods are loaded
  useEffect(() => {
    if (paymentMethodsData?.data && paymentMethodsData.data.length > 0 && !selectedPaymentMethodId) {
      setSelectedPaymentMethodId(paymentMethodsData.data[0].id);
    }
  }, [paymentMethodsData, selectedPaymentMethodId]);

  // Handle API errors from useGetCheckoutQuery
  useEffect(() => {
    if (getCheckoutError) {
      if ('status' in getCheckoutError) {
        switch (getCheckoutError.status) {
          case 488:
            setPromoError('Invalid Promo Code');
            break;
          default:
            const errorMessage = (getCheckoutError?.data as any)?.message ||
              'Failed to load checkout data';
            Toast.show({
              type: 'error',
              text1: errorMessage,
              visibilityTime: 4000,
              position: 'bottom',
            });
            break;
        }
      }
    }
  }, [getCheckoutError, navigation]);

  // Handle API errors from usePlaceOrderMutation
  useEffect(() => {
    if (placeOrderError) {
      console.log('placeOrderError', placeOrderError);
      const error = placeOrderError as any;
      const errorMessage = error?.data?.error || error?.data?.message || 'Failed to place order';
      Toast.show({
        type: 'error',
        text1: errorMessage,
        visibilityTime: 4000,
        position: 'bottom',
      });
    }
  }, [placeOrderError, navigation]);

  // Polling for payment status after successful card payment
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;

    if (isWaitingForOrder && pendingPaymentId) {
      const pollPaymentStatus = async () => {
        try {
          const result = await getPaymentStatus(pendingPaymentId).unwrap();

          if (result.payment?.orders_id) {
            // Order has been created - stop polling and navigate
            setIsWaitingForOrder(false);
            setPendingPaymentId(null);
            dispatch(clearCart());
            refetch();

            // Navigate back to table after successful order
            Toast.show({
              type: 'success',
              text1: 'Order placed successfully!',
              visibilityTime: 3000,
              position: 'bottom',
            });
            navigation.goBack();
          }
          // If no orders_id yet, the interval will poll again
        } catch (error) {
          console.error('Payment status poll error:', error);
          // Continue polling on error, don't stop
        }
      };

      // Initial poll
      pollPaymentStatus();

      // Set up interval for subsequent polls (every 2 seconds)
      pollingInterval = setInterval(pollPaymentStatus, 2000);
    }

    // Cleanup: clear interval when component unmounts or polling stops
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [isWaitingForOrder, pendingPaymentId, getPaymentStatus, dispatch, refetch, navigation, user]);

  const debouncedApplyPromo = useCallback(
    debounce((code: string) => {
      const trimmedCode = code.trim();
      setDebouncedPromoCode(trimmedCode);
      if (!trimmedCode) {
        setPromoError(null);
      }
    }, 500),
    []
  );

  // Called when user submits the order (or after save card dialog)
  const executeOrder = async (shouldSaveCard: boolean) => {
    const formData = {
      special_delivery_instructions: '',
      payment_methods_id: selectedPaymentMethodId,
      address_id: null,
      is_scheduled: 0,
      scheduled_date: null,
      order_type: user?.orderType || 'dinein',
      promo_code: debouncedPromoCode,
      coupon_code: debouncedCouponCode,
      ...(selectedSavedCardId
        ? { users_payment_methods_id: selectedSavedCardId }
        : (shouldSaveCard ? { save_card: true } : {})
      ),
    };

    try {
      const resp = await placeOrder(formData).unwrap();

      // Check if this is a card payment (has payment_url)
      if (resp.payment_url && resp.payment_id) {
        // Card payment - open WebView for payment
        setPaymentWebViewUrl(resp.payment_url);
        setPaymentId(resp.payment_id);
        return; // Don't navigate yet, wait for WebView callback
      }

      // COD/Cash payment - navigate directly back with success
      if (resp.order_id) {
        dispatch(clearCart());
        refetch();

        Toast.show({
          type: 'success',
          text1: 'Order placed successfully!',
          visibilityTime: 3000,
          position: 'bottom',
        });
        navigation.goBack();
      }
    } catch (err) {
      const error = err as { data: { message: string } };
      const errorMessage = error?.data?.message || 'Something went wrong!';
      Toast.show({
        type: 'error',
        text1: errorMessage,
        visibilityTime: 4000,
        position: 'bottom',
      });
    }
  };

  const handlerOrder = async () => {
    // Validate payment method is selected
    if (!selectedPaymentMethodId) {
      Toast.show({
        type: 'error',
        text1: 'Please select a payment method',
        visibilityTime: 3000,
        position: 'bottom',
      });
      return;
    }

    // Check if Areeba (new card) is selected and no saved card is used
    const selectedMethod = paymentMethodsData?.data?.find(m => m.id === selectedPaymentMethodId);
    if (selectedMethod?.alias === 'areeba' && !selectedSavedCardId) {
      // Show save card dialog
      setShowSaveCardDialog(true);
      return;
    }

    // Proceed directly for non-Areeba or saved card selection
    await executeOrder(false);
  };

  useEffect(() => {
    if (data) {
      if (data?.summary?.promo_code_applied) {
        setPromoError(null);
      } else if (data?.summary?.promo_code_error) {
        setPromoError(data.summary.promo_code_error);
      }
    }
  }, [data, promoCode]);

  const handleApplyPromoCode = () => {
    const trimmedCode = sheetPromoCode.trim();
    if (!trimmedCode) {
      setPromoError('Please enter a promo code');
      return;
    }
    dispatch(setReduxPromoCode(trimmedCode));
    setDebouncedPromoCode(trimmedCode);
    setPromoError(null);
  };

  // Close promo sheet when promo is successfully applied
  useEffect(() => {
    if (data?.summary?.promo_code_applied && debouncedPromoCode) {
      promoCodeSheetRef.current?.close();
    }
  }, [data?.summary?.promo_code_applied, debouncedPromoCode]);

  // Handle coupon code errors from API
  useEffect(() => {
    if (data) {
      if (data?.summary?.coupon_applied) {
        setCouponError(null);
      } else if (data?.summary?.coupon_error) {
        setCouponError(data.summary.coupon_error);
      }
    }
  }, [data, couponCode]);

  const handleApplyCouponCode = () => {
    const trimmedCode = sheetCouponCode.trim();
    if (!trimmedCode) {
      setCouponError('Please enter a coupon code');
      return;
    }
    dispatch(setReduxCouponCode(trimmedCode));
    setDebouncedCouponCode(trimmedCode);
    setCouponError(null);
  };

  // Close coupon sheet when coupon is successfully applied
  useEffect(() => {
    if (data?.summary?.coupon_applied && debouncedCouponCode) {
      couponCodeSheetRef.current?.close();
    }
  }, [data?.summary?.coupon_applied, debouncedCouponCode]);

  // Get the currently selected payment method object
  const selectedPaymentMethod = paymentMethodsData?.data?.find(m => m.id === selectedPaymentMethodId);

  // Get saved cards for Areeba
  const savedCards = savedCardsData?.filter(c => c.areeba_token) || [];

  // Get display info for selected payment
  const getSelectedPaymentDisplay = () => {
    if (selectedSavedCardId) {
      const card = savedCardsData?.find(c => c.id === selectedSavedCardId);
      if (card) {
        return {
          name: `Card ending with ${card.card_digits?.slice(-4) || '****'}`,
          icon: <Icon_Credit_Card color={COLORS.foregroundColor} />,
        };
      }
    }
    if (selectedPaymentMethod) {
      return {
        name: selectedPaymentMethod.title,
        icon: selectedPaymentMethod.image_url
          ? <FastImage
            source={{ uri: selectedPaymentMethod.image_url }}
            style={{ width: 32, height: 20 }}
            resizeMode={FastImage.resizeMode.contain}
          />
          : selectedPaymentMethod.type === 'cash'
            ? <FastImage
              source={require('../../assets/images/payment/cash.png')}
              style={{ width: 32, height: 20 }}
            />
            : <Icon_Credit_Card color={COLORS.foregroundColor} />,
      };
    }
    return { name: 'Select', icon: null };
  };

  const paymentDisplay = getSelectedPaymentDisplay();

  // Payment WebView callbacks
  const handlePaymentSuccess = (_orderId: number | null, successPaymentId: number) => {
    setPaymentWebViewUrl(null);
    setPaymentId(null);
    setIsWaitingForOrder(true);
    setPendingPaymentId(successPaymentId);
  };

  const handlePaymentFailure = (_paymentId: number) => {
    setPaymentWebViewUrl(null);
    setPaymentId(null);
    Toast.show({
      type: 'error',
      text1: 'Payment failed',
      text2: 'Please try again.',
      visibilityTime: 4000,
      position: 'bottom',
    });
  };

  // Mock ordered items grouped by user — will be replaced with real data later
  const currencySymbol = data?.currency?.symbol ?? '$';

  const orderedItemsByUser = [
    {
      userName: 'Najib S.',
      total: 14,
      items: [
        {
          quantity: 1, name: 'Spiel burger', price: 12,
          modifier_groups: [
            {
              id: 1,
              name: 'Cooking',
              modifier_items: [{ id: 1, name: 'Medium rare', price: null, quantity: 1, total_price: 0, plu: '' }],
            },
            {
              id: 2,
              name: 'Extra toppings',
              modifier_items: [
                { id: 2, name: 'Cheddar cheese', price: 1.50, quantity: 1, total_price: 1.50, plu: '' },
                { id: 3, name: 'Jalapeños', price: 1.00, quantity: 1, total_price: 1.00, plu: '' },
              ],
            },
          ],
        },
        { quantity: 1, name: 'Diet Pepsi', price: 2 },
      ],
    },
    {
      userName: 'Charles D.',
      total: 23,
      items: [
        {
          quantity: 1, name: 'Queens burger', price: 14.75,
          modifier_groups: [
            {
              id: 3,
              name: 'Sauce',
              modifier_items: [{ id: 4, name: 'BBQ sauce', price: null, quantity: 1, total_price: 0, plu: '' }],
            },
          ],
        },
        { quantity: 1, name: 'Half quinoa strawberry and co', price: 8.25 },
      ],
    },
    {
      userName: 'Mark B.',
      total: 16.50,
      items: [
        { quantity: 1, name: 'Steak sandwich', price: 16.50 },
        { quantity: 1, name: 'Half quinoa strawberry and co', price: 8.25 },
      ],
    },
  ];

  // Build flat items array for PartialPaymentSheet
  // First user group is the current user (isMyItem = true)
  const partialPaymentItems: OrderItem[] = useMemo(() => {
    const flatItems: OrderItem[] = [];
    orderedItemsByUser.forEach((userGroup, groupIndex) => {
      userGroup.items.forEach(item => {
        flatItems.push({
          ...item,
          isMyItem: groupIndex === 0,
        });
      });
    });
    return flatItems;
  }, [orderedItemsByUser]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView style={{ backgroundColor: COLORS.lightColor }}>
          <View style={styles.container}>

            {/* Ordered Items Section */}
            <View style={styles.boxContainer}>
              <View style={styles.orderedItemsHeader}>
                <Text style={styles.boxContainerTitle}>Ordered items</Text>
                <TouchableOpacity
                  style={styles.viewAllButton}
                  activeOpacity={0.7}
                  onPress={() => {
                    const toExpanded = !isOrderedItemsExpanded;
                    setIsOrderedItemsExpanded(toExpanded);
                    Animated.timing(orderedItemsHeight, {
                      toValue: toExpanded ? orderedItemsContentHeight : COLLAPSED_HEIGHT,
                      duration: 300,
                      useNativeDriver: false,
                    }).start();
                  }}
                >
                  <Text style={styles.viewAllButtonText}>
                    {isOrderedItemsExpanded ? 'Collapse' : 'View all'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Animated.View style={{ maxHeight: orderedItemsHeight, overflow: 'hidden' }}>
                <View onLayout={(e) => {
                  const height = e.nativeEvent.layout.height;
                  if (height > 0) setOrderedItemsContentHeight(height);
                }}>
                  {orderedItemsByUser.map((userGroup, groupIndex) => (
                    <View
                      key={groupIndex}
                      style={styles.orderedUserCard}
                    >
                      <View style={styles.orderedUserHeader}>
                        <Text style={styles.orderedUserName}>{userGroup.userName}</Text>
                        <Text style={styles.orderedUserTotal}>{currencySymbol} {userGroup.total}</Text>
                      </View>
                      {userGroup.items.map((item, itemIndex) => (
                        <View
                          key={itemIndex}
                          style={[
                            styles.orderedItemContainer,
                            itemIndex < userGroup.items.length - 1 && styles.orderedItemBorder,
                          ]}
                        >
                          <View style={styles.orderedItemRow}>
                            <View style={styles.orderedItemLeft}>
                              <Text style={styles.orderedItemQuantity}>{item.quantity}</Text>
                              <Text style={styles.orderedItemName}>{item.name}</Text>
                            </View>
                            <Text style={styles.orderedItemPrice}>{currencySymbol} {item.price}</Text>
                          </View>
                          {item.modifier_groups?.map((modGroup) => (
                            <View key={modGroup.id} style={styles.modifierGroup}>
                              <Text style={styles.modifierGroupName}>{modGroup.name}</Text>
                              {modGroup.modifier_items.map((modItem) => (
                                <View key={modItem.id} style={styles.modifierItemRow}>
                                  <View style={styles.orderedItemLeft}>
                                    {modItem.quantity > 1 ? (
                                      <Text style={styles.modifierItemQuantity}>{modItem.quantity}</Text>
                                    ) : null}
                                    <Text style={styles.modifierItemName}>{modItem.name}</Text>
                                  </View>
                                  {modItem.price && modItem.price > 0 ? (
                                    <Text style={styles.modifierItemPrice}>{currencySymbol} {modItem.price}</Text>
                                  ) : null}
                                </View>
                              ))}
                            </View>
                          ))}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </Animated.View>
            </View>

            {/* Promo Code - Compact Display */}
            <View style={styles.boxContainer}>
              <View style={styles.paymentHeaderRow}>
                <Text style={styles.boxContainerTitle}>Promo code</Text>
                {promoCode ? (
                  <TouchableOpacity
                    style={styles.changeButton}
                    onPress={() => {
                      dispatch(setReduxPromoCode(''));
                      setDebouncedPromoCode('');
                      setSheetPromoCode('');
                      setPromoError(null);
                    }}
                  >
                    <Text style={[styles.changeButtonText, { color: COLORS.primaryColor }]}>Remove</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setSheetPromoCode(promoCode);
                      setPromoError(null);
                      promoCodeSheetRef.current?.expand();
                    }}
                  >
                    <Text style={styles.addButtonText}>+ Add</Text>
                  </TouchableOpacity>
                )}
              </View>
              {promoCode ? (
                <Text style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: 14,
                  color: promoError ? COLORS.primaryColor : COLORS.secondaryColor,
                  marginTop: 4,
                }}>
                  {promoError ? promoError : `${promoCode} applied`}
                </Text>
              ) : null}
            </View>

            {/* Coupon Code - Compact Display */}
            <View style={styles.boxContainer}>
              <View style={styles.paymentHeaderRow}>
                <Text style={styles.boxContainerTitle}>Coupon code</Text>
                {data?.summary?.coupon_applied && couponCode ? (
                  <TouchableOpacity
                    style={styles.changeButton}
                    onPress={() => {
                      dispatch(setReduxCouponCode(''));
                      setDebouncedCouponCode('');
                      setSheetCouponCode('');
                      setCouponError(null);
                    }}
                  >
                    <Text style={[styles.changeButtonText, { color: COLORS.primaryColor }]}>Remove</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setSheetCouponCode('');
                      setCouponError(null);
                      couponCodeSheetRef.current?.expand();
                    }}
                  >
                    <Text style={styles.addButtonText}>+ Add</Text>
                  </TouchableOpacity>
                )}
              </View>
              {data?.summary?.coupon_applied && couponCode ? (
                <Text style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: 14,
                  color: COLORS.secondaryColor,
                  marginTop: 4,
                }}>
                  {couponCode} applied
                </Text>
              ) : null}
            </View>

            {/* Tips Section */}
            <View style={styles.boxContainer}>
              <View style={styles.tipsRow}>
                <Text style={styles.boxContainerTitle}>Tips</Text>
                <View style={styles.tipsOptions}>
                  {tipOptions.map((tip) => (
                    <TouchableOpacity
                      key={tip}
                      style={[
                        styles.tipOption,
                        selectedTip === tip && styles.tipOptionSelected,
                      ]}
                      onPress={() => handleTipSelect(tip)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.tipOptionText,
                          selectedTip === tip && styles.tipOptionTextSelected,
                        ]}
                      >
                        {tip}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <View
                    style={[
                      styles.tipCustomContainer,
                      isCustomTipActive && styles.tipOptionSelected,
                    ]}
                  >
                    <TextInput
                      style={[
                        styles.tipCustomInput,
                        isCustomTipActive && styles.tipOptionTextSelected,
                      ]}
                      value={customTip}
                      onChangeText={handleCustomTipChange}
                      placeholder="Custom"
                      placeholderTextColor={COLORS.foregroundColor}
                      keyboardType="number-pad"
                      maxLength={3}
                      onFocus={() => {
                        setIsCustomTipActive(true);
                        setSelectedTip(null);
                      }}
                    />
                    {customTip.length > 0 && (
                      <Text style={styles.tipPercentSign}>%</Text>
                    )}
                  </View>
                </View>
              </View>
            </View>

            <TotalSection
              orderType={'dinein'}
              subtotal={`${data?.currency?.symbol ?? ''} ${data?.summary?.original_sub_total ?? ''}`}
              pointsRewarded={`+ ${data?.points_rewarded ?? ''} pts`}
              total={`${data?.currency?.symbol ?? ''} ${data?.summary?.final_total ?? ''}`}
              discount={
                data?.summary?.total_discount
                  ? `${data?.currency?.symbol ?? ''} ${data?.summary?.total_discount}`
                  : ''
              }
              couponDiscount={
                data?.summary?.coupon_discount && data.summary.coupon_discount > 0
                  ? `${data?.currency?.symbol ?? ''} ${data?.summary?.coupon_discount}`
                  : undefined
              }
              tips={
                (selectedTip || (isCustomTipActive && customTip))
                  ? {
                    value: selectedTip ?? parseInt(customTip, 10) ?? 0,
                    onPress: () => { },
                  }
                  : undefined
              }
              isLoading={isLoading}
              canEdit={true}
            />

            {/* Payment Method - Compact Display */}
            <View style={styles.boxContainer}>
              <View style={styles.paymentHeaderRow}>
                <Text style={styles.boxContainerTitle}>Payment Method</Text>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={() => paymentMethodSheetRef.current?.expand()}
                >
                  <Text style={styles.changeButtonText}>Change</Text>
                </TouchableOpacity>
              </View>

              {isPaymentMethodsLoading ? (
                <SkeletonPlaceholder>
                  <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" gap={12} marginTop={8}>
                    <SkeletonPlaceholder.Item width={32} height={20} borderRadius={4} />
                    <SkeletonPlaceholder.Item width={100} height={16} borderRadius={4} />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder>
              ) : (
                <View style={styles.selectedPaymentRow}>
                  {paymentDisplay.icon}
                  <Text style={styles.selectedPaymentText}>{paymentDisplay.name}</Text>
                </View>
              )}
            </View>

            {data?.dinein_payment?.payment_handled_by ? (
              <Text style={styles.cardNoteText}>
                Currently being handled by{' '}
                <Text style={{ fontFamily: 'Poppins-Bold' }}>
                  {(() => {
                    const parts = data.dinein_payment.payment_handled_by.trim().split(/\s+/);
                    if (parts.length > 1) {
                      return `${parts[0]} ${parts[1][0]}.`;
                    }
                    return parts[0];
                  })()}
                </Text>
              </Text>
            ) : (
              <View style={{ gap: 10 }}>
                <Button
                  isLoading={isSubmitLoading || isWaitingForOrder}
                  onPress={handlerOrder}
                  disabled={!!(promoCode && promoError) || !!(couponCode && couponError)}
                >
                  <Text style={{ fontFamily: 'Poppins-Regular' }}>Pay all bill  </Text><Text style={{ fontFamily: 'Poppins-Bold' }}>{currencySymbol}{data?.dinein_payment?.pay_all ?? ''}</Text>
                </Button>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button
                    variant="outline"
                    onPress={() => {
                      setPartialPaymentInitialMode('myOrder');
                      partialPaymentSheetRef.current?.expand();
                    }}
                    disabled={!!(promoCode && promoError) || !!(couponCode && couponError)}
                    style={{ flex: 1 }}
                  >
                    <Text style={{ fontFamily: 'Poppins-Regular' }}>Pay my order  </Text><Text style={{ fontFamily: 'Poppins-Bold' }}>{currencySymbol}{data?.dinein_payment?.pay_my_order ?? ''}</Text>
                  </Button>
                  <Button
                    variant="outline"
                    onPress={() => {
                      setPartialPaymentInitialMode('divideBill');
                      partialPaymentSheetRef.current?.expand();
                    }}
                    disabled={!!(promoCode && promoError) || !!(couponCode && couponError)}
                    style={{ flex: 1 }}
                  >
                    <Text style={{ fontFamily: 'Poppins-Regular' }}>Divide bill by {data?.dinein_payment?.divide_bill?.persons ?? orderedItemsByUser.length}  </Text><Text style={{ fontFamily: 'Poppins-Bold' }}>{currencySymbol}{data?.dinein_payment?.divide_bill?.amount ?? ''}</Text>
                  </Button>
                </View>
                <TouchableOpacity
                  style={{ alignItems: 'center', paddingVertical: 8 }}
                  activeOpacity={0.7}
                  onPress={() => partialPaymentSheetRef.current?.expand()}
                >
                  <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 14, color: COLORS.primaryColor, textDecorationLine: 'underline' }}>
                    More payment options
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Promo Code Bottom Sheet */}
      <DynamicSheet ref={promoCodeSheetRef}>
        <BottomSheetView
          style={{
            gap: 16,
            paddingBottom: bottom + 20,
            paddingTop: 8,
          }}
        >
          <Text style={styles.sheetTitle}>Promo Code</Text>
          <BottomSheetInput
            placeholder="Enter promo code"
            value={sheetPromoCode}
            onChangeText={(text: string) => {
              setSheetPromoCode(text);
              if (promoError) setPromoError(null);
            }}
          />
          {promoError && (
            <Text style={styles.promoErrorText}>{promoError}</Text>
          )}
          <Button onPress={handleApplyPromoCode} isLoading={isFetching}>
            Apply
          </Button>
          <TouchableOpacity
            style={styles.sheetRemoveButton}
            onPress={() => {
              dispatch(setReduxPromoCode(''));
              setDebouncedPromoCode('');
              setSheetPromoCode('');
              setPromoError(null);
              promoCodeSheetRef.current?.close();
            }}
          >
            <Text style={styles.sheetRemoveButtonText}>Clear</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </DynamicSheet>

      {/* Coupon Code Bottom Sheet */}
      <DynamicSheet ref={couponCodeSheetRef}>
        <BottomSheetView
          style={{
            gap: 16,
            paddingBottom: bottom + 20,
            paddingTop: 8,
          }}
        >
          <Text style={styles.sheetTitle}>Coupon Code</Text>
          <BottomSheetInput
            placeholder="Enter coupon code"
            value={sheetCouponCode}
            onChangeText={(text: string) => {
              setSheetCouponCode(text);
              if (couponError) setCouponError(null);
            }}
          />
          {couponError && (
            <Text style={styles.promoErrorText}>{couponError}</Text>
          )}
          <Button onPress={handleApplyCouponCode} isLoading={isFetching}>
            Apply
          </Button>
          <TouchableOpacity
            style={styles.sheetRemoveButton}
            onPress={() => {
              dispatch(setReduxCouponCode(''));
              setDebouncedCouponCode('');
              setSheetCouponCode('');
              setCouponError(null);
              couponCodeSheetRef.current?.close();
            }}
          >
            <Text style={styles.sheetRemoveButtonText}>Clear</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </DynamicSheet>

      {/* Payment Method Bottom Sheet */}
      <DynamicSheet ref={paymentMethodSheetRef}>
        <BottomSheetView
          style={{
            gap: 12,
            paddingBottom: bottom + 20,
            paddingTop: 8,
          }}
        >
          <Text style={styles.sheetTitle}>Payment Method</Text>
          <Text style={styles.sheetSubtitle}>
            Please select one of the below payment method
          </Text>

          {/* Payment methods list */}
          {paymentMethodsData?.data?.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.paymentSheetRow}
              onPress={() => {
                setSelectedPaymentMethodId(method.id);
                if (method.alias !== 'areeba') {
                  setSelectedSavedCardId(null);
                }
                paymentMethodSheetRef.current?.close();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.paymentSheetRowLeft}>
                {method.image_url ? (
                  <FastImage
                    source={{ uri: method.image_url }}
                    style={{ width: 40, height: 28 }}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                ) : method.type === 'cash' ? (
                  <FastImage
                    source={require('../../assets/images/payment/cash.png')}
                    style={{ width: 40, height: 28 }}
                  />
                ) : (
                  <Icon_Credit_Card color={COLORS.foregroundColor} />
                )}
                <View>
                  <Text style={styles.paymentSheetRowTitle}>{method.title}</Text>
                  {method.alias === 'areeba' && (
                    <Text style={styles.paymentSheetRowSubtitle}>
                      Can be saved on checkout for later use
                    </Text>
                  )}
                </View>
              </View>
              <RadioButton
                checked={selectedPaymentMethodId === method.id && !selectedSavedCardId}
                onPress={() => {
                  setSelectedPaymentMethodId(method.id);
                  if (method.alias !== 'areeba') {
                    setSelectedSavedCardId(null);
                  }
                  paymentMethodSheetRef.current?.close();
                }}
              />
            </TouchableOpacity>
          ))}

          {/* Saved cards section */}
          {savedCards.length > 0 && (
            <>
              {savedCards.map((card) => {
                const areebaMethod = paymentMethodsData?.data?.find(m => m.alias === 'areeba');

                return (
                  <TouchableOpacity
                    key={card.id}
                    style={styles.paymentSheetRow}
                    onPress={() => {
                      if (areebaMethod) {
                        setSelectedPaymentMethodId(areebaMethod.id);
                      }
                      setSelectedSavedCardId(card.id);
                      paymentMethodSheetRef.current?.close();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.paymentSheetRowLeft}>
                      <View style={styles.cardBrandIcon}>
                        {card.type?.toLowerCase() === 'visa' ? (
                          <Text style={styles.cardBrandText}>VISA</Text>
                        ) : card.type?.toLowerCase() === 'mastercard' || card.type?.toLowerCase() === 'master' ? (
                          <Text style={[styles.cardBrandText, { color: '#EB001B' }]}>MC</Text>
                        ) : (
                          <Icon_Credit_Card color={COLORS.foregroundColor} />
                        )}
                      </View>
                      <Text style={styles.paymentSheetRowTitle}>
                        Card ending with {card.card_digits?.slice(-4) || '****'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            'Remove Card',
                            'Are you sure you want to remove this saved card?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Remove',
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    await deleteSavedCard(card.id).unwrap();
                                    if (selectedSavedCardId === card.id) {
                                      setSelectedSavedCardId(null);
                                    }
                                    Toast.show({
                                      type: 'success',
                                      text1: 'Card removed successfully',
                                      visibilityTime: 2000,
                                      position: 'bottom',
                                    });
                                  } catch (err) {
                                    Toast.show({
                                      type: 'error',
                                      text1: 'Failed to remove card',
                                      visibilityTime: 3000,
                                      position: 'bottom',
                                    });
                                  }
                                },
                              },
                            ],
                          );
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Icon_Delete color={COLORS.foregroundColor} />
                      </TouchableOpacity>
                      <RadioButton
                        checked={selectedSavedCardId === card.id}
                        onPress={() => {
                          if (areebaMethod) {
                            setSelectedPaymentMethodId(areebaMethod.id);
                          }
                          setSelectedSavedCardId(card.id);
                          paymentMethodSheetRef.current?.close();
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </BottomSheetView>
      </DynamicSheet>

      {/* Save Card Confirmation Dialog */}
      <Modal
        visible={showSaveCardDialog}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowSaveCardDialog(false);
          executeOrder(false);
        }}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContainer}>
            <View style={styles.dialogIconContainer}>
              <FastImage
                source={require('../../assets/images/payment/credit_card.png')}
                style={{ width: 150, height: 150 }}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
            <Text style={styles.dialogSubtitle}>
              Redirecting you to enter card details.
            </Text>
            <Text style={styles.dialogTitle}>
              Would you like to save this card for future orders?
            </Text>
            <View style={styles.dialogButtonRow}>
              <TouchableOpacity
                style={styles.dialogButtonOutline}
                onPress={() => {
                  setShowSaveCardDialog(false);
                  executeOrder(false);
                }}
              >
                <Text style={styles.dialogButtonOutlineText}>No, thanks</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dialogButtonFilled}
                onPress={() => {
                  setShowSaveCardDialog(false);
                  executeOrder(true);
                }}
              >
                <Text style={styles.dialogButtonFilledText}>Yes, save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment WebView Modal for card payments */}
      <PaymentWebViewModal
        visible={!!paymentWebViewUrl}
        paymentUrl={paymentWebViewUrl || ''}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />

      {/* Partial Payment Sheet */}
      <PartialPaymentSheet
        ref={partialPaymentSheetRef}
        total={parseFloat(data?.summary?.final_total ?? '0')}
        currency={currencySymbol}
        currencyCode={data?.currency?.name ?? 'USD'}
        myOrderTotal={parseFloat(data?.dinein_payment?.pay_my_order ?? '0')}
        items={partialPaymentItems}
        totalPersons={data?.dinein_payment?.divide_bill?.persons ?? orderedItemsByUser.length}
        initialMode={partialPaymentInitialMode}
        onPay={(amount, mode, selectedItems) => {
          // TODO: handle partial payment with amount, mode, and selectedItems
          partialPaymentSheetRef.current?.close();
        }}
        onCancel={() => {
          partialPaymentSheetRef.current?.close();
        }}
      />
    </>
  );
};

export default DineInCheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    marginTop: SCREEN_PADDING.vertical,
    paddingBottom: 30,
    gap: 16,
  },
  boxContainer: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  boxContainerTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.darkColor,
  },
  paymentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeButton: {
    backgroundColor: COLORS.lightColor,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  changeButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: COLORS.foregroundColor,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.lightColor,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: COLORS.foregroundColor,
  },
  selectedPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  selectedPaymentText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.darkColor,
  },
  // Promo sheet
  sheetTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    color: COLORS.darkColor,
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: -4,
  },
  promoErrorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.primaryColor,
    marginTop: -8,
  },
  // Payment method sheet
  paymentSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.foregroundColor}10`,
  },
  paymentSheetRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  paymentSheetRowTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.darkColor,
  },
  paymentSheetRowSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: COLORS.foregroundColor,
  },
  cardBrandIcon: {
    width: 40,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${COLORS.foregroundColor}10`,
    borderRadius: 4,
  },
  cardBrandText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    color: '#1A1F71',
  },
  // Save card dialog
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dialogContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  dialogIconContainer: {
    marginBottom: 4,
  },
  dialogSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  dialogTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    color: COLORS.darkColor,
    textAlign: 'center',
  },
  dialogButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  dialogButtonOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.primaryColor,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dialogButtonOutlineText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.primaryColor,
  },
  dialogButtonFilled: {
    flex: 1,
    backgroundColor: COLORS.primaryColor,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dialogButtonFilledText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.white,
  },
  cardNoteText: {
    fontSize: 14,
    color: COLORS.secondaryColor,
    textAlign: 'center',
    backgroundColor: COLORS.secondaryColor + '20',
    fontFamily: 'Poppins-Regular',
    paddingVertical: 12,
    borderRadius: 10,
  },
  sheetRemoveButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sheetRemoveButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.primaryColor,
  },
  // Tips styles
  tipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tipsOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipOption: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.lightColor,
  },
  tipOptionSelected: {
    borderColor: COLORS.primaryColor,
  },
  tipOptionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: COLORS.foregroundColor,
  },
  tipOptionTextSelected: {
    color: COLORS.darkColor,
  },
  tipCustomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.lightColor,
    width: 75,
  },
  tipCustomInput: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: COLORS.darkColor,
    padding: 0,
    textAlign: 'center',
    flex: 1,
  },
  tipPercentSign: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: COLORS.foregroundColor,
  },
  // Ordered items styles
  orderedItemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.lightColor,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: COLORS.foregroundColor,
  },
  orderedUserCard: {
    borderWidth: 1,
    borderColor: COLORS.lightColor,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    marginTop: 10,
  },
  orderedUserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.borderColor,
  },
  orderedUserName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: COLORS.darkColor,
  },
  orderedUserTotal: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: COLORS.foregroundColor,
  },
  orderedItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderedItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  orderedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  orderedItemQuantity: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: COLORS.darkColor,
  },
  orderedItemName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: COLORS.darkColor,
    flex: 1,
  },
  orderedItemPrice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: COLORS.foregroundColor,
  },
  orderedItemContainer: {
    paddingVertical: 10,
  },
  modifierGroup: {
    paddingLeft: 24,
    marginTop: 4,
  },
  modifierGroupName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: COLORS.foregroundColor,
    marginBottom: 2,
  },
  modifierItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  modifierItemQuantity: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.foregroundColor,
  },
  modifierItemName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.foregroundColor,
    flex: 1,
  },
  modifierItemPrice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.foregroundColor,
  },
});
