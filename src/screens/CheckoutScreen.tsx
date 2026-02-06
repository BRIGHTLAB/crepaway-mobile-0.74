import { BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import Icon_Branch from '../../assets/SVG/Icon_Branch';
import Icon_Checkout from '../../assets/SVG/Icon_Checkout';
import Icon_Location from '../../assets/SVG/Icon_Location';
import Icon_Motorcycle from '../../assets/SVG/Icon_Motorcycle';
import Icon_Paper_Edit from '../../assets/SVG/Icon_Paper_Edit';
import { useGetCheckoutQuery, usePlaceOrderMutation, useGetPaymentMethodsQuery, useLazyGetPaymentStatusQuery } from '../api/checkoutApi';
import DeliveryInstructionsSheet from '../components/Checkout/DeliveryInstructionsSheet';
import PaymentWebViewModal from '../components/Checkout/PaymentWebViewModal';
import TotalSection from '../components/Menu/TotalSection';
import DynamicSheet from '../components/Sheets/DynamicSheet';
import Button from '../components/UI/Button';
import DateInput from '../components/UI/DateInput';
import RadioButton from '../components/UI/RadioButton';
import { DeliveryTakeawayStackParamList } from '../navigation/DeliveryTakeawayStack';
import {
  clearCart,
} from '../store/slices/cartSlice';
import { DeliveryInstruction } from '../store/slices/cartSlice';
import { RootState, useAppDispatch } from '../store/store';
import { COLORS, SCREEN_PADDING } from '../theme';

const CheckoutScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<DeliveryTakeawayStackParamList>>();

  const deliveryInstructionRef = useRef<BottomSheetMethods | null>(null);
  const scheduleOrderRef = useRef<BottomSheetMethods | null>(null);
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.user);
  const cart = useSelector((state: RootState) => state.cart);

  const [scheduleOrder, setScheduleOrder] = useState<string>('no');
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | undefined>(undefined);
  const [sendCutlery, setSendCutlery] = useState<string>('no');
  const [deliveryInstructions, setDeliveryInstructions] = useState<DeliveryInstruction[]>([]);
  const [specialDeliveryInstructions, setSpecialDeliveryInstructions] = useState<string>('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);

  // Promo code state (local state, resets on mount)
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [debouncedPromoCode, setDebouncedPromoCode] = useState<string>('');

  // Payment WebView state (for card payments)
  const [paymentWebViewUrl, setPaymentWebViewUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);

  // Payment polling state (waiting for order_id after successful card payment)
  const [isWaitingForOrder, setIsWaitingForOrder] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState<number | null>(null);

  const { bottom } = useSafeAreaInsets();

  const {
    data,
    isLoading,
    refetch,
    error: getCheckoutError,
  } = useGetCheckoutQuery({
    promoCode: debouncedPromoCode,
  });

  const { data: paymentMethodsData } = useGetPaymentMethodsQuery();

  const [placeOrder, { isLoading: isSubmitLoading, error: placeOrderError }] =
    usePlaceOrderMutation();

  // Lazy query for polling payment status
  const [getPaymentStatus] = useLazyGetPaymentStatusQuery();

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
      ...(user.orderType === 'delivery'
        ? {
          delivery_instructions: deliveryInstructions?.map((el) => {
            return {
              id: el.id,
            };
          }),
        }
        : {}),
      cutleries: sendCutlery === 'yes' ? 1 : 0,
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

  const handleAddDeliveryInstructions = (
    instructions: { id: number; title: string }[],
    specialNotes: string
  ) => {
    setDeliveryInstructions(instructions);
    setSpecialDeliveryInstructions(specialNotes);
  };

  const handlePromoCodeChange = (code: string) => {
    setPromoCode(code);

    if (!code.trim() && promoError) {
      setPromoError(null);
    }

    debouncedApplyPromo(code);
  };


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

  const handlePaymentWebViewClose = () => {
    // User manually closed the WebView
    setPaymentWebViewUrl(null);
    setPaymentId(null);
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight + 10 : 0}
      >
        <ScrollView>
          <View style={styles.container}>


            {/* Delivery Address or Takeaway Branch */}
            {(user.orderType === 'delivery' && user.addressTitle) ||
              (user.orderType === 'takeaway' && cart.branchName) ? (
              <View style={styles.boxContainer}>
                <Text style={styles.boxContainerTitle}>
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
                          latitudeDelta: 0.001,
                          longitudeDelta: 0.001,
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
              </View>
            ) : null}

            <View style={styles.paymentContainer}>
              <Text style={styles.paymentTitle}>Payment Method</Text>

              <View
                style={{
                  height: 2,
                  backgroundColor: `${COLORS.foregroundColor}10`,
                  marginTop: 6,
                }}
              ></View>

              <View style={styles.paymentMethodContainer}>
                {paymentMethodsData?.data?.map((method) => (
                  <View key={method.id} style={styles.paymentMethodItem}>
                    <RadioButton
                      onPress={() => setSelectedPaymentMethodId(method.id)}
                      checked={selectedPaymentMethodId === method.id}
                      title={method.title}
                    />
                    {method.image_url ? (
                      <FastImage
                        source={{ uri: method.image_url }}
                        style={{ width: 48, height: 28 }}
                        resizeMode={FastImage.resizeMode.contain}
                      />
                    ) : (
                      // Fallback to local image if no image_url
                      method.type === 'cash' && (
                        <FastImage
                          source={require('../../assets/images/payment/cash.png')}
                          style={{ width: 48, height: 28 }}
                        />
                      )
                    )}
                  </View>
                ))}
              </View>
            </View>


            {/* Delivery or pickup  */}
            <View style={styles.boxContainer}>
              <Text style={styles.boxContainerTitle}>
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
                  {/* <Icon_Paper_Edit onPress={handleScheduleEdit} color={COLORS.secondaryColor} /> */}
                </View>
              </View>
            </View>

            {/* send cutlery */}
            <View style={styles.boxContainer}>
              <Text style={styles.boxContainerTitle}>Send Cutlery?</Text>

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

            <TotalSection
              orderType={user?.orderType ?? 'delivery'}
              subtotal={`${data?.currency?.symbol ?? ''} ${data?.summary?.original_sub_total ?? ''
                }`}
              deliveryCharge={`${data?.currency?.symbol ?? ''} ${data?.delivery_charge ?? ''
                }`}
              pointsRewarded={`+ ${data?.points_rewarded ?? ''} pts`}
              promoCode={promoCode}
              promoCodeError={promoError}
              onPromoCodeChange={handlePromoCodeChange}
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

            {/* Delivery instructions  */}
            {(deliveryInstructions?.length > 0 ||
              specialDeliveryInstructions) && (
                <View style={styles.boxContainer}>
                  <Text style={styles.boxContainerTitle}>
                    Delivery Instructions
                  </Text>

                  <View style={{ gap: 8 }}>
                    {deliveryInstructions?.map((el) => {
                      return (
                        <Text key={el.id} style={{}}>
                          {el.title}
                        </Text>
                      );
                    })}
                    {specialDeliveryInstructions && (
                      <Text style={{}}>
                        <Text style={{ fontWeight: 700 }}>
                          Special Instructions:
                        </Text>{' '}
                        {specialDeliveryInstructions}
                      </Text>
                    )}
                  </View>
                </View>
              )}

            <View style={{ gap: 12 }}>
              {user.orderType === 'delivery' && (
                <Button
                  icon={<Icon_Motorcycle />}
                  variant="outline"
                  onPress={() => {
                    console.log(
                      'instructionsSheet',
                      deliveryInstructionRef?.current
                    );
                    deliveryInstructionRef?.current?.expand();
                  }}
                >
                  Add Delivery Instructions
                </Button>
              )}
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

      <DeliveryInstructionsSheet
        deliveryInstructionRef={deliveryInstructionRef}
        onAddInstructions={handleAddDeliveryInstructions}
      />

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

      {/* Payment WebView Modal for card payments */}
      <PaymentWebViewModal
        visible={!!paymentWebViewUrl}
        paymentUrl={paymentWebViewUrl || ''}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
        onClose={handlePaymentWebViewClose}
      />
    </>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingTop: 12,
    paddingBottom: 30,
    gap: 16,
  },
  paymentContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  paymentTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.darkColor,
  },
  paymentMethodContainer: {
    marginTop: 10,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  boxContainer: {
    backgroundColor: '#FFF',
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
});
