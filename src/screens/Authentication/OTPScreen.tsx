import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { POST } from '../../api';
import Button from '../../components/UI/Button';
import DynamicPopup from '../../components/UI/DynamicPopup';
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

const RESEND_TIME = 30;

const OTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phone_number, from } = route.params;
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_TIME);
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ['', '', '', ''],
    },
  });

  // Add refs for input fields
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, canResend]);

  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsResending(true);
    const response = await POST({
      endpoint: '/reset-password',
      formData: { phone_number },
    });

    if (response.status < 400) {
      setCountdown(RESEND_TIME);
      setCanResend(false);
    } else {
      setErrorMessage(
        response?.message || 'An error has occurred. Please try again.',
      );
      setShowErrorPopup(true);
    }
    setIsResending(false);
  };

  const handleVerify = async (data: OTPForm) => {
    const otpString = data.otp.join('');
    setIsLoading(true);

    try {
      const endpoint =
        from === 'reset-password' ? '/verify-pass-otp' : '/verify-otp';
      const response = await POST<VerifyResponse>({
        endpoint,
        formData: { phone_number, otp: otpString },
      });

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
              setErrorMessage('Failed to login. Please try again.');
              setShowErrorPopup(true);
            }
          } else {
            setErrorMessage('Invalid server response. Please try again.');
            setShowErrorPopup(true);
          }
        }
      } else {
        setErrorMessage(
          response?.message || 'Invalid verification code. Please try again.',
        );
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setErrorMessage(
        'An error occurred during verification. Please try again.',
      );
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const headerHeight = useHeaderHeight();

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
      behavior={"padding"}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight + 10 : 0}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Phone Number Verification</Text>
        <Text style={styles.subtitle}>
          Enter the verification code we just sent to the phone number you
          provided
        </Text>

        <View style={styles.otpContainer}>
          {[0, 1, 2, 3].map(index => (
            <Controller
              key={index}
              control={control}
              name={`otp.${index}`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  ref={ref => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    errors.otp?.[index] && styles.otpInputError,
                  ]}
                  value={value}
                  onChangeText={text => {
                    // Only allow numbers
                    if (text && !/^[0-9]$/.test(text)) {
                      return;
                    }

                    // If text is empty and we're not at first input, move back
                    if (!text && index > 0) {
                      setValue(`otp.${index}`, '');
                      inputRefs.current[index - 1]?.focus();
                    } else {
                      onChange(text);
                      if (text && index < 3) {
                        // Focus next input
                        inputRefs.current[index + 1]?.focus();
                      }
                    }
                  }}
                  onKeyPress={e => {
                    if (
                      e.nativeEvent.key === 'Backspace' &&
                      !value &&
                      index > 0
                    ) {
                      // Focus previous input on backspace
                      setValue(`otp.${index}`, '');
                      inputRefs.current[index - 1]?.focus();
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              )}
            />
          ))}
        </View>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive an OTP? </Text>
          <TouchableOpacity
            onPress={handleResendOtp}
            disabled={!canResend || isResending}>
            <View style={styles.resendButtonContainer}>
              {isResending ? (
                <ActivityIndicator size="small" color={COLORS.primaryColor} />
              ) : (
                <Text
                  style={[
                    styles.resendButton,
                    (!canResend || isResending) && styles.resendButtonDisabled,
                  ]}>
                  Resend Now {!canResend && `(${formatTime(countdown)})`}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="large"
            onPress={handleSubmit(handleVerify)}
            isLoading={isLoading}>
            Verify
          </Button>
        </View>
      </View>

      <DynamicPopup
        visible={showErrorPopup}
        onClose={() => {
          setShowErrorPopup(false);
          setErrorMessage('');
        }}>
        <View style={styles.popupContent}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Button
            variant="primary"
            size="medium"
            onPress={() => {
              setShowErrorPopup(false);
              setErrorMessage('');
            }}>
            OK
          </Button>
        </View>
      </DynamicPopup>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resendText: {
    color: COLORS.foregroundColor,
    fontSize: 14,
  },
  resendButton: {
    // color: COLORS.primaryColor,
    fontSize: 14,
    fontWeight: 'bold',
  },
  resendButtonDisabled: {
    color: COLORS.foregroundColor,
  },
  buttonContainer: {
    marginTop: 16,
  },
  popupContent: {
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.errorColor,
    marginBottom: 16,
    textAlign: 'center',
  },
  resendButtonContainer: {
    minWidth: 100,
    alignItems: 'center',
  },
});

export default OTPScreen;
