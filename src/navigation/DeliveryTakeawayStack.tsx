import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon_Nav_Fav from '../../assets/SVG/Icon_Nav_Fav';
import Icon_Nav_Home from '../../assets/SVG/Icon_Nav_Home';
import Icon_Nav_Orders from '../../assets/SVG/Icon_Nav_Order';
import Icon_Nav_Profile from '../../assets/SVG/Icon_Nav_Profile';
import Icon_Nav_Search from '../../assets/SVG/Icon_Nav_Search';
import { useGetCartQuery } from '../api/cartApi';
import CustomHeader from '../components/Header';
import CartCounter from '../components/Menu/CartCounter';
import NotificationsCounter from '../components/Notifications/NotificationsCounter';
import AddressMapScreen from '../screens/AddressMapScreen';
import AllergiesScreen from '../screens/AllergiesScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import FAQScreen from '../screens/FAQScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import FeaturedItemsScreen from '../screens/FeaturedItemsScreen';
import HomeScreen from '../screens/HomeScreen';
import LegalScreen from '../screens/LegalScreen';
import MenuItemScreen from '../screens/MenuItemScreen';
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
import { COLORS } from '../theme';
import { RootStackParamList } from './NavigationStack';

interface CustomBottomTabProps {
  state: {
    index: number;
    routes: Array<{
      key: string;
      name: string;
    }>;
  };
  descriptors: {
    [key: string]: {
      options: {
        tabBarAccessibilityLabel?: string;
      };
    };
  };
  navigation: {
    navigate: (name: string) => void;
    emit: (event: {
      type: string;
      target: string;
      canPreventDefault: boolean;
    }) => { defaultPrevented: boolean };
  };
}

const CustomBottomTab = ({
  state,
  descriptors,
  navigation,
}: CustomBottomTabProps) => {
  return (
    <View style={styles.bottomTabContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const navItem = navigationData.find(item => item.name === route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={[
              styles.tabItem,
              navItem?.name === 'HomeStack' && styles.homeTabItem,
            ]}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}>
            <NavigationItem
              Icon={navItem?.Icon}
              title={navItem?.title || ''}
              name={navItem?.name}
              focused={isFocused}
              headerShown={navItem?.headerShown}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

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
  MenuItem: { itemId: number; itemUuid?: string };
  Cart: undefined;
  Notifications: undefined;
  Checkout: undefined;
  AddressMap: undefined;
  TrackOrder: { orderId: number; order_type: string };
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
          headerLeft: () => <CustomHeader color={'white'} />,
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
                <CartCounter color={'white'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', {
                    screen: 'Notifications',
                  })
                }>
                <NotificationsCounter color={'white'} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="Offers"
        component={OffersScreen}
        options={{
          headerTitle: 'Exclusive Offers',
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
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', {
                    screen: 'Notifications',
                  })
                }>
                //<NotificationsCounter />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="OfferDetails"
        component={OfferDetailsScreen}
        options={{
          headerTitle: 'Exclusive Offer',
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
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', {
                    screen: 'Notifications',
                  })
                }>
                <NotificationsCounter />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="NewItems"
        component={NewItemsScreen}
        options={{
          headerTitle: 'New Items',
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
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', {
                    screen: 'Notifications',
                  })
                }>
                <NotificationsCounter />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="featuredItems"
        component={FeaturedItemsScreen}
        options={{
          headerTitle: 'Featured Items',
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
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', {
                    screen: 'Notifications',
                  })
                }>
                <NotificationsCounter />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="MenuItems"
        component={MenuItemsScreen}
        options={{
          headerTitle: 'Menu',
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
          // contentStyle: {
          //   pointerEvents: 'none',
          // },

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
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', {
                    screen: 'Notifications',
                  })
                }>
                <NotificationsCounter />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="MenuItem"
        component={MenuItemScreen}
        options={{
          headerTitle: '',
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
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', { screen: 'Notifications' })
                }>
                <NotificationsCounter />
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
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="AddressMap"
        component={AddressMapScreen}
        options={{
          headerTitle: 'Checkout',
          headerLeft: () => <CustomHeader />,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="TrackOrder"
        component={TrackOrderScreen}
        options={{
          headerTitle: 'Track Order',
          headerLeft: () => <CustomHeader />,
        }}
      />
    </Stack.Navigator>
  );
};

export type SearchStackParamList = {
  Search: undefined;
};

const SearchStack = () => {
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
  AddressMap: undefined;
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
        options={{ headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="ProfileSettings"
        component={ProfileSettingsScreen}
        options={{
          headerTitleAlign: 'center', headerTitle: 'Profile Settings',

        }}
      />
      <Stack.Screen
        name="Addresses"
        component={ProfileAddressesScreen}
        options={{
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="AddressMap"
        component={AddressMapScreen}
        options={{
          headerTitle: 'Map',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="Legal"
        component={LegalScreen}
        options={{
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="FAQ"
        component={FAQScreen}
        options={{
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{
          headerTitleAlign: 'center',
          headerTitle: 'Payment Methods',
        }}
      />
      <Stack.Screen
        name="Allergies"
        component={AllergiesScreen}
        options={{
          headerTitleAlign: 'center',
          headerTitle: 'Allergies',
        }}
      />
      <Stack.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          headerTitleAlign: 'center',
          headerTitle: 'Allergies',
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
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', { screen: 'Notifications' })
                }>
                <NotificationsCounter />
              </TouchableOpacity>
            </View>
          ),
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
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{
          headerTitle: 'Orders',
          headerTitleAlign: 'center',
          headerLeft: () => <CustomHeader />,
        }}
      />
      <Stack.Screen
        name="TrackOrder"
        component={TrackOrderScreen}
        options={{
          headerTitle: 'Track Order',
          headerLeft: () => <CustomHeader />,
        }}
      />
    </Stack.Navigator>
  );
};

const navigationData = [
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

interface INavigationItem {
  Icon?: React.ComponentType<{ color: string }>;
  title: string | null;
  focused: boolean;
  name?: string;
  headerShown?: boolean;
}

const NavigationItem = ({ Icon, title, focused, name }: INavigationItem) => {
  return (
    <View
      style={{
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        elevation: 0,
        ...(name === 'HomeStack' ? { top: -10 } : {}),
      }}>
      {Icon && <Icon color={focused ? '#DB0032' : '#F7F7F7F7'} />}
      <Text
        style={{
          color: focused ? COLORS.primaryColor : COLORS.lightColor,
          fontSize: 10,
          width: '100%',
          textTransform: 'uppercase',
          fontFamily: 'Poppins-SemiBold',
        }}>
        {title}
      </Text>
    </View>
  );
};

const DeliveryTakeawayStack = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeStack"
      tabBar={props => <CustomBottomTab {...(props as CustomBottomTabProps)} />}
    >
      {navigationData?.map((el, idx) => (
        <Tab.Screen
          key={idx}
          name={el?.name as keyof DeliveryTakeawayStackParamList}
          component={el?.Component}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate(el.name as any
                , {
                  screen: el.initialScreen
                }
              )
            },
          })}
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
  bottomTabContainer: {
    flexDirection: 'row',
    backgroundColor: 'black',
    height: 70,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5,
  },
  homeTabItem: {
    marginTop: -30,
  },
  headerTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.darkColor,
  },
});