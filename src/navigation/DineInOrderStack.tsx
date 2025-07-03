import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import CartScreen from '../screens/CartScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import DineInOrderScreen from '../screens/DineInOrderScreen';
import DineInMenuItemsScreen from '../screens/DineInMenuItemsScreen';
import DineInNewItemsScreen from '../screens/DineInNewItemsScreen';
import DineInMenuItemScreen from '../screens/DineInMenuItemScreen';
import DineInFavoritesScreen from '../screens/DineInFavoritesScreen';
import DineInOffersScreen from '../screens/DineInOffersScreen';
import OfferDetailsScreen from '../screens/OfferDetailsScreen';
import CustomHeader from '../components/Header';
import {OrderedItem} from '../screens/TableScreen';

const Stack = createNativeStackNavigator();

export type DineInOrderStackParamList = {
  Order: undefined;
  MenuItems: {item: any};
  NewItems: undefined;
  MenuItem: {itemId: number; itemUuid?: string; item?: OrderedItem};
  Favorites: undefined;
  BestSellers: undefined;
  OffersStack: {
    screen: keyof DineInOffersStackParamList;
    params?: DineInOffersStackParamList[keyof DineInOffersStackParamList];
  };
};

const DineInOrderStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitle: '',
      }}>
      <Stack.Screen
        name="Order"
        component={DineInOrderScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MenuItems"
        component={DineInMenuItemsScreen}
        options={{
          headerLeft: () => <CustomHeader />,
        }}
      />
      <Stack.Screen
        name="Favorites"
        component={DineInFavoritesScreen}
        options={{
          headerLeft: () => <CustomHeader />,
        }}
      />
      <Stack.Screen
        name="NewItems"
        component={DineInNewItemsScreen}
        options={{
          headerLeft: () => <CustomHeader />,
        }}
      />
      <Stack.Screen
        name="MenuItem"
        component={DineInMenuItemScreen}
        options={{
          headerLeft: () => <CustomHeader />,
        }}
      />
      <Stack.Screen
        name="OffersStack"
        component={DineInOffersStack}
        options={{
          headerLeft: () => <CustomHeader />,
        }}
      />
      {/* <Stack.Screen name="BestSellers" component={BestSellersScreen} /> */}
    </Stack.Navigator>
  );
};

export type DineInOffersStackParamList = {
  Offers: undefined;
  OfferDetails: {itemId: number};
};

const DineInOffersStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Offers" component={DineInOffersScreen} />
      <Stack.Screen name="OfferDetails" component={OfferDetailsScreen} />

      {/* <Stack.Screen name="BestSellers" component={BestSellersScreen} /> */}
    </Stack.Navigator>
  );
};

export default DineInOrderStack;
