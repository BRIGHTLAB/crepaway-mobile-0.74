import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CustomHeader from '../components/Header';
import AddressesScreen from '../screens/AddressesScreen';
import AddressMapScreen from '../screens/AddressMapScreen';
import ServiceSelectionScreen from '../screens/ServiceSelectionScreen';

export type ServiceSelectionStackParamList = {
  ServiceSelection: undefined;
  Addresses: undefined;
  AddressMap: undefined;
};

const Stack = createNativeStackNavigator();

const ServiceSelectionStack = () => {
  return (
    <Stack.Navigator>
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
