import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CountryPicker, { CountryCode } from 'react-native-country-picker-modal';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import DynamicPopup from '../../components/UI/DynamicPopup';
import Icon_Username from '../../../assets/SVG/Icon_User';
import Icon_Password from '../../../assets/SVG/Icon_Password';
import Icon_Phone from '../../../assets/SVG/Icon_Phone';
import { COLORS, REGEX } from '../../theme';
import { loginUserThunk } from '../../store/slices/userSlice';
import { RootState, useAppDispatch } from '../../store/store';
import { LoginStackParamList } from '../../navigation/LoginStack';

const { height } = Dimensions.get('window');

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<LoginStackParamList>;
};

const loginSchema = z.object({
  phone_number: z
    .string()
    .regex(new RegExp(REGEX.INT_PHONE.regex), REGEX.INT_PHONE.valFailureMsg),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [countryCode, setCountryCode] = useState<CountryCode>('LB');
  const [callingCode, setCallingCode] = useState('961');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const dispatch = useAppDispatch();
  const { status, error } = useSelector((state: RootState) => state.user);
  const isLoading = status === 'pending';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const refPasswordInput = useRef<TextInput>(null);

  const focusOnPassword = () => {
    if (refPasswordInput && refPasswordInput.current) {
      refPasswordInput.current.focus();
    }
  };

  const handleLogin = async (data: LoginForm) => {
    const formattedPhoneNumber = `+${callingCode} ${data.phone_number}`;
    const resultAction = await dispatch(
      loginUserThunk({ ...data, phone_number: formattedPhoneNumber }),
    );

    if (loginUserThunk.rejected.match(resultAction)) {
      setShowErrorPopup(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        {/* Banner with placeholder image */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: 'https://picsum.photos/800/600' }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign In</Text>

          {/* Phone Number Input */}
          <View style={styles.inputContainer}>
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
                  name="phone_number"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      iconLeft={<Icon_Phone />}
                      placeholder="Phone Number"
                      value={value}
                      onChangeText={onChange}
                      error={errors.phone_number?.message}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      returnKeyType="next"
                      onSubmitEditing={focusOnPassword}
                    />
                  )}
                />
              </View>
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  ref={refPasswordInput}
                  iconLeft={<Icon_Password />}
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  returnKeyType={'done'}
                  onSubmitEditing={handleSubmit(handleLogin)}
                />
              )}
            />
          </View>

          {/* Reset Password Link */}
          <TouchableOpacity
            style={styles.resetPasswordContainer}
            onPress={() => navigation.navigate('ResetPassword')}>
            <Text style={styles.linkText}>Reset Password</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <View style={styles.buttonContainer}>
            <Button
              variant="primary"
              size="large"
              onPress={handleSubmit(handleLogin)}
              isLoading={isLoading}
              disabled={isLoading}>
              Sign In
            </Button>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Error Popup */}
      <DynamicPopup
        visible={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}>
        <View style={styles.popupContent}>
          <Text style={styles.errorText}>
            {error || 'Invalid credentials. Please try again'}
          </Text>
          <Button
            variant="primary"
            size="medium"
            onPress={() => setShowErrorPopup(false)}>
            OK
          </Button>
        </View>
      </DynamicPopup>
    </KeyboardAvoidingView>
  );
};

// TODO: Move the styles to a separate file

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  bannerContainer: {
    height: height * 0.45, // 45% of screen height
    width: '100%',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40, // Add extra padding at the bottom for scrolling
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: COLORS.darkColor,
  },
  inputContainer: {
    marginBottom: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    paddingHorizontal: 8,
    height: 53,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 8,
  },
  callingCode: {
    marginLeft: 4,
    color: COLORS.darkColor,
    fontSize: 14,
  },
  phoneInputContainer: {
    flex: 1,
  },
  resetPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  linkText: {
    color: COLORS.black,
    fontSize: 14,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signUpText: {
    color: COLORS.foregroundColor,
    fontSize: 14,
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

export default LoginScreen;
