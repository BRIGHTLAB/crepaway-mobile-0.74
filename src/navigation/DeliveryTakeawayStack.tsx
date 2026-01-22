import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Icon_Nav_Fav from '../../assets/SVG/Icon_Nav_Fav';
import Icon_Nav_Home from '../../assets/SVG/Icon_Nav_Home';
import Icon_Nav_Orders from '../../assets/SVG/Icon_Nav_Order';
import Icon_Nav_Profile from '../../assets/SVG/Icon_Nav_Profile';
import Icon_Nav_Search from '../../assets/SVG/Icon_Nav_Search';
import { useGetCartQuery } from '../api/cartApi';
import { CustomBottomTab } from '../components/CustomBottomTab';
import CustomHeader from '../components/Header';
import CartCounter from '../components/Menu/CartCounter';
import AddressMapScreen from '../screens/AddressMapScreen';
import AllergiesScreen from '../screens/AllergiesScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import FAQScreen from '../screens/FAQScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import FeaturedItemsScreen from '../screens/FeaturedItemsScreen';
import HomeScreen from '../screens/HomeScreen';
import LegalScreen from '../screens/LegalScreen';
import MenuItemsScreen from '../screens/MenuItemsScreen';
import NewItemsScreen from '../screens/NewItemsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import OfferDetailsScreen from '../screens/OfferDetailsScreen';
import OffersScreen from '../screens/OffersScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import ProfileAddressesScreen from '../screens/ProfileAddressesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import SearchScreen from '../screens/SearchScreen';
import TrackOrderScreen from '../screens/TrackOrderScreen';
import WalletScreen from '../screens/WalletScreen';
import { setCartFromFetch } from '../store/slices/cartSlice';
import { useAppDispatch } from '../store/store';
import { RootStackParamList } from './NavigationStack';

export type DeliveryTakeawayStackParamList = {
  HomeStack: any;
  SearchStack: any;
  OrderStack: any;
  FavoritesStack: any;
  ProfileStack: any;
  Home: undefined;
  Offers: undefined;
  OfferDetails: { itemId: number };
  FavoriteItems: undefined;
  NewItems: undefined;
  featuredItems: undefined;
  MenuItems: { item: Category };
  Cart: undefined;
  Notifications: undefined;
  Checkout: undefined;
  AddressMap: { editAddress?: Address } | undefined;
  TrackOrder: { orderId: number; order_type: string; addressLatitude?: number; addressLongitude?: number };
  Profile: undefined;
  ProfileSettings: undefined;
  Addresses: undefined;
  Legal: undefined;
  FAQ: undefined;
  PaymentMethods: undefined;
  Allergies: undefined;
  Orders: undefined;
  OrderDetails: { id: number; order_type: string };
  Search: undefined;
  Favorites: undefined;
};

const Tab = createBottomTabNavigator<DeliveryTakeawayStackParamList>();

const Stack = createNativeStackNavigator();

const HomeStack = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();

  const { data: cartData, isLoading } = useGetCartQuery();

  useEffect(() => {
    if (cartData) {
      console.log('cartData', cartData);

      dispatch(
        setCartFromFetch({
          items: cartData.items || {},
        }),
      );
    }
  }, [cartData]);

  return (
    <Stack.Navigator
      screenOptions={{

      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTransparent: true,
          gestureEnabled: false,
          title: "",
          headerLeft: () => <CustomHeader color={'white'} clearOrderType />,
          headerTitleAlign: 'center',
          headerTitle: "hii",
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
                gap: 5,
              }}>
              {/* <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', { screen: 'Cart' })
                }>
                <CartCounter color={'white'} />
              </TouchableOpacity> */}
              {/* <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', {
                    screen: 'Notifications',
                  })
                }>
                <NotificationsCounter color={'white'} />
              </TouchableOpacity> */}
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="Offers"
        component={OffersScreen}
        options={{
          headerTitle: 'Exclusive Offers',
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
                gap: 5,
              }}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', { screen: 'Cart' })
                }>
                <CartCounter />
              </TouchableOpacity>
              {/* <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', {
                    screen: 'Notifications',
                  })
                }>
                <NotificationsCounter />
              </TouchableOpacity> */}
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="OfferDetails"
        component={OfferDetailsScreen}
        options={{
          headerTitle: 'Exclusive Offer',
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="FavoriteItems"
        component={FavoritesScreen}
        options={{
          headerTitle: 'Favorite Items',
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
                gap: 5,
              }}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', { screen: 'Cart' })
                }>
                <CartCounter />
              </TouchableOpacity>
              {/* <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', {
                    screen: 'Notifications',
                  })
                }>
                <NotificationsCounter />
              </TouchableOpacity> */}
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="NewItems"
        component={NewItemsScreen}
        options={{
          headerTitle: 'New Items',
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
                gap: 5,
              }}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', { screen: 'Cart' })
                }>
                <CartCounter />
              </TouchableOpacity>
              {/* <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', {
                    screen: 'Notifications',
                  })
                }>
                <NotificationsCounter />
              </TouchableOpacity> */}
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="featuredItems"
        component={FeaturedItemsScreen}
        options={{
          headerTitle: 'Featured Items',
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
                gap: 5,
              }}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', { screen: 'Cart' })
                }>
                <CartCounter />
              </TouchableOpacity>
              {/* <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', {
                    screen: 'Notifications',
                  })
                }>
                <NotificationsCounter />
              </TouchableOpacity> */}
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="MenuItems"
        component={MenuItemsScreen}
        options={{
          headerTitle: 'Menu',
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
          // contentStyle: {
          //   pointerEvents: 'none',
          // },
          headerShadowVisible: false,
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
                gap: 5,
              }}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', { screen: 'Cart' })
                }>
                <CartCounter />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          headerTitle: 'Cart',
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerTitle: 'Notifications',
        }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          headerTitle: 'Checkout',
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="AddressMap"
        component={AddressMapScreen}
        options={{
          headerTitle: 'Checkout',
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="TrackOrder"
        component={TrackOrderScreen}
        options={{
          headerTitle: 'Track Order',
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
};

export type SearchStackParamList = {
  Search: undefined;
};

const SearchStack = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Stack.Navigator
      screenOptions={{

      }}
    >
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerTitle: 'Search',
          headerBackVisible: false,
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
};

export type FavoritesStackParamList = {
  Favorites: undefined;
};


const FavoritesStack = () => {

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Stack.Navigator
      screenOptions={{

      }}
    >
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          headerTitle: 'Favorites',
          headerBackVisible: false,
          headerTitleAlign: 'center',
        }}
      />


    </Stack.Navigator>
  );
};

export type ProfileStackParamList = {
  Profile: undefined;
  ProfileSettings: undefined;
  Addresses: undefined;
  AddressMap: { editAddress?: Address } | undefined;
  Legal: undefined;
  FAQ: undefined;
  PaymentMethods: undefined;
  Allergies: undefined;
  FavoriteItems: undefined;
  Wallet: undefined;
};

const ProfileStack = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Stack.Navigator
      screenOptions={{

      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerBackVisible: false,
          headerTitleAlign: 'center'
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
        name="Addresses"
        component={ProfileAddressesScreen}
        options={{
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="AddressMap"
        component={AddressMapScreen}
        options={{
          headerTitle: 'Map',
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
    </Stack.Navigator>
  );
};

export type OrdersStackParamList = {
  Orders: undefined;
  OrderDetails: {
    id: number;
    order_type: string;
  };
  TrackOrder: {
    orderId: number;
    order_type: string;
    addressLatitude?: number;
    addressLongitude?: number;
  };
};

const OrderStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
      }}>
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          headerTitle: 'Orders',
          headerBackVisible: false,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{
          headerTitle: 'Orders',
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="TrackOrder"
        component={TrackOrderScreen}
        options={{
          headerTitle: 'Track Order',
          headerBackVisible: false,
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
};

export const navigationData = [
  {
    name: 'SearchStack',
    Component: SearchStack,
    title: 'search',
    Icon: Icon_Nav_Search,
    headerShown: false,
    initialScreen: 'Search'
  },
  {
    name: 'OrderStack',
    Component: OrderStack,
    title: 'orders',
    Icon: Icon_Nav_Orders,
    headerShown: false,
    initialScreen: 'Orders'
  },
  {
    name: 'HomeStack',
    Component: HomeStack,
    title: '',
    Icon: Icon_Nav_Home,
    headerShown: false,
    initialScreen: 'Home'
  },
  {
    name: 'FavoritesStack',
    Component: FavoritesStack,
    title: 'favorites',
    Icon: Icon_Nav_Fav,
    headerShown: false,
    initialScreen: 'Favorites'
  },
  {
    name: 'ProfileStack',
    Component: ProfileStack,
    title: 'profile',
    Icon: Icon_Nav_Profile,
    headerShown: false,
    initialScreen: 'Profile'
  },
];


const DeliveryTakeawayStack = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeStack"

      tabBar={props => <CustomBottomTab {...(props as any)} navigationData={navigationData} />}
    >
      {navigationData?.map((el, idx) => (
        <Tab.Screen
          key={idx}
          name={el?.name as keyof DeliveryTakeawayStackParamList}
          component={el?.Component}
          // listeners={({ navigation, route }) => ({
          //   tabPress: (e) => {
          //     e.preventDefault();
          //     navigation.navigate(el.name as any
          //       , {
          //         screen: el.initialScreen
          //}       
          //     )
          //   },
          // })}
          options={{
            headerShown: el?.headerShown,
            headerStyle: {
              height: 55,
            },
            headerTitleAlign: 'center',
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default DeliveryTakeawayStack;

const styles = StyleSheet.create({

});