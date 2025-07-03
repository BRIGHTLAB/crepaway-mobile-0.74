import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

// Import screens from their separate files
import LoginScreen from '../screens/Authentication/LoginScreen';
import ResetPasswordScreen from '../screens/Authentication/ResetPasswordScreen';
import SignUpScreen from '../screens/Authentication/SignUpScreen';
import OTPScreen from '../screens/Authentication/OTPScreen';
import CreateNewPasswordScreen from '../screens/Authentication/CreateNewPasswordScreen';
import { SuccessfulPasswordChangeScreen } from '../screens/Authentication/SuccessfulPasswordChangeScreen';
import IntroScreen from '../screens/IntroScreen';

export type LoginStackParamList = {
  Intro: undefined;
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
  SuccessfulPasswordChange: undefined;
};

const Stack = createNativeStackNavigator<LoginStackParamList>();

const LoginStack = () => {
  return (
    <Stack.Navigator initialRouteName="Intro">
      <Stack.Screen
        name="Intro"
        component={IntroScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          title: 'Reset Password',

        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          title: 'Sign Up',
          // statusBarStyle: 'light',
        }}
      />
      <Stack.Screen
        name="OTP"
        component={OTPScreen}
        options={{
          title: 'OTP',

        }}
      />
      <Stack.Screen
        name="CreateNewPassword"
        component={CreateNewPasswordScreen}
        options={{
          title: 'Create New Password',

        }}
      />
      <Stack.Screen
        name="SuccessfulPasswordChange"
        component={SuccessfulPasswordChangeScreen}
        options={{
          headerShown: false,

        }}
      />
    </Stack.Navigator>
  );
};

export default LoginStack;
