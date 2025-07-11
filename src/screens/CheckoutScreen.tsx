import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import TotalSection from '../components/Menu/TotalSection';
import FastImage from 'react-native-fast-image';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import Button from '../components/UI/Button';
import Icon_Checkout from '../../assets/SVG/Icon_Checkout';
import Icon_Motorcycle from '../../assets/SVG/Icon_Motorcycle';
import DeliveryInstructionsSheet from '../components/Checkout/DeliveryInstructionsSheet';
import RadioButton from '../components/UI/RadioButton';
import { RootStackParamList } from '../navigation/NavigationStack';
import DateInput from '../components/UI/DateInput';
import Icon_Paper_Edit from '../../assets/SVG/Icon_Paper_Edit';
import { debounce } from 'lodash';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store/store';
import { clearCart } from '../store/slices/cartSlice';
import DynamicSheet from '../components/Sheets/DynamicSheet';
import { useGetCheckoutQuery, usePlaceOrderMutation } from '../api/checkoutApi';
import { COLORS, SCREEN_PADDING } from '../theme';
import DynamicPopup from '../components/UI/DynamicPopup';
import { DeliveryTakeawayStackParamList } from '../navigation/DeliveryTakeawayStack';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';

const CheckoutScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<DeliveryTakeawayStackParamList>>();

  const deliveryInstructionRef = useRef<BottomSheetMethods | null>(null);
  const scheduleOrderRef = useRef<BottomSheetMethods | null>(null);
  const [scheduleOrder, setScheduleOrder] = React.useState<string | null>('no');
  const [scheduledDateTime, setScheduledDateTime] = React.useState<
    Date | undefined
  >(undefined);
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [debouncedPromoCode, setDebouncedPromoCode] = useState<string>('');
  const [deliveryInstructions, setDeliveryInstructions] = useState<
    { id: number; title: string }[]
  >([]);
  const [specialDeliveryInstructions, setSpecialDeliveryInstructions] =
    useState<string>('');
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sendCutlery, setSendCutlery] = useState<string>('no');

  const { bottom } = useSafeAreaInsets();

  const { data, isLoading, refetch, error: getCheckoutError } = useGetCheckoutQuery({
    promoCode: debouncedPromoCode,
  });

  const [placeOrder, { isLoading: isSubmitLoading, error: placeOrderError }] =
    usePlaceOrderMutation();

  // Handle API errors from useGetCheckoutQuery
  useEffect(() => {
    if (getCheckoutError) {
      if ('status' in getCheckoutError) {
        switch (getCheckoutError.status) {
          case 488:
            setPromoError('Invalid Promo Code');
            break;
          default:
            setErrorMessage((getCheckoutError?.data as any)?.message || 'Failed to load checkout data');
            break;
        }
      }

    }
  }, [getCheckoutError]);

  // Handle API errors from usePlaceOrderMutation
  useEffect(() => {
    if (placeOrderError) {
      const error = placeOrderError as any;
      setErrorMessage(error?.data?.message || 'Failed to place order');
    }
  }, [placeOrderError]);

  const handleScheduleConfirm = () => {
    scheduleOrderRef?.current?.close();
  };

  const handleScheduleEdit = () => {
    scheduleOrderRef?.current?.expand();
  };

  const debouncedApplyPromo = useCallback(
    debounce((code: string) => {
      setDebouncedPromoCode(code);
      console.log('promo code', code);
    }, 500),
    [],
  );


  const handlerOrder = async () => {
    // Clear any existing error messages
    setErrorMessage(null);

    const formData = {
      special_delivery_instructions: specialDeliveryInstructions,
      users_payment_methods_id: 1,
      users_addresses_id: user?.addressId,
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
          delivery_instructions: deliveryInstructions?.map(el => {
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
                { name: 'OrderDetails', params: { id: resp?.order_id } },
                { name: 'TrackOrder', params: { orderId: resp?.order_id } },
              ],
              index: 2, // This will make TrackOrder the visible screen
            },
          },
        ],
      });
    } catch (err) {
      const error = err as { data: { message: string } };
      setErrorMessage(error?.data?.message || 'Something went wrong!');
    }
  };

  useEffect(() => {
    if (data) {
      if (data?.summary?.promo_code_applied) {
        setPromoError(null);
      }
    }
  }, [data, promoCode]);

  const handleAddDeliveryInstructions = (
    instructions: { id: number; title: string }[],
    specialNotes: string,
  ) => {
    setDeliveryInstructions(instructions);
    setSpecialDeliveryInstructions(specialNotes);
  };

  const handlePromoCodeChange = (code: string) => {
    setPromoCode(code);
    debouncedApplyPromo(code);
  };

  const handleCloseErrorPopup = () => {
    setErrorMessage(null);
    navigation.goBack();
  };


  console.log('userAddress', user.addressId)

  const headerHeight = useHeaderHeight()
  return (
    <>
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={"padding"}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight + 10 : 0}
      >
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.paymentContainer}>
              <Text style={styles.paymentTitle}>Payment Method</Text>

              <View
                style={{
                  height: 2,
                  backgroundColor: `${COLORS.foregroundColor}10`,
                  marginTop: 6,
                }}></View>

              <View style={styles.paymentMethodContainer}>
                <View style={styles.paymentMethodItem}>
                  {/* Type of payment */}
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <FastImage
                      source={require('../../assets/images/payment/cash.png')}
                      style={{ width: 48, height: 28 }}
                    />
                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        fontSize: 14,
                        color: COLORS.darkColor,
                      }}>
                      Cash
                    </Text>
                  </View>
                  <RadioButton onPress={() => { }} checked={true} />
                </View>
              </View>
            </View>

            {/* Delivery or pickup  */}
            <View style={styles.boxContainer}>
              <Text style={styles.boxContainerTitle}>
                Would you unlock this awesome feature and schedule your order?{' '}
              </Text>

              <View style={{ gap: 16 }}>
                <RadioButton
                  checked={scheduleOrder === 'no'}
                  onPress={() => setScheduleOrder('no')}
                  title="No"
                  description={`Estimated ${user?.orderType === 'delivery' ? 'delivery' : 'pickup'
                    } time 00:30 Min`}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}>
                  <RadioButton
                    checked={scheduleOrder === 'yes'}
                    onPress={() => setScheduleOrder('yes')}
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
                  <Icon_Paper_Edit onPress={handleScheduleEdit} />
                </View>
              </View>
            </View>

            {/* send cutlery */}
            <View style={styles.boxContainer}>
              <Text style={styles.boxContainerTitle}>Send Cutlery?</Text>

              <View style={{ gap: 16 }}>
                <RadioButton
                  checked={sendCutlery === 'no'}
                  onPress={() => {
                    setSendCutlery('no');
                  }}
                  title="No"
                />
                <RadioButton
                  checked={sendCutlery === 'yes'}
                  onPress={() => {
                    setSendCutlery('yes');
                  }}
                  title="Yes"
                />
              </View>
            </View>

            {/* Delivery instructions  */}
            {deliveryInstructions?.length > 0 && (
              <View style={styles.boxContainer}>
                <Text style={styles.boxContainerTitle}>
                  Delivery Instructions
                </Text>

                <View style={{ gap: 8 }}>
                  {deliveryInstructions?.map(el => {
                    return (
                      <Text key={el.id} style={{}}>
                        {el.title}
                      </Text>
                    );
                  })}
                  {specialDeliveryInstructions && (
                    <Text style={{}}>
                      <Text style={{ fontWeight: 700 }}>Special Instructions:</Text>{' '}
                      {specialDeliveryInstructions}
                    </Text>
                  )}
                </View>
              </View>
            )}

            <TotalSection
              orderType={user?.orderType ?? 'delivery'}
              subtotal={`USD ${data?.summary?.original_sub_total ?? ''}`}
              deliveryCharge={`LBP ${data?.delivery_charge ?? ''}`}
              pointsRewarded={`+ ${data?.points_rewarded ?? ''} pts`}
              promoCode={promoCode}
              promoCodeError={promoError}
              onPromoCodeChange={handlePromoCodeChange}
              total={`USD ${data?.summary?.final_total ?? ''}`}
              discount={
                data?.summary?.total_discount
                  ? `USD ${data?.summary?.total_discount}`
                  : ''
              }
              isLoading={isLoading}
              canEdit={true}
            />

            <View style={{ gap: 12 }}>
              {user.orderType === 'delivery' && (
                <Button
                  icon={<Icon_Motorcycle />}
                  variant="outline"
                  onPress={() => {
                    console.log('instructionsSheet', deliveryInstructionRef?.current)
                    deliveryInstructionRef?.current?.expand()
                  }}>
                  Add Delivery Instructions
                </Button>
              )}
              <Button
                isLoading={isSubmitLoading}
                icon={<Icon_Checkout />}
                onPress={handlerOrder}>
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

      <DynamicSheet ref={scheduleOrderRef}>
        <BottomSheetView style={[styles.scheduleSheetContainer, {
          paddingBottom: bottom + 20
        }]}>
          <Text style={styles.scheduleSheetTitle}>Schedule Your Order</Text>
          <View style={styles.scheduleInputsContainer}>
            <DateInput
              value={scheduledDateTime}
              onChange={setScheduledDateTime}
              mode="datetime"
              placeholder="Select Date and Time"
            />
          </View>
          <Button onPress={handleScheduleConfirm}>Confirm Schedule</Button>
        </BottomSheetView>
      </DynamicSheet>

      {/* Error Popup */}
      <DynamicPopup
        visible={errorMessage !== null}
        onClose={handleCloseErrorPopup}>
        <View style={styles.errorPopupContent}>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorMessage}>
            {errorMessage || 'Something went wrong!'}
          </Text>
          <Button
            variant="primary"
            size="medium"
            onPress={handleCloseErrorPopup}>
            OK
          </Button>
        </View>
      </DynamicPopup>
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
  errorPopupContent: {
    alignItems: 'center',
    padding: 16,
    minWidth: 280,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: COLORS.darkColor,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: COLORS.errorColor,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});