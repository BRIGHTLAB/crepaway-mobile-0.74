import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store/store';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import SplashScreen from '../screens/SplashScreen';
import DeliveryTakeawayStack, {
  DeliveryTakeawayStackParamList,
  ProfileStackParamList,
} from './DeliveryTakeawayStack';
import DineInStack from './DineInStack';
import LoginStack, { LoginStackParamList } from './LoginStack';
import ServiceSelectionStack, {
  ServiceSelectionStackParamList,
} from './ServiceSelectionStack';
import NotificationService from '../utils/NotificationService';

export type RootStackParamList = {
  LoginStack: {
    screen: keyof LoginStackParamList;
    params?: LoginStackParamList[keyof LoginStackParamList];
  };
  Delivery: undefined;
  DineIn: undefined;
  // MenuItems: {item: Category};
  // MenuItem: {itemId: number; itemUuid?: string};
  // OfferDetails: {itemId: number};
  // Cart: undefined;
  // Orders: undefined;
  // Search: undefined;
  // TrackOrder: {
  //   orderId: number;
  // };
  HomeStack: {
    screen: keyof DeliveryTakeawayStackParamList;
    params?: DeliveryTakeawayStackParamList[keyof DeliveryTakeawayStackParamList];
  };
  ServiceSelection: {
    screen: keyof ServiceSelectionStackParamList;
    params?: ServiceSelectionStackParamList[keyof ServiceSelectionStackParamList];
  };
  Profile: {
    screen: keyof ProfileStackParamList;
    params?: ProfileStackParamList[keyof ProfileStackParamList];
  };
  AddressMap: undefined;
};

const Stack = createNativeStackNavigator();

const NavigationStack = () => {
  const [isSplashAnimationFinished, setIsSplashAnimationFinished] =
    useState(false);
  const { isLoggedIn, orderType } = useSelector((state: RootState) => state.user);
  const dispatch = useAppDispatch();
  const notificationInstance = NotificationService.getInstance();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    if (!isLoggedIn || !navigationRef.current) return;
    notificationInstance.init(navigationRef.current);
  }, [isLoggedIn, navigationRef]);

  const renderStack = () => {
    if (!isSplashAnimationFinished) {
      return (
        <Stack.Navigator>
          <Stack.Screen
            name="Splash"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: 'black'
              }
            }}>
            {() => (
              <SplashScreen
                onAnimationFinish={() => setIsSplashAnimationFinished(true)}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      );
    }

    if (!isLoggedIn) {
      return <LoginStack />;
    }

    if (!orderType) {
      return (
        <View style={{ flex: 1 }}>
          <ServiceSelectionStack />
        </View>
      );
    }

    switch (orderType) {
      case 'delivery':
      case 'takeaway':
        return (
          <View style={{ flex: 1 }}>
            <DeliveryTakeawayStack />
          </View>
        );
      case 'dine-in':
        return (
          <View style={{ flex: 1 }}>
            <DineInStack />
          </View>
        );
      default:
        // if the user hasn't selected yet
        return (
          <View style={{ flex: 1 }}>
            <ServiceSelectionStack />
          </View>
        );
    }
  };

  return (
    <NavigationContainer ref={navigationRef}>
      {renderStack()}
    </NavigationContainer>
  );
};

export default NavigationStack;
