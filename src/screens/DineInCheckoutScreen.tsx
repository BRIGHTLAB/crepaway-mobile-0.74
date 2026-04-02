import { BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
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
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import Icon_Credit_Card from '../../assets/SVG/Icon_Credit_Card';
import Icon_Delete from '../../assets/SVG/Icon_Delete';
import { useDeleteSavedCardMutation, useGetDineInCheckoutQuery, useGetPaymentMethodsQuery, useGetSavedCardsQuery } from '../api/checkoutApi';
import PaymentWebViewModal from '../components/Checkout/PaymentWebViewModal';
import TotalSection from '../components/Menu/TotalSection';
import InfoPopup from '../components/Popups/InfoPopup';
import PartialPaymentSheet, { OrderItem, PaymentMode } from '../components/Sheets/DineIn/PartialPaymentSheet';
import DynamicSheet from '../components/Sheets/DynamicSheet';
import BottomSheetInput from '../components/UI/BottomSheetInput';
import Button from '../components/UI/Button';
import RadioButton from '../components/UI/RadioButton';
import { DineInStackParamList } from '../navigation/DineInStack';
import {
  setCouponCode as setReduxCouponCode,
  setPromoCode as setReduxPromoCode,
} from '../store/slices/cartSlice';
import { RootState, useAppDispatch } from '../store/store';
import { COLORS, SCREEN_PADDING } from '../theme';
import SocketService from '../utils/SocketService';

// Map selected payment method alias to socket PaymentMethod type
const getSocketPaymentMethod = (alias?: string): 'Card' | 'Cash' | 'Whish' => {
  switch (alias) {
    case 'whish':
      return 'Whish';
    case 'cash':
    case 'cod':
      return 'Cash';
    default:
      return 'Card';
  }
};

// Map PartialPaymentSheet mode to socket paymentMode
const getSocketPaymentMode = (mode: PaymentMode): 'FULL' | 'CUSTOM' | 'SPLIT' => {
  switch (mode) {
    case 'divideBill':
      return 'SPLIT';
    case 'myOrder':
    case 'custom':
    default:
      return 'CUSTOM';
  }
};

const DineInCheckoutScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<DineInStackParamList>>();
  const route = useRoute<RouteProp<DineInStackParamList, 'Checkout'>>();
  const orderId = route.params.orderId;

  const promoCodeSheetRef = useRef<BottomSheetMethods | null>(null);
  const paymentMethodSheetRef = useRef<BottomSheetMethods | null>(null);
  const partialPaymentSheetRef = useRef<BottomSheetMethods | null>(null);
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.user);
  const cart = useSelector((state: RootState) => state.cart);
  const tableBill = useSelector((state: RootState) => state.dineIn.tableBill);
  const canPayBill = useSelector((state: RootState) => state.dineIn.canPayBill);

  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<number | null>(null);

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

  const emitBillTips = (tips: number | null) => {
    const socketInstance = SocketService.getInstance();
    socketInstance.emit('message', {
      type: 'setBillTips',
      data: {
        tableName: user.branchTable,
        tips: tips ?? 0,
      },
    });
  };

  const debouncedEmitBillTips = useCallback(
    debounce((tips: number | null) => {
      emitBillTips(tips);
    }, 500),
    []
  );

  const handleTipSelect = (tip: number) => {
    if (selectedTip === tip) {
      // Deselect if already selected
      setSelectedTip(null);
      emitBillTips(null);
      return;
    }
    setSelectedTip(tip);
    setCustomTip('');
    setIsCustomTipActive(false);
    emitBillTips(tip);
  };

  const handleCustomTipChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    setCustomTip(numericText);
    setSelectedTip(null);
    setIsCustomTipActive(true);
    const parsed = parseInt(numericText, 10) || null;
    debouncedEmitBillTips(parsed);
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

  // Save card dialog state
  const [showSaveCardDialog, setShowSaveCardDialog] = useState(false);
  const [pendingPaymentArgs, setPendingPaymentArgs] = useState<{ amount: number; paymentMode: 'FULL' | 'CUSTOM' | 'SPLIT' } | null>(null);

  // Payment error popup state
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);

  // Partial payment sheet mode state
  const [partialPaymentInitialMode, setPartialPaymentInitialMode] = useState<PaymentMode>('myOrder');

  const { bottom } = useSafeAreaInsets();

  // Compute tips amount for the query
  const tipsAmount = useMemo(() => {
    if (selectedTip) {
      return selectedTip;
    }
    if (isCustomTipActive && customTip) {
      return parseInt(customTip, 10) || null;
    }
    return null;
  }, [selectedTip, isCustomTipActive, customTip]);

  // Debounce tips to avoid rapid API calls
  const [debouncedTips, setDebouncedTips] = useState<number | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTips(tipsAmount);
    }, 500);
    return () => clearTimeout(timer);
  }, [tipsAmount]);

  const {
    data,
    isLoading,
    isFetching,
    refetch,
    error: getCheckoutError,
  } = useGetDineInCheckoutQuery({
    orderId,
    promoCode: debouncedPromoCode,
    couponCode: debouncedCouponCode,
    tips: debouncedTips,
  });


  const { data: paymentMethodsData, isLoading: isPaymentMethodsLoading } = useGetPaymentMethodsQuery();



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

  // Unified payment handler — used by all payment scenarios
  const emitPayment = (amount: number, paymentMode: 'FULL' | 'CUSTOM' | 'SPLIT', saveCard?: boolean) => {
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

    const selectedMethod = paymentMethodsData?.data?.find(m => m.id === selectedPaymentMethodId);

    // If card payment (areeba) with no saved card & save card dialog not yet shown, show dialog first
    if (selectedMethod?.alias === 'areeba' && !selectedSavedCardId && saveCard === undefined) {
      setPendingPaymentArgs({ amount, paymentMode });
      setShowSaveCardDialog(true);
      return;
    }

    const socketInstance = SocketService.getInstance();
    const payload = {
      type: 'addPayment',
      data: {
        tableName: user.branchTable,
        paymentMode,
        amount,
        paymentMethod: getSocketPaymentMethod(selectedMethod?.alias),
        paymentMethodId: selectedPaymentMethodId,
        ...(saveCard !== undefined ? { saveCard } : {}),
        ...(selectedSavedCardId ? { usersPaymentMethodsId: selectedSavedCardId } : {}),
      },
    };
    console.log('addPayment payload:', payload);
    socketInstance.emit('message', payload, (response: any) => {
      console.log('addPayment response:', response);
      if (response && response.success === false) {
        setPaymentErrorMessage(response.message || 'Payment failed');
        return;
      }

      // If the server returns a paymentUrl, open the WebView
      if (response?.paymentUrl) {
        setPaymentWebViewUrl(response.paymentUrl);
      }
    });
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

  // Close promo sheet & emit setBillCode when promo is successfully applied
  useEffect(() => {
    if (data?.summary?.promo_code_applied && debouncedPromoCode) {
      promoCodeSheetRef.current?.close();
      // Notify the socket that a promo code was validated
      const socketInstance = SocketService.getInstance();
      socketInstance.emit('message', {
        type: 'setBillCode',
        data: {
          tableName: user.branchTable,
          codeType: 'promo',
          code: debouncedPromoCode,
        },
      });
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

  // Close coupon sheet & emit setBillCode when coupon is successfully applied
  useEffect(() => {
    if (data?.summary?.coupon_applied && debouncedCouponCode) {
      couponCodeSheetRef.current?.close();
      // Notify the socket that a voucher code was validated
      const socketInstance = SocketService.getInstance();
      socketInstance.emit('message', {
        type: 'setBillCode',
        data: {
          tableName: user.branchTable,
          codeType: 'voucher',
          code: debouncedCouponCode,
        },
      });
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
  const handlePaymentSuccess = () => {
    setPaymentWebViewUrl(null);
  };

  const handlePaymentFailure = () => {
    setPaymentWebViewUrl(null);
    Toast.show({
      type: 'error',
      text1: 'Payment failed',
      text2: 'Please try again.',
      visibilityTime: 4000,
      position: 'bottom',
    });
  };

  const currencySymbol = data?.currency?.symbol ?? '$';

  const orderedItemsByUser = useMemo(() => {
    const items = data?.ordered_items ?? [];
    // Sort so current user's group appears first
    return [...items].sort((a, b) => {
      if (a.is_current_user && !b.is_current_user) return -1;
      if (!a.is_current_user && b.is_current_user) return 1;
      return 0;
    });
  }, [data?.ordered_items]);

  // Compute payment values locally from checkout data
  const finalTotal = parseFloat(data?.summary?.final_total ?? '0');
  const remainingAmount = tableBill?.remainingToPay ?? finalTotal;
  const totalPersons = orderedItemsByUser.length;
  const myUserGroup = orderedItemsByUser.find(g => g.is_current_user);
  const myOrderTotal = myUserGroup?.total ?? 0;
  const divideBillAmount = totalPersons > 0 ? (remainingAmount / totalPersons) : 0;

  const partialPaymentItems: OrderItem[] = useMemo(() => {
    const flatItems: OrderItem[] = [];
    orderedItemsByUser.forEach((userGroup) => {
      userGroup.items.forEach(item => {
        flatItems.push({
          ...item,
          isMyItem: userGroup.is_current_user,
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
                {orderedItemsByUser.length > 0 && (
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
                )}
              </View>

              {orderedItemsByUser.length === 0 ? (
                <Text style={styles.emptyOrderedItemsText}>
                  No items have been ordered yet.
                </Text>
              ) : (
                <View style={{ position: 'relative' }}>
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
                            <Text style={styles.orderedUserName}>{userGroup.is_current_user ? 'You' : userGroup.user_name}</Text>
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
                                <Text style={styles.orderedItemPrice}>{currencySymbol} {(item.quantity * item.price).toFixed(2)}</Text>
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
                  {!isOrderedItemsExpanded && orderedItemsContentHeight > COLLAPSED_HEIGHT && (
                    <LinearGradient
                      colors={['transparent', COLORS.card]}
                      style={styles.orderedItemsGradient}
                      pointerEvents="none"
                    />
                  )}
                </View>
              )}
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
                      // Notify socket to clear promo code
                      const socketInstance = SocketService.getInstance();
                      socketInstance.emit('message', {
                        type: 'setBillCode',
                        data: {
                          tableName: user.branchTable,
                          codeType: 'promo',
                          code: '',
                        },
                      });
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
                      // Notify socket to clear voucher code
                      const socketInstance = SocketService.getInstance();
                      socketInstance.emit('message', {
                        type: 'setBillCode',
                        data: {
                          tableName: user.branchTable,
                          codeType: 'voucher',
                          code: '',
                        },
                      });
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
                data?.summary?.tips_amount != null && parseFloat(String(data.summary.tips_amount)) > 0
                  ? {
                    value: `${currencySymbol} ${parseFloat(String(data.summary.tips_amount)).toFixed(2)}`,
                    onPress: () => { },
                  }
                  : undefined
              }
              remainingAmount={
                tableBill?.remainingToPay != null
                  ? `${currencySymbol} ${tableBill.remainingToPay.toFixed(2)}`
                  : undefined
              }
              isLoading={isFetching}
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

            {/* Bill Payments Card */}
            {tableBill && tableBill.payments.length > 0 && (
              <View style={styles.boxContainer}>
                <Text style={styles.boxContainerTitle}>Payments</Text>
                {tableBill.payments.map((payment, index) => {
                  const statusColor =
                    payment.status === 'SUCCEEDED' ? COLORS.secondaryColor
                      : payment.status === 'FAILED' || payment.status === 'CANCELLED' ? COLORS.primaryColor
                        : COLORS.foregroundColor;

                  return (
                    <View key={`${payment.uuid}_${index}`} style={styles.billPaymentRow}>
                      <View style={styles.billPaymentInfo}>
                        <Text style={styles.billPaymentName}>{payment.name}</Text>
                        <Text style={styles.billPaymentDetail}>
                          {payment.paymentMode ?? '—'} · {payment.paymentMethod}
                        </Text>
                      </View>
                      <View style={styles.billPaymentRight}>
                        <Text style={styles.billPaymentAmount}>
                          {payment.amount != null ? `${currencySymbol}${payment.amount}` : '—'}
                        </Text>
                        <View style={[styles.billStatusBadge, { backgroundColor: statusColor + '18' }]}>
                          <Text style={[styles.billStatusText, { color: statusColor }]}>
                            {payment.status ?? 'PENDING'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {orderedItemsByUser.length > 0 ? (
              <View style={{ gap: 10 }}>
                <Button
                  onPress={() => emitPayment(remainingAmount, 'FULL')}
                  disabled={!canPayBill}
                >
                  <Text style={{ fontFamily: 'Poppins-Regular' }}>{tableBill?.payments?.some(p => p.status === 'SUCCEEDED') ? 'Pay the rest of the bill' : 'Pay all bill'}  </Text><Text style={{ fontFamily: 'Poppins-Bold' }}>{currencySymbol}{remainingAmount.toFixed(2)}</Text>
                </Button>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button
                    variant="outline"
                    onPress={() => {
                      setPartialPaymentInitialMode('myOrder');
                      partialPaymentSheetRef.current?.expand();
                    }}
                    disabled={!canPayBill}
                    style={{ flex: 1 }}
                  >
                    <Text style={{ fontFamily: 'Poppins-Regular' }}>Pay my order  </Text><Text style={{ fontFamily: 'Poppins-Bold' }}>{currencySymbol}{myOrderTotal.toFixed(2)}</Text>
                  </Button>
                  <Button
                    variant="outline"
                    onPress={() => {
                      setPartialPaymentInitialMode('divideBill');
                      partialPaymentSheetRef.current?.expand();
                    }}
                    disabled={!canPayBill}
                    style={{ flex: 1 }}
                  >
                    <Text style={{ fontFamily: 'Poppins-Regular' }}>Divide bill by {totalPersons}  </Text><Text style={{ fontFamily: 'Poppins-Bold' }}>{currencySymbol}{divideBillAmount.toFixed(2)}</Text>
                  </Button>
                </View>
                <TouchableOpacity
                  style={{ alignItems: 'center', paddingVertical: 8 }}
                  activeOpacity={0.7}
                  onPress={() => canPayBill && partialPaymentSheetRef.current?.expand()}
                  disabled={!canPayBill}
                >
                  <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 14, color: canPayBill ? COLORS.primaryColor : COLORS.foregroundColor, textDecorationLine: 'underline' }}>
                    More payment options
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}


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
              // Notify socket to clear promo code
              const socketInstance = SocketService.getInstance();
              socketInstance.emit('message', {
                type: 'setBillCode',
                data: {
                  tableName: user.branchTable,
                  codeType: 'promo',
                  code: '',
                },
              });
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
              // Notify socket to clear voucher code
              const socketInstance = SocketService.getInstance();
              socketInstance.emit('message', {
                type: 'setBillCode',
                data: {
                  tableName: user.branchTable,
                  codeType: 'voucher',
                  code: '',
                },
              });
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
          if (pendingPaymentArgs) {
            emitPayment(pendingPaymentArgs.amount, pendingPaymentArgs.paymentMode, false);
            setPendingPaymentArgs(null);
          }
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
                  if (pendingPaymentArgs) {
                    emitPayment(pendingPaymentArgs.amount, pendingPaymentArgs.paymentMode, false);
                    setPendingPaymentArgs(null);
                  }
                }}
              >
                <Text style={styles.dialogButtonOutlineText}>No, thanks</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dialogButtonFilled}
                onPress={() => {
                  setShowSaveCardDialog(false);
                  if (pendingPaymentArgs) {
                    emitPayment(pendingPaymentArgs.amount, pendingPaymentArgs.paymentMode, true);
                    setPendingPaymentArgs(null);
                  }
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
        timeoutSeconds={180}
        onTimeout={() => {
          setPaymentWebViewUrl(null);
          Toast.show({
            type: 'error',
            text1: 'Payment session expired',
            text2: 'Your 3-minute payment window has closed. Please try again.',
            visibilityTime: 5000,
            position: 'bottom',
          });
        }}
      />

      {/* Partial Payment Sheet */}
      <PartialPaymentSheet
        ref={partialPaymentSheetRef}
        total={parseFloat(data?.summary?.final_total ?? '0')}
        remainingAmount={remainingAmount}
        currency={currencySymbol}
        currencyCode={data?.currency?.name ?? 'USD'}
        myOrderTotal={myOrderTotal}
        items={partialPaymentItems}
        totalPersons={totalPersons}
        initialMode={partialPaymentInitialMode}
        onPay={(amount, mode, selectedItems) => {
          emitPayment(amount, getSocketPaymentMode(mode));
          partialPaymentSheetRef.current?.close();
        }}
        onCancel={() => {
          partialPaymentSheetRef.current?.close();
        }}
      />

      {/* Payment Error Popup */}
      <InfoPopup
        visible={!!paymentErrorMessage}
        title="Payment Error"
        message={paymentErrorMessage ?? ''}
        onClose={() => setPaymentErrorMessage(null)}
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
  emptyOrderedItemsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.foregroundColor,
    paddingVertical: 16,
  },
  // Ordered items styles
  orderedItemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderedItemsGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
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
  // Bill payments styles
  billPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.foregroundColor}15`,
  },
  billPaymentInfo: {
    flex: 1,
    gap: 2,
  },
  billPaymentName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.darkColor,
  },
  billPaymentDetail: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.foregroundColor,
  },
  billPaymentRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  billPaymentAmount: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: COLORS.darkColor,
  },
  billStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  billStatusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    textTransform: 'capitalize',
  },
});
