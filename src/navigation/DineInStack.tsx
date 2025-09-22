import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useDispatch } from 'react-redux';
import CustomHeader from '../components/Header';
import DineInPendingScreen from '../screens/DineInPendingScreen';
import ScanTableScreen from '../screens/ScanTableScreen';
import TableScreen from '../screens/TableScreen';
import DineInOrderStack from './DineInOrderStack';

const Stack = createNativeStackNavigator();
export type DineInStackParamList = {
  ScanTable: undefined;
  Pending: undefined;
  Table: undefined;
  OrderStack:
  | {
    screen?: string;
    params?: any;
  }
  | undefined;
};

const DineInStack = () => {
  const dispatch = useDispatch();
  // TODO add dine-in stack.
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ScanTable"
        component={ScanTableScreen}
        options={{
          headerTitle: '',
          headerBackVisible: false,
          headerLeft: () => <CustomHeader clearOrderType />,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="Pending"
        component={DineInPendingScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Table"
        component={TableScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="OrderStack"
        component={DineInOrderStack}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default DineInStack;
