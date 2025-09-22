import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';
import Icon_Password from '../../../assets/SVG/Icon_Password';
import { POST } from '../../api';
import Button from '../../components/UI/Button';
import DynamicPopup from '../../components/UI/DynamicPopup';
import Input from '../../components/UI/Input';
import { COLORS, REGEX } from '../../theme';

import { useHeaderHeight } from '@react-navigation/elements';

type LoginStackParamList = {
  CreateNewPassword: {
    phone_number: string;
    otp: string;
  };
  Login: undefined;
};

type Props = NativeStackScreenProps<LoginStackParamList, 'CreateNewPassword'>;

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .regex(new RegExp(REGEX.PASSWORD.regex), REGEX.PASSWORD.valFailureMsg),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type NewPasswordForm = z.infer<typeof newPasswordSchema>;

const CreateNewPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phone_number, otp } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
  });

  const handleResetPassword = async (data: NewPasswordForm) => {
    setIsLoading(true);

    const response = await POST({
      endpoint: '/change-password',
      formData: {
        phone_number,
        otp,
        password: data.password,
      },
    });

    if (response.status < 400) {
      navigation.navigate('Login');
    } else {
      setErrorMessage(
        response?.message || 'An error occurred while resetting password',
      );
      setShowErrorPopup(true);
    }
    setIsLoading(false);
  };

  const headerHeight = useHeaderHeight();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={"padding"}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight + 10 : 0}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Create new password</Text>
        <Text style={styles.subtitle}>
          Your new password must be unique from those previously used
        </Text>

        <View style={styles.inputContainer}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                iconLeft={<Icon_Password />}
                placeholder="New Password"
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
                secureTextEntry
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                iconLeft={<Icon_Password />}
                placeholder="Confirm Password"
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSubmit(handleResetPassword)}
              />
            )}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="large"
            onPress={handleSubmit(handleResetPassword)}
            isLoading={isLoading}
            disabled={isLoading}>
            Reset Password
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
    gap: 16,
    marginBottom: 24,
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

export default CreateNewPasswordScreen;
