import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CustomHeader from '../components/Header';
import LoyaltyInfoScreen from '../screens/LoyaltyInfoScreen';
import LoyaltyScreen from '../screens/LoyaltyScreen';
import RedeemablePointsScreen from '../screens/RedeemablePointsScreen';
import { COLORS } from '../theme';
import { normalizeFont } from '../utils/normalizeFonts';

const Stack = createNativeStackNavigator();

const LoyaltyStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LoyaltyMain"
        component={LoyaltyScreen}
        options={{
          headerTitle: 'Loyalty Program',
          headerShown: true,
          headerStyle: {

            backgroundColor: COLORS.secondaryColor,
          },
          headerShadowVisible: false,
          headerBackVisible: false,
          headerLeft: () => <CustomHeader color={COLORS.white} />,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            color: COLORS.white,
            fontSize: normalizeFont(16),
            fontFamily: 'Poppins-Medium',

          }
        }}
      />
      <Stack.Screen
        name="RedeemablePoints"
        component={RedeemablePointsScreen}
        options={{
          headerTitle: 'Redeemable Points',
          headerShown: true,
          headerStyle: {

            backgroundColor: COLORS.secondaryColor,
          },
          headerShadowVisible: false,
          headerBackVisible: false,
          headerLeft: () => <CustomHeader color={COLORS.white} />,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            color: COLORS.white,
            fontSize: normalizeFont(16),
            fontFamily: 'Poppins-Medium',

          }
        }}
      />
      <Stack.Screen
        name="LoyaltyInfo"
        component={LoyaltyInfoScreen}
        options={{
          headerTitle: 'Loyalty Info',
          headerShown: true,
          headerStyle: {

            backgroundColor: COLORS.secondaryColor,
          },
          headerShadowVisible: false,
          headerBackVisible: false,
          headerLeft: () => <CustomHeader color={COLORS.white} />,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            color: COLORS.white,
            fontSize: normalizeFont(16),
            fontFamily: 'Poppins-Medium',

          }
        }}
      />
    </Stack.Navigator>
  );
};

export default LoyaltyStack;
