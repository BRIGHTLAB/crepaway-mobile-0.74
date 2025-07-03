import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CountryPicker, { CountryCode } from 'react-native-country-picker-modal';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import DynamicPopup from '../../components/UI/DynamicPopup';
import Icon_Phone from '../../../assets/SVG/Icon_Phone';
import { COLORS, REGEX, TYPOGRAPHY, INPUT_HEIGHT } from '../../theme';
import { POST } from '../../api';
import { LoginStackParamList } from '../../navigation/LoginStack';
import { useHeaderHeight } from '@react-navigation/elements';

type ResetPasswordScreenProps = {
  navigation: NativeStackNavigationProp<LoginStackParamList>;
};

const resetPasswordSchema = z.object({
  phoneNumber: z
    .string()
    .regex(new RegExp(REGEX.INT_PHONE.regex), REGEX.INT_PHONE.valFailureMsg),
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  navigation,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>('LB');
  const [callingCode, setCallingCode] = useState('961');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleSendCode = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    const formattedPhoneNumber = `+${callingCode} ${data.phoneNumber}`;
    const response = await POST({
      endpoint: '/reset-password',
      formData: { phone_number: formattedPhoneNumber },
    });

    if (response.status < 400) {
      navigation.navigate('OTP', {
        phone_number: formattedPhoneNumber,
        from: 'reset-password',
      });
    } else {
      setErrorMessage(
        response?.message ||
        'An error occurred while sending the code. Please try again.',
      );
      setShowErrorPopup(true);
    }
    setIsLoading(false);
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Don't worry! It occurs. Please enter the phone number linked with
            your account.
          </Text>

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
                  name="phoneNumber"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      iconLeft={<Icon_Phone />}
                      placeholder="Phone Number"
                      value={value}
                      onChangeText={onChange}
                      error={errors.phoneNumber?.message}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(handleSendCode)}
                    />
                  )}
                />
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              variant="primary"
              size="large"
              onPress={handleSubmit(handleSendCode)}
              isLoading={isLoading}
              disabled={isLoading}>
              Send code
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
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
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
  inputContainer: {
    marginBottom: 24,
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
});

export default ResetPasswordScreen;
