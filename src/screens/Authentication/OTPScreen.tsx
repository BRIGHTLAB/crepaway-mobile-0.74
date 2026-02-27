import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { z } from 'zod';
import { POST } from '../../api';
import Button from '../../components/UI/Button';
import OtpInputs from '../../components/OTP/OtpInputs';
import ResendOtpSection from '../../components/OTP/ResendOtpSection';
import { autoLoginUser } from '../../store/slices/userSlice';
import { useAppDispatch } from '../../store/store';
import { COLORS } from '../../theme';

type LoginStackParamList = {
  Login: undefined;
  ResetPassword: undefined;
  SignUp: undefined;
  OTP: {
    phone_number: string;
    from: 'reset-password' | 'registration';
  };
  CreateNewPassword: {
    phone_number: string;
    otp: string;
  };
};

type Props = NativeStackScreenProps<LoginStackParamList, 'OTP'>;

type VerifyResponse = {
  id: number;
  token: string;
  jwt: string;
  phone_number: string;
  image_url: string | null;
  name: string;
  message: string;
};

const otpSchema = z.object({
  otp: z
    .array(
      z
        .string()
        .length(1, 'Required')
        .regex(/^[0-9]$/, 'Must be a number'),
    )
    .length(4, 'All fields required'),
});

type OTPForm = z.infer<typeof otpSchema>;

const RESEND_TIME = 60;

const OTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phone_number, from } = route.params;
  const dispatch = useAppDispatch();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ['', '', '', ''],
    },
  });

  const handleResendOtp = async () => {
    const response = await POST({
      endpoint: '/reset-password',
      formData: { phone_number },
    });

    if (response.status < 400) {
      return;
    }
    Toast.show({
      type: 'error',
      text1: response?.message || 'An error has occurred. Please try again.',
      visibilityTime: 2000,
      position: 'bottom',
    });
    throw new Error('Failed to resend OTP');
  };

  const handleVerify = async (data: OTPForm) => {
    const otpString = data.otp.join('');

    try {
      const endpoint =
        from === 'reset-password' ? '/reset-password' : '/verify-otp';
      const response = await POST<VerifyResponse>({
        endpoint,
        formData: { phone_number, otp: otpString },
      });

      console.log('response', JSON.stringify(response));
      if (response.status < 400) {
        if (from === 'reset-password') {
          navigation.navigate('CreateNewPassword', {
            phone_number,
            otp: otpString,
          });
        } else {
          console.log('response', JSON.stringify(response.data?.token));
          // Handle successful registration verification
          if (response.data?.token) {
            try {
              // Save token to AsyncStorage
              await AsyncStorage.setItem('userToken', response.data.token);

              // Update Redux state
              dispatch(autoLoginUser(response.data));

            } catch (storageError) {
              console.error('Error saving auth data:', storageError);
              Toast.show({
                type: 'error',
                text1: 'Failed to login. Please try again.',
                visibilityTime: 2000,
                position: 'bottom',
              });
            }
          } else {
            Toast.show({
              type: 'error',
              text1: 'Invalid server response. Please try again.',
              visibilityTime: 2000,
              position: 'bottom',
            });
          }
        }
      } else {
        Toast.show({
          type: 'error',
          text1:
            response?.message ||
            'Invalid verification code. Please try again.',
          visibilityTime: 2000,
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      Toast.show({
        type: 'error',
        text1: 'An error occurred during verification. Please try again.',
        visibilityTime: 2000,
        position: 'bottom',
      });
    }
  };

  const headerHeight = useHeaderHeight();

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: COLORS.backgroundColor,
      }}
      behavior={"padding"}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight + 10 : 0}
      // contentContainerStyle={{
      //   flex: 1,
      //   backgroundColor: COLORS.backgroundColor,
      // }}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Phone Number Verification</Text>
        <Text style={styles.subtitle}>
          Enter the verification code we just sent to the phone number you
          provided
        </Text>

        <OtpInputs control={control} errors={errors} setValue={setValue} />

        <ResendOtpSection initialSeconds={RESEND_TIME} onResend={handleResendOtp} />

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="large"
            onPress={handleSubmit(handleVerify)}
            isLoading={isSubmitting}>
            Verify
          </Button>
        </View>
      </View>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: COLORS.backgroundColor,
  },
  content: {
    padding: 24,
    flex: 1,
    // justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.darkColor,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.foregroundColor,
    marginBottom: 32,
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    color: COLORS.darkColor,
  },
  otpInputError: {
    borderColor: COLORS.errorColor,
  },
  buttonContainer: {
    marginTop: 16,
  },
});

export default OTPScreen;
