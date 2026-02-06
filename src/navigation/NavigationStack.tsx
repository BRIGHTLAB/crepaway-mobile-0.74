import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import store, { RootState, useAppDispatch } from '../store/store';

import { useGetPendingRatingQuery } from '../api/ordersApi';
import CustomHeader from '../components/Header';
import OrderRatingSheet, { OrderRatingSheetRef } from '../components/Sheets/OrderRatingSheet';
import MenuItemScreen from '../screens/MenuItemScreen';
import SplashScreen from '../screens/SplashScreen';
import NavigationHelper from '../utils/NavigationHelper';
import NotificationService from '../utils/NotificationService';
import DeliveryTakeawayStack, {
  DeliveryTakeawayStackParamList,
  ProfileStackParamList,
} from './DeliveryTakeawayStack';
import DineInStack from './DineInStack';
import linking, { processPendingDeepLink } from './linking';
import LoginStack, { LoginStackParamList } from './LoginStack';
import ServiceSelectionStack, {
  ServiceSelectionStackParamList,
} from './ServiceSelectionStack';

export type RootStackParamList = {
  LoginStack: {
    screen: keyof LoginStackParamList;
    params?: LoginStackParamList[keyof LoginStackParamList];
  };
  DeliveryTakeaway: {
    screen?: keyof DeliveryTakeawayStackParamList;
    params?: DeliveryTakeawayStackParamList[keyof DeliveryTakeawayStackParamList];
  } | undefined;
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
  Test: undefined;
};

import * as Sentry from '@sentry/react-native';

const Stack = createNativeStackNavigator();

type NavigationStackProps = {
  onSplashFinish?: () => void;
};

const NavigationStack = ({ onSplashFinish }: NavigationStackProps) => {
  const [isSplashAnimationFinished, setIsSplashAnimationFinished] =
    useState(false);
  const { isLoggedIn, orderType, id, name } = useSelector((state: RootState) => state.user);
  const dispatch = useAppDispatch();
  const notificationInstance = NotificationService.getInstance();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const ratingSheetRef = useRef<OrderRatingSheetRef>(null);
  const [hasShownRating, setHasShownRating] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

  const { data: pendingOrderToRate } = useGetPendingRatingQuery(undefined, {
    skip: hasShownRating || !isSplashAnimationFinished || !isLoggedIn,
  });

  useEffect(() => {
    if (pendingOrderToRate?.id && isSplashAnimationFinished && !hasShownRating) {
      setPendingOrderId(pendingOrderToRate.id);
      // Small delay to ensure the sheet ref is ready
      setTimeout(() => {
        ratingSheetRef.current?.expand();
      }, 100);
      setHasShownRating(true);
    }
    console.log('wehavePendingOrdertoRate', pendingOrderToRate)
  }, [pendingOrderToRate, isSplashAnimationFinished, hasShownRating]);

  // Initialize notification service when user logs in
  useEffect(() => {
    if (!isLoggedIn || !navigationRef.current) return;
    notificationInstance.init(navigationRef.current);
  }, [isLoggedIn]);


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
                onAnimationFinish={() => {
                  setIsSplashAnimationFinished(true);
                  onSplashFinish?.();
                }}
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
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={() => {
        if (!navigationRef.current) return;
        
        NavigationHelper.getInstance().setNavigationRef(navigationRef.current);
        
        // Initialize notification service if user is logged in
        const { isLoggedIn: currentIsLoggedIn } = store.getState().user;
        if (currentIsLoggedIn) {
          notificationInstance.init(navigationRef.current);
        }
        
        setTimeout(() => processPendingDeepLink(), 100);
      }}
    >
      {renderStack()}
      <OrderRatingSheet
        ref={ratingSheetRef}
        orderId={pendingOrderId ?? 0}
        title="Rate your last order"
      />
    </NavigationContainer>
  );
};

export default NavigationStack;
