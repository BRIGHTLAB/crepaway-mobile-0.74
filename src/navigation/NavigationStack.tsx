import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store/store';

import CustomHeader from '../components/Header';
import MenuItemScreen from '../screens/MenuItemScreen';
import SplashScreen from '../screens/SplashScreen';
import NotificationService from '../utils/NotificationService';
import DeliveryTakeawayStack, {
  DeliveryTakeawayStackParamList,
  ProfileStackParamList,
} from './DeliveryTakeawayStack';
import DineInStack from './DineInStack';
import LoginStack, { LoginStackParamList } from './LoginStack';
import ServiceSelectionStack, {
  ServiceSelectionStackParamList,
} from './ServiceSelectionStack';

export type RootStackParamList = {
  LoginStack: {
    screen: keyof LoginStackParamList;
    params?: LoginStackParamList[keyof LoginStackParamList];
  };
  DeliveryTakeaway: undefined;
  DineIn: undefined;
  MenuItem: { itemId: number; itemUuid?: string };
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

import * as Sentry from '@sentry/react-native';

const Stack = createNativeStackNavigator();

const NavigationStack = () => {
  const [isSplashAnimationFinished, setIsSplashAnimationFinished] =
    useState(false);
  const { isLoggedIn, orderType, id, name } = useSelector((state: RootState) => state.user);
  const dispatch = useAppDispatch();
  const notificationInstance = NotificationService.getInstance();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    if (!isLoggedIn || !navigationRef.current) return;
    notificationInstance.init(navigationRef.current);
  }, [isLoggedIn, navigationRef]);


  useEffect(() => {
    if (isLoggedIn) {
      Sentry.setUser({
        id: id?.toString() || '',
        name: name,
      })
    } else {
      Sentry.setUser({
        id: undefined,
        name: undefined,
      });
    }
  }, [isLoggedIn, id, name]);

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
          <Stack.Navigator>
            <Stack.Screen
              name="DeliveryTakeaway"
              component={DeliveryTakeawayStack}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MenuItem"
              component={MenuItemScreen}
              options={{
                headerTitle: '',
                headerShown: true,
                headerBackVisible: false,
                headerLeft: () => <CustomHeader />,
                headerTitleAlign: 'center',
              }}
            />
          </Stack.Navigator>
        );
      case 'dine-in':
        return (
          <Stack.Navigator>
            <Stack.Screen
              name="DineIn"
              component={DineInStack}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MenuItem"
              component={MenuItemScreen}
              options={{
                headerTitle: '',
                headerShown: true,
                headerBackVisible: false,
                headerLeft: () => <CustomHeader />,
                headerTitleAlign: 'center',
              }}
            />
          </Stack.Navigator>
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
