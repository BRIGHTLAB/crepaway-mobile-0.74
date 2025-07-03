import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Button from '../../components/UI/Button';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';

type LoginStackParamList = {
  Login: undefined;
  ResetPassword: undefined;
  SignUp: undefined;
  OTP: {
    email: string;
    from: 'reset-password' | 'registration';
  };
  CreateNewPassword: {
    email: string;
    otp: string;
  };
  SuccessfulPasswordChange: undefined;
};

type Props = NativeStackScreenProps<
  LoginStackParamList,
  'SuccessfulPasswordChange'
>;

export const SuccessfulPasswordChangeScreen: React.FC<Props> = ({
  navigation,
}) => {
  const handleBackToSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../../assets/lotties/Check.json')}
        autoPlay
        loop={false}
        style={styles.animation}
      />
      <Text style={styles.title}>Password Changed</Text>
      <Text style={styles.subtitle}>
        Your password has been changed successfully.
      </Text>
      <Button variant="primary" size="large" onPress={handleBackToSignIn}>
        Back To Sign In
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  animation: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    maxWidth: 300,
  },
});
