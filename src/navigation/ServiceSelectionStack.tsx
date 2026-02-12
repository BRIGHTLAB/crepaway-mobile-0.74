import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CustomHeader from '../components/Header';
import AddressesScreen from '../screens/AddressesScreen';
import AddressMapScreen from '../screens/AddressMapScreen';
import AllergiesScreen from '../screens/AllergiesScreen';
import FAQScreen from '../screens/FAQScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import LegalScreen from '../screens/LegalScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import ProfileAddressesScreen from '../screens/ProfileAddressesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import ServiceSelectionScreen from '../screens/ServiceSelectionScreen';
import WalletScreen from '../screens/WalletScreen';

export type ServiceSelectionStackParamList = {
  ServiceSelection: undefined;
  Addresses: undefined;
  AddressMap: { editAddress?: Address } | undefined;
  Profile: undefined;
  ProfileSettings: undefined;
  ProfileAddresses: undefined;
  Legal: undefined;
  FAQ: undefined;
  PaymentMethods: undefined;
  Allergies: undefined;
  FavoriteItems: undefined;
  Wallet: undefined;
};

const Stack = createNativeStackNavigator();

const ServiceSelectionStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="ServiceSelection"
        component={ServiceSelectionScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Addresses"
        component={AddressesScreen}
        options={{
          title: 'Addresses',
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
        }}
      />

      <Stack.Screen
        name="AddressMap"
        component={AddressMapScreen}
        options={{
          title: 'Enter Location',
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
        }}
      />

      {/* Profile Screens */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="ProfileSettings"
        component={ProfileSettingsScreen}
        options={{
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
          headerTitle: 'Profile Settings',
        }}
      />
      <Stack.Screen
        name="ProfileAddresses"
        component={ProfileAddressesScreen}
        options={{
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="Legal"
        component={LegalScreen}
        options={{
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="FAQ"
        component={FAQScreen}
        options={{
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
          headerTitle: 'Payment Methods',
        }}
      />
      <Stack.Screen
        name="Allergies"
        component={AllergiesScreen}
        options={{
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
          headerTitle: 'Allergies',
        }}
      />
      <Stack.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
          headerTitle: 'Wallet',
        }}
      />
      <Stack.Screen
        name="FavoriteItems"
        component={FavoritesScreen}
        options={{
          headerTitle: 'Favorite Items',
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
        }}
      />
      {/* <Stack.Screen
        name="MapsMain"
        component={MapsView}
        options={{
          title: 'Enter Location',
          headerTitleAlign: 'center',
          headerLeft: () => <BackButton />,
          headerStyle: {
            backgroundColor: '#fff', // Customize as needed
            ...Platform.select({
              android: {
                elevation: 0, // Remove shadow on Android
              },
              ios: {
                shadowOpacity: 0, // Remove shadow on iOS
                borderBottomWidth: 0, // Remove border on iOS
                shadowColor: 'transparent', // Ensure no shadow color on iOS
              },
            }),
          },
        }}
      />
      <Stack.Screen
        name="Address"
        component={AddressListView}
        options={{
          title: 'Addresses',
          headerTitleAlign: 'center',
          headerLeft: () => <BackButton />,
          headerStyle: {
            backgroundColor: '#fff', // Customize as needed
            ...Platform.select({
              android: {
                elevation: 0, // Remove shadow on Android
              },
              ios: {
                shadowOpacity: 0, // Remove shadow on iOS
                borderBottomWidth: 0, // Remove border on iOS
                shadowColor: 'transparent', // Ensure no shadow color on iOS
              },
            }),
          },
        }}
      /> */}
    </Stack.Navigator>
  );
};

export default ServiceSelectionStack;
