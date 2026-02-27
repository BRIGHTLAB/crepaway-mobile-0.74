import { zodResolver } from '@hookform/resolvers/zod';
import { useHeaderHeight } from '@react-navigation/elements';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';
import Toast from 'react-native-toast-message';

import Button from '../components/UI/Button';
import { useDeleteAccountMutation } from '../api/profileApi';
import { logoutUser } from '../store/slices/userSlice';
import { useAppDispatch } from '../store/store';
import { COLORS } from '../theme';
import OtpInputs from '../components/OTP/OtpInputs';
import ResendOtpSection from '../components/OTP/ResendOtpSection';

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

const DeleteAccountOTPScreen: React.FC = () => {
  const dispatch = useAppDispatch();

  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors , isSubmitting},

  } = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ['', '', '', ''],
    },
  });

  const handleVerify = async (data: OTPForm) => {
    const otpString = data.otp.join('');

    try {
      const response = await deleteAccount({ otp: otpString }).unwrap();

      Toast.show({
        type: 'success',
        text1: response?.message || 'Your account has been deleted successfully',
        visibilityTime: 2000,
        position: 'bottom',
      });

      dispatch(logoutUser());
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1:
          error?.data?.message ||
          'Invalid verification code. Please try again.',
        visibilityTime: 2000,
        position: 'bottom',
      });
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await deleteAccount({}).unwrap();
      Toast.show({
        type: 'success',
        text1: response?.message || 'A new verification code has been sent',
        visibilityTime: 2000,
        position: 'bottom',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1:
          error?.data?.message ||
          'An error has occurred. Please try again.',
        visibilityTime: 2000,
        position: 'bottom',
      });
      throw new Error('Failed to resend OTP');
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
    >
      <View style={styles.content}>
        <Text style={styles.title}>Confirm Account Deletion</Text>
        <Text style={styles.subtitle}>
          Enter the verification code we sent to your phone to permanently delete your account.
        </Text>

        <OtpInputs control={control} errors={errors} setValue={setValue} />

        <ResendOtpSection onResend={handleResendOtp} />

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="large"
            onPress={handleSubmit(handleVerify)}
            isLoading={isSubmitting}>
            Confirm Deletion
          </Button>
        </View>
      </View>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 24,
    flex: 1,
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
  buttonContainer: {
    marginTop: 16,
  },
});

export default DeleteAccountOTPScreen;
