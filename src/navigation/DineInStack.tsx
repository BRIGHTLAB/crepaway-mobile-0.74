import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import Icon_BackArrow from '../../assets/SVG/Icon_BackArrow';
import DineInPendingScreen from '../screens/DineInPendingScreen';
import ScanTableScreen from '../screens/ScanTableScreen';
import TableScreen from '../screens/TableScreen';
import { setOrderType } from '../store/slices/userSlice';
import DineInOrderStack from './DineInOrderStack';

const Stack = createNativeStackNavigator();
export type DineInStackParamList = {
  ScanTable: undefined;
  Pending: undefined;
  Table: {
    wasApproved: boolean
  } | undefined;
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
          headerLeft: () => {
            return (
              <View
                style={{
                  width: 70,
                  height: 30,
                  paddingTop: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    dispatch(
                      setOrderType({
                        menuType: null,
                        orderTypeAlias: null,
                      }),
                    );
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Icon_BackArrow color={'black'} />
                  <Text
                    style={{
                      color: 'black',
                      fontFamily: 'Poppins-Medium',
                      fontSize: 16,
                    }}>
                    Back
                  </Text>
                </TouchableOpacity>
              </View>
            );
          },
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
