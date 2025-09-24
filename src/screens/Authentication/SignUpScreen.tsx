// TODO keyboard handling

import { zodResolver } from '@hookform/resolvers/zod';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import CountryPicker, { CountryCode } from 'react-native-country-picker-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import Icon_Email from '../../../assets/SVG/Icon_Email';
import Icon_Password from '../../../assets/SVG/Icon_Password';
import Icon_Phone from '../../../assets/SVG/Icon_Phone';
import Icon_User from '../../../assets/SVG/Icon_User';
import { POST } from '../../api';
import Button from '../../components/UI/Button';
import DateInput from '../../components/UI/DateInput';
import DynamicPopup from '../../components/UI/DynamicPopup';
import Input from '../../components/UI/Input';
import { LoginStackParamList } from '../../navigation/LoginStack';
import { COLORS, INPUT_HEIGHT, REGEX, TYPOGRAPHY } from '../../theme';

type SignUpScreenProps = {
  navigation: NativeStackNavigationProp<LoginStackParamList>;
};

const signUpSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z
      .string()
      .email('Invalid email address')
      .optional()
      .or(z.literal('')),
    dob: z.date({
      required_error: 'Date of birth is required',
    }),
    //   'password' => ['required|string|min:8|mixed_case|numbers|symbols'],
    password: z
      .string()
      .regex(new RegExp(REGEX.PASSWORD.regex), REGEX.PASSWORD.valFailureMsg),
    retypePassword: z.string(),
    phoneNumber: z
      .string()
      .regex(new RegExp(REGEX.INT_PHONE.regex), REGEX.INT_PHONE.valFailureMsg),
  })
  .refine(data => data.password === data.retypePassword, {
    message: "Passwords don't match",
    path: ['retypePassword'],
  });

type SignUpForm = z.infer<typeof signUpSchema>;

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [countryCode, setCountryCode] = useState<CountryCode>('LB');
  const [callingCode, setCallingCode] = useState('961');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  const inputRefs = {
    name: useRef<TextInput>(null),
    email: useRef<TextInput>(null),
    dateOfBirth: useRef<TextInput>(null),
    password: useRef<TextInput>(null),
    retypePassword: useRef<TextInput>(null),
    phoneNumber: useRef<TextInput>(null),
  };

  const handleSignUp = async (data: SignUpForm) => {
    setIsLoading(true);

    const formattedPhoneNumber = `+${callingCode} ${data.phoneNumber}`;

    const response = await POST({
      endpoint: '/signup',
      formData: {
        ...data,
        phone_number: formattedPhoneNumber,
      },
    });

    if (response.status < 400) {
      navigation.navigate('OTP', {
        phone_number: formattedPhoneNumber,
        from: 'registration',
      });
    } else {
      console.log('response', response?.data);

      setErrorMessage(response?.message || 'An error occurred during sign up');
      setShowErrorPopup(true);
    }
    setIsLoading(false);
  };

  const scrollToInput = (ref: React.RefObject<TextInput | null>) => {
    if (ref.current) {
      ref.current.measure((x, y, width, height, pageX, pageY) => {
        scrollViewRef.current?.scrollTo({
          y: pageY - 100, // Adjust offset as needed
          animated: true
        });
      });
    };
  }

  const headerHeight = useHeaderHeight();


  const insets = useSafeAreaInsets();


  console.log('headerHeight', headerHeight);
  console.log('insets', insets);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={"padding"}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight + 10 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Hello! Register to get started</Text>
          <Text style={styles.subtitle}>
            Fill up the below information to get started and experience the
            app's great features.
          </Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  ref={inputRefs.name}
                  iconLeft={<Icon_User />}
                  placeholder="Full Name"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                  returnKeyType="next"
                  onSubmitEditing={() => inputRefs.phoneNumber.current?.focus()}
                />
              )}
            />

            <View style={styles.phoneContainer}>
              <TouchableOpacity
                style={styles.countryPicker}
                onPress={() => setShowCountryPicker(true)}>
                <CountryPicker
                  countryCode={countryCode}
                  withFlag
                  withCallingCode
                  withFilter
                  withAlphaFilter
                  onSelect={country => {
                    setCountryCode(country.cca2);
                    setCallingCode(country.callingCode[0]);
                    setShowCountryPicker(false);
                  }}
                  visible={showCountryPicker}
                />
                <Text style={styles.callingCode}>+{callingCode}</Text>
              </TouchableOpacity>

              <View style={styles.phoneInputContainer}>
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      ref={inputRefs.phoneNumber}
                      iconLeft={<Icon_Phone />}
                      placeholder="Phone Number"
                      value={value}
                      onChangeText={onChange}
                      error={errors.phoneNumber?.message}
                      keyboardType="phone-pad"
                      returnKeyType="next"
                      onSubmitEditing={() => inputRefs.email.current?.focus()}
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  ref={inputRefs.email}
                  iconLeft={<Icon_Email />}
                  placeholder="Email Address"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    setShowDatePicker(true);
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="dob"
              render={({ field: { onChange, value } }) => (
                <DateInput
                  ref={inputRefs.dateOfBirth}
                  value={value}
                  onChange={date => {
                    onChange(date);
                    setTimeout(() => {
                      inputRefs.password.current?.focus();
                      scrollToInput(inputRefs.password);
                    }, 100);
                  }}
                  error={errors.dob?.message}
                  mode="date"
                  placeholder="Date of Birth"
                  showPicker={showDatePicker}
                  onPickerClose={() => setShowDatePicker(false)}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  ref={inputRefs.password}
                  iconLeft={<Icon_Password />}
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  secureTextEntry
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    inputRefs.retypePassword.current?.focus();
                    scrollToInput(inputRefs.retypePassword);
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="retypePassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  ref={inputRefs.retypePassword}
                  iconLeft={<Icon_Password />}
                  placeholder="Retype Password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.retypePassword?.message}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(handleSignUp)}
                />
              )}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              variant="primary"
              size="large"
              onPress={handleSubmit(handleSignUp)}
              isLoading={isLoading}>
              Sign Up
            </Button>
          </View>
        </View>
      </ScrollView>

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
    backgroundColor: 'white'
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
    // flex: 1,
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
  form: {
    gap: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 8,
    padding: 12,
    height: INPUT_HEIGHT,
    gap: 8,
  },
  callingCode: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.darkColor,
  },
  phoneInputContainer: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 24,
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
});

export default SignUpScreen;
