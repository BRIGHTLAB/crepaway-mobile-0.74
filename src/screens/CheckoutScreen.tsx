import { BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import Icon_Branch from '../../assets/SVG/Icon_Branch';
import Icon_Checkout from '../../assets/SVG/Icon_Checkout';
import Icon_Credit_Card from '../../assets/SVG/Icon_Credit_Card';
import Icon_Location from '../../assets/SVG/Icon_Location';
import Icon_Delete from '../../assets/SVG/Icon_Delete';
import Icon_Motorcycle from '../../assets/SVG/Icon_Motorcycle';
import { useGetCheckoutQuery, usePlaceOrderMutation, useGetPaymentMethodsQuery, useLazyGetPaymentStatusQuery, useGetSavedCardsQuery, useDeleteSavedCardMutation } from '../api/checkoutApi';
import PaymentWebViewModal from '../components/Checkout/PaymentWebViewModal';
import TotalSection from '../components/Menu/TotalSection';
import DynamicSheet from '../components/Sheets/DynamicSheet';
import Button from '../components/UI/Button';
import DateInput from '../components/UI/DateInput';
import Input from '../components/UI/Input';
import RadioButton from '../components/UI/RadioButton';
import BottomSheetInput from '../components/UI/BottomSheetInput';
import { DeliveryTakeawayStackParamList } from '../navigation/DeliveryTakeawayStack';
import {
  clearCart,
} from '../store/slices/cartSlice';
import { RootState, useAppDispatch } from '../store/store';
import { COLORS, SCREEN_PADDING } from '../theme';

const CheckoutScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<DeliveryTakeawayStackParamList>>();

  const scheduleOrderRef = useRef<BottomSheetMethods | null>(null);
  const promoCodeSheetRef = useRef<BottomSheetMethods | null>(null);
  const paymentMethodSheetRef = useRef<BottomSheetMethods | null>(null);
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.user);
  const cart = useSelector((state: RootState) => state.cart);

  const [scheduleOrder, setScheduleOrder] = useState<string>('no');
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | undefined>(undefined);
  const [sendCutlery, setSendCutlery] = useState<string>('no');
  const [specialDeliveryInstructions, setSpecialDeliveryInstructions] = useState<string>('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<number | null>(null);
  const [saveCard, setSaveCard] = useState<boolean>(false);

  // Promo code state
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [debouncedPromoCode, setDebouncedPromoCode] = useState<string>('');
  const [sheetPromoCode, setSheetPromoCode] = useState<string>('');

  // Payment WebView state (for card payments)
  const [paymentWebViewUrl, setPaymentWebViewUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);

  // Payment polling state (waiting for order_id after successful card payment)
  const [isWaitingForOrder, setIsWaitingForOrder] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState<number | null>(null);

  // Save card dialog state
  const [showSaveCardDialog, setShowSaveCardDialog] = useState(false);

  const { bottom } = useSafeAreaInsets();

  const {
    data,
    isLoading,
    refetch,
    error: getCheckoutError,
  } = useGetCheckoutQuery({
    promoCode: debouncedPromoCode,
  });

  console.log('getCheckoutError', getCheckoutError);

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
            const isUnknownError = !(getCheckoutError?.data as any)?.message;
            Toast.show({
              type: 'error',
              text1: errorMessage,
              visibilityTime: 4000,
              position: 'bottom',
            });
            if (isUnknownError) {
              setTimeout(() => {
                navigation.navigate('Cart');
              }, 2000);
            }
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
      const errorMessage = error?.data?.message || 'Failed to place order';
      const isUnknownError = !error?.data?.message;
      Toast.show({
        type: 'error',
        text1: errorMessage,
        visibilityTime: 4000,
        position: 'bottom',
      });
      // Navigate to cart for unknown errors after showing toast
      if (isUnknownError) {
        setTimeout(() => {
          navigation.navigate('Cart');
        }, 2000);
      }
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
            const orderId = result.payment.orders_id;
            setIsWaitingForOrder(false);
            setPendingPaymentId(null);
            dispatch(clearCart());
            refetch();

            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'OrderStack',
                  state: {
                    routes: [
                      { name: 'Orders' },
                      { name: 'OrderDetails', params: { id: orderId } },
                      {
                        name: 'TrackOrder',
                        params: {
                          orderId: orderId,
                          order_type: user?.orderType,
                          addressLatitude: user?.addressLatitude,
                          addressLongitude: user?.addressLongitude,
                        },
                      },
                    ],
                    index: 2,
                  },
                },
              ],
            });
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

  const handleScheduleConfirm = () => {
    scheduleOrderRef?.current?.close();
  };

  const handleScheduleEdit = () => {
    if (scheduleOrder !== 'yes') return;
    scheduleOrderRef?.current?.expand();
  };

  // Handle sheet close - if "Yes" is selected but no date, switch back to "No"
  const handleScheduleSheetClose = () => {
    if (scheduleOrder === 'yes' && !scheduledDateTime) {
      setScheduleOrder('no');
    }
  };

  const handleScheduledDateTimeChange = (date: Date) => {
    setScheduledDateTime(date);
  };

  const debouncedApplyPromo = useCallback(
    debounce((code: string) => {
      const trimmedCode = code.trim();
      setDebouncedPromoCode(trimmedCode);
      if (!trimmedCode) {
        setPromoError(null);
      }
      console.log('promo code', code);
    }, 500),
    []
  );

  // Called when user submits the order (or after save card dialog)
  const executeOrder = async (shouldSaveCard: boolean) => {
    const formData = {
      special_delivery_instructions: specialDeliveryInstructions,
      payment_methods_id: selectedPaymentMethodId,
      address_id: user?.addressId,
      promo_code: debouncedPromoCode,
      is_scheduled: scheduleOrder === 'yes' ? 1 : 0,
      scheduled_date: scheduledDateTime
        ? scheduledDateTime
          .toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })
          .replace(',', '')
        : null,
      order_type: user?.orderType,
      cutleries: sendCutlery === 'yes' ? 1 : 0,
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

      // COD/Cash payment - navigate directly to confirmation
      if (resp.order_id) {
        dispatch(clearCart());
        refetch();

        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'OrderStack',
              state: {
                routes: [
                  { name: 'Orders' },
                  { name: 'OrderDetails', params: { id: resp.order_id } },
                  {
                    name: 'TrackOrder',
                    params: {
                      orderId: resp.order_id,
                      order_type: user?.orderType,
                      addressLatitude: user?.addressLatitude,
                      addressLongitude: user?.addressLongitude,
                    },
                  },
                ],
                index: 2,
              },
            },
          ],
        });
      }
    } catch (err) {
      const error = err as { data: { message: string } };
      const errorMessage = error?.data?.message || 'Something went wrong!';
      const isUnknownError = !error?.data?.message;
      Toast.show({
        type: 'error',
        text1: errorMessage,
        visibilityTime: 4000,
        position: 'bottom',
      });
      // Navigate to cart for unknown errors after showing toast
      if (isUnknownError) {
        setTimeout(() => {
          navigation.navigate('Cart');
        }, 2000);
      }
    }
  };

  const handlerOrder = async () => {
    // Front-end validation: if scheduleOrder is "yes" but no date selected, switch to "no"
    if (scheduleOrder === 'yes' && !scheduledDateTime) {
      setScheduleOrder('no');
      Toast.show({
        type: 'error',
        text1: 'Please select a date and time to schedule your order',
        visibilityTime: 3000,
        position: 'bottom',
      });
      return;
    }

    // Front-end validation: if date is selected but not in the future, show error
    if (scheduledDateTime) {
      const now = new Date();
      const minDate = getMinimumDate();
      if (scheduledDateTime <= now || scheduledDateTime < minDate) {
        Toast.show({
          type: 'error',
          text1: 'Please select a future date and time',
          visibilityTime: 3000,
          position: 'bottom',
        });
        return;
      }
    }

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
        // Show promo code error from API response
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
    setPromoCode(trimmedCode);
    setDebouncedPromoCode(trimmedCode);
    setPromoError(null);
    // We'll close the sheet after the query resolves if valid
  };

  // Close promo sheet when promo is successfully applied
  useEffect(() => {
    if (data?.summary?.promo_code_applied && debouncedPromoCode) {
      promoCodeSheetRef.current?.close();
    }
  }, [data?.summary?.promo_code_applied, debouncedPromoCode]);


  console.log('total123', data?.summary?.final_total);

  const headerHeight = useHeaderHeight();

  // Calculate minimum date: now + 5 minutes, rounded up to next 30-minute interval
  const getMinimumDate = (): Date => {
    const now = new Date();
    const d = new Date(now.getTime() + 5 * 60 * 1000); // now + 5 minutes
    d.setSeconds(0, 0); // clear seconds & ms

    const minutes = d.getMinutes();
    const remainder = minutes % 30;

    if (remainder !== 0) {
      // add the difference to reach the next 30-min boundary
      d.setMinutes(minutes + (30 - remainder));
    }

    // set seconds/ms again just in case setMinutes changed them
    d.setSeconds(0, 0);

    return d;
  };

  // Calculate maximum date: 2 days from now
  const getMaximumDate = (): Date => {
    const now = new Date();
    const maxDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    maxDate.setHours(23, 59, 59, 999); // Set to end of day
    return maxDate;
  };

  // Payment WebView callbacks
  const handlePaymentSuccess = (_orderId: number | null, successPaymentId: number) => {
    // Close the WebView modal
    setPaymentWebViewUrl(null);
    setPaymentId(null);

    // Start polling for order_id
    setIsWaitingForOrder(true);
    setPendingPaymentId(successPaymentId);
  };

  const handlePaymentFailure = (_paymentId: number) => {
    // Close the WebView modal
    setPaymentWebViewUrl(null);
    setPaymentId(null);

    // Navigate back to cart and show error
    navigation.navigate('Cart');
    Toast.show({
      type: 'error',
      text1: 'Payment failed',
      text2: 'Please try again.',
      visibilityTime: 4000,
      position: 'bottom',
    });
  };

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

  return (
    <>
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight + 10 : 0}
      >
        <ScrollView style={{ backgroundColor: COLORS.lightColor }}>
          <View style={styles.container}>


            {/* Delivery Address or Takeaway Branch */}
            {(user.orderType === 'delivery' && user.addressTitle) ||
              (user.orderType === 'takeaway' && cart.branchName) ? (
              <View style={styles.boxContainer}>
                <Text style={[styles.boxContainerTitle, { marginBottom: 6 }]}>
                  {user.orderType === 'delivery' ? 'Delivery Address' : 'Pickup Branch'}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    marginTop: 8,
                  }}
                >
                  {user.orderType === 'delivery' ? (
                    <Icon_Location />
                  ) : (
                    <Icon_Branch />
                  )}
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: 14,
                      color: COLORS.darkColor,
                      flex: 1,
                      lineHeight: 20,
                    }}
                  >
                    {user.orderType === 'delivery'
                      ? user.addressTitle
                      : cart.branchName}
                  </Text>
                </View>
                {/* Minimap for delivery addresses */}
                {user.orderType === 'delivery' &&
                  user.addressLatitude &&
                  user.addressLongitude && (
                    <View style={styles.minimapContainer}>
                      <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.minimap}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        pitchEnabled={false}
                        rotateEnabled={false}
                        initialRegion={{
                          latitude: user.addressLatitude,
                          longitude: user.addressLongitude,
                          latitudeDelta: 0.05,
                          longitudeDelta: 0.05,
                        }}
                      >
                        <Marker
                          coordinate={{
                            latitude: user.addressLatitude,
                            longitude: user.addressLongitude,
                          }}
                          title={user.addressTitle || 'Delivery Address'}
                        />
                      </MapView>
                    </View>
                  )}
                {/* Delivery Instructions Input - directly under the map */}
                {user.orderType === 'delivery' && (
                  <View style={{ marginTop: 12 }}>
                    <Input
                      iconLeft={<Icon_Motorcycle color={COLORS.foregroundColor} />}
                      placeholder="Any delivery instructions?"
                      value={specialDeliveryInstructions}
                      onChangeText={setSpecialDeliveryInstructions}
                      multiline
                      lines={2}
                    />
                  </View>
                )}
              </View>
            ) : null}

            {/* Schedule your order */}
            <View style={styles.boxContainer}>
              <Text style={[styles.boxContainerTitle, { marginBottom: 6 }]}>
                Schedule your order?
              </Text>

              <View style={{ gap: 16 }}>
                <RadioButton
                  checked={scheduleOrder === 'no'}
                  onPress={() => setScheduleOrder('no')}
                  title="No"
                  description={`Estimated ${user?.orderType === 'delivery' ? 'delivery' : 'pickup'
                    } time 30 minutes`}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <RadioButton
                    checked={scheduleOrder === 'yes'}
                    onPress={() => {
                      setScheduleOrder('yes');
                      // Automatically set default date if not already set
                      if (!scheduledDateTime) {
                        const defaultDate = getMinimumDate();
                        setScheduledDateTime(defaultDate);
                      }
                      scheduleOrderRef?.current?.expand();
                    }}
                    title="Yes"
                    description={
                      scheduledDateTime
                        ? scheduledDateTime.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : 'Select Date and Time'
                    }
                  />
                </View>
              </View>
            </View>

            {/* Send cutlery */}
            <View style={styles.boxContainer}>
              <Text style={[styles.boxContainerTitle, { marginBottom: 6 }]}>Send Cutlery?</Text>

              <View style={{ gap: 16 }}>
                <RadioButton
                  checked={sendCutlery === 'no'}
                  onPress={() => setSendCutlery('no')}
                  title="No"
                />
                <RadioButton
                  checked={sendCutlery === 'yes'}
                  onPress={() => setSendCutlery('yes')}
                  title="Yes"
                />
              </View>
            </View>

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

            {/* Promo Code - Compact Display */}
            <View style={styles.boxContainer}>
              <View style={styles.paymentHeaderRow}>
                <Text style={styles.boxContainerTitle}>Promo code</Text>
                {data?.summary?.promo_code_applied && promoCode ? (
                  <TouchableOpacity
                    style={styles.changeButton}
                    onPress={() => {
                      setPromoCode('');
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
              {data?.summary?.promo_code_applied && promoCode ? (
                <Text style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: 14,
                  color: COLORS.secondaryColor,
                  marginTop: 4,
                }}>
                  {promoCode} applied
                </Text>
              ) : null}
            </View>

            <TotalSection
              orderType={user?.orderType ?? 'delivery'}
              subtotal={`${data?.currency?.symbol ?? ''} ${data?.summary?.original_sub_total ?? ''
                }`}
              deliveryCharge={`${data?.currency?.symbol ?? ''} ${data?.delivery_charge ?? ''
                }`}
              pointsRewarded={`+ ${data?.points_rewarded ?? ''} pts`}
              total={`${data?.currency?.symbol ?? ''} ${data?.summary?.final_total ?? ''
                }`}
              discount={
                data?.summary?.total_discount
                  ? `${data?.currency?.symbol ?? ''} ${data?.summary?.total_discount
                  }`
                  : ''
              }
              isLoading={isLoading}
              canEdit={true}
            />

            <View style={{ gap: 12 }}>
              <Button
                isLoading={isSubmitLoading || isWaitingForOrder}
                icon={<Icon_Checkout />}
                onPress={handlerOrder}
              >
                Place Order
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Schedule Order Bottom Sheet */}
      <DynamicSheet ref={scheduleOrderRef} onClose={handleScheduleSheetClose}>
        <BottomSheetView
          style={[
            styles.scheduleSheetContainer,
            {
              paddingBottom: bottom + 20,
            },
          ]}
        >
          <Text style={styles.scheduleSheetTitle}>Schedule Your Order</Text>
          <View style={styles.scheduleInputsContainer}>
            <DateInput
              value={scheduledDateTime}
              onChange={handleScheduledDateTimeChange}
              mode="datetime"
              placeholder="Select Date and Time"
              minimumDate={getMinimumDate()}
              maximumDate={getMaximumDate()}
              minuteInterval={30}
            />
          </View>
          <Button onPress={handleScheduleConfirm}>Confirm Schedule</Button>
        </BottomSheetView>
      </DynamicSheet>

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
            autoCapitalize="characters"
          />
          {promoError && (
            <Text style={styles.promoErrorText}>{promoError}</Text>
          )}
          <Button onPress={handleApplyPromoCode} isLoading={isLoading}>
            Apply
          </Button>
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
                // If not areeba, clear saved card selection
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
                // Find the areeba payment method to set the correct ID
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
                style={{ width: 100, height: 100 }}
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
    </>
  );
};

export default CheckoutScreen;

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
  scheduleSheetContainer: {
    paddingTop: 16,
    gap: 20,
  },
  scheduleSheetTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: COLORS.darkColor,
    textAlign: 'center',
  },
  scheduleInputsContainer: {
    gap: 16,
  },
  minimapContainer: {
    marginTop: 12,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${COLORS.foregroundColor}20`,
  },
  minimap: {
    width: '100%',
    height: '100%',
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
    // color: COLORS.secondaryColor,
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
    // color: COLORS.secondaryColor,
    textAlign: 'center',
  },
  dialogTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
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
});
