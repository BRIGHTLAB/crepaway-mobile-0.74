import React, { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Tabs from '../components/UI/Tabs';
import Button from '../components/UI/Button';
import Icon_Delivery from '../../assets/SVG/Icon_Delivery';
import Icon_Take_Away from '../../assets/SVG/Icon_Take_Away';
import Icon_Dine_In from '../../assets/SVG/Icon_Dine_In';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../theme';
import BottomSheet from '@gorhom/bottom-sheet';
import { useGetOrderTypesQuery } from '../api/ordersApi';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import SelectSheet from '../components/Sheets/SelectSheet';
import { useGetMenuBranchesQuery } from '../api/branchesApi';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/NavigationStack';
import { useDispatch } from 'react-redux';
import {
  setAddress,
  setBranchName,
  setOrderType,
} from '../store/slices/userSlice';
import DeliverySheet from '../components/Sheets/ServiceSelection/DeliverySheet';
import TakeawaySheet from '../components/Sheets/ServiceSelection/TakeawaySheet';
import store from '../store/store';
import {
  clearCart,
  setCartBranchName,
  setCartOrderType,
} from '../store/slices/cartSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const ORDER_TYPE_ICONS: Record<
  Exclude<OrderType['alias'], null>,
  JSX.Element
> = {
  delivery: <Icon_Delivery />,
  takeaway: <Icon_Take_Away />,
  'dine-in': <Icon_Dine_In />,
};

const ORDER_TYPE_BACKGROUNDS = {
  delivery: require('../../assets/images/main/delivery-take-away-bg.gif'),
  takeaway: require('../../assets/images/main/delivery-take-away-bg.gif'),
  'dine-in': require('../../assets/images/main/smart-dining-hub-bg.jpg'),
  default: require('../../assets/images/main/delivery-take-away-bg.gif'),
};

const ContentSkeleton = () => (
  <SkeletonPlaceholder
    backgroundColor="rgba(0, 0, 0, 0.8)"
    highlightColor="rgba(255, 255, 255, 0.1)">
    <>
      <View style={styles.textContainer}>
        <SkeletonPlaceholder.Item
          width={280}
          height={70}
          borderRadius={8}
          marginBottom={16}
        />
        <SkeletonPlaceholder.Item
          width={320}
          height={24}
          borderRadius={8}
          marginBottom={8}
        />
        <SkeletonPlaceholder.Item
          width={320}
          height={24}
          borderRadius={8}
          marginBottom={8}
        />
        <SkeletonPlaceholder.Item
          width={280}
          height={24}
          borderRadius={8}
          marginBottom={40}
        />
      </View>
      <SkeletonPlaceholder.Item width={'100%'} height={56} borderRadius={12} />
    </>
  </SkeletonPlaceholder>
);

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Delivery'>;

const ServiceSelectionScreen = () => {
  const { t } = useTranslation();
  const { data: orderTypes, isLoading: orderTypesLoading } =
    useGetOrderTypesQuery();
  const { data: branches, isLoading: branchesLoading } =
    useGetMenuBranchesQuery('delivery');

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);

  // Track previous and current background for smooth transitions
  const [currentBackground, setCurrentBackground] = useState<any>(null);
  const [prevBackground, setPrevBackground] = useState<any>(null);

  // Animation values for cross-fading
  const currentOpacity = useRef(new Animated.Value(1)).current;
  const prevOpacity = useRef(new Animated.Value(0)).current;

  const addressSheetRef = useRef<BottomSheet>(null);
  const takeawaySheetRef = useRef<BottomSheet>(null);
  const branchesSheetRef = useRef<BottomSheet>(null);

  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();

  const [showSheets, setShowSheets] = useState(false);

  useEffect(() => {
    // Small delay to ensure sheets don't automatically open
    const timer = setTimeout(() => {
      setShowSheets(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const branchOptions = useMemo(
    () =>
      branches?.map(branch => ({
        label: branch.name,
        value: branch.id,
      })) || [],
    [branches],
  );

  // Set initial background when order types load
  useEffect(() => {
    if (orderTypes && orderTypes.length > 0) {
      const initialAlias = orderTypes[0]?.alias;
      const initialBackground =
        initialAlias && initialAlias in ORDER_TYPE_BACKGROUNDS
          ? ORDER_TYPE_BACKGROUNDS[initialAlias]
          : ORDER_TYPE_BACKGROUNDS.default;

      setCurrentBackground(initialBackground);
    } else {
      setCurrentBackground(ORDER_TYPE_BACKGROUNDS.default);
    }
  }, [orderTypes]);

  // Handle background image changes when selected tab changes
  useEffect(() => {
    if (!orderTypes || orderTypes.length === 0) return;

    const alias = orderTypes[selectedIdx]?.alias;
    const newBackground =
      alias && alias in ORDER_TYPE_BACKGROUNDS
        ? ORDER_TYPE_BACKGROUNDS[alias]
        : ORDER_TYPE_BACKGROUNDS.default;

    // Only update if background actually changed
    if (newBackground !== currentBackground) {
      // Store previous background for crossfade
      setPrevBackground(currentBackground);
      setCurrentBackground(newBackground);

      // Reset opacities for animation
      prevOpacity.setValue(1);
      currentOpacity.setValue(0);

      // Animate crossfade
      Animated.parallel([
        Animated.timing(prevOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(currentOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedIdx, orderTypes, currentBackground, prevOpacity, currentOpacity]);

  const getOrderTypeIcon = useCallback((alias: OrderType['alias']) => {
    return alias ? ORDER_TYPE_ICONS[alias] : ORDER_TYPE_ICONS.delivery;
  }, []);

  const handleBranchChange = (value: number | null) => {
    console.log('changing branch', value);
    const cartBranchName = store.getState().cart.branchName;
    const cartItems = store.getState().cart.items;
    const hasCartItems = Object.keys(cartItems).length > 0;
    const selectedBranchName = branches?.find(br => br.id === value)?.name;


    if (
      cartBranchName &&
      hasCartItems &&
      cartBranchName !== selectedBranchName
    ) {
      Alert.alert(
        'Change Branch',
        `You have items in your cart for ${cartBranchName}. Changing to ${selectedBranchName} will clear your current cart.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Change & Clear Cart',
            onPress: () => {
              dispatch(clearCart());
              setSelectedBranch(value);
              dispatch(
                setOrderType({
                  menuType: 'delivery',
                  orderTypeAlias: 'takeaway',
                }),
              );
              dispatch(
                setBranchName(
                  branches?.find(br => br.id === value)?.name || null,
                ),
              );
            },
          },
        ],
      );
    } else {
      setSelectedBranch(value);
      dispatch(
        setOrderType({
          menuType: 'delivery',
          orderTypeAlias: 'takeaway',
        }),
      );
      dispatch(setBranchName(selectedBranchName || null));
      dispatch(setCartBranchName(selectedBranchName || null));
    }
  };

  const { bottom, top } = useSafeAreaInsets();

  const tabs = useMemo(
    () =>
      orderTypes?.map(ot => ({
        title: ot.type_title,
        icon: getOrderTypeIcon(ot.alias),
      })) || [],
    [orderTypes, getOrderTypeIcon],
  );

  // const handleProceed = useCallback(() => {
  //   if (!orderTypes || orderTypes.length === 0) return;

  //   const cartOrderType = store.getState().cart.orderType;
  //   const cartItems = store.getState().cart.items;
  //   const hasCartItems = Object.keys(cartItems).length > 0;
  //   const alias = orderTypes[selectedIdx]?.alias;

  //   if (cartOrderType && cartOrderType !== orderTypes[selectedIdx]?.alias) {
  //     console.log('different order type');
  //   }

  //   switch (alias) {
  //     case 'delivery':
  //       addressSheetRef.current?.expand();

  //       break;
  //     case 'takeaway':
  //       takeawaySheetRef.current?.expand();

  //       break;
  //     case 'dine-in':
  //       dispatch(
  //         setAddress({
  //           id: null,
  //           latitude: null,
  //           longitude: null,
  //         }),
  //       );
  //       break;
  //   }
  // }, [selectedIdx, orderTypes]);

  const handleProceed = useCallback(() => {
    if (!orderTypes || orderTypes.length === 0) return;

    const cartOrderType = store.getState().cart.orderType;
    const cartItems = store.getState().cart.items;
    const hasCartItems = Object.keys(cartItems).length > 0;
    const alias = orderTypes[selectedIdx]?.alias;

    if (cartOrderType && cartOrderType !== alias && hasCartItems) {
      Alert.alert(
        'Change Cart',
        `You have items in your cart for ${cartOrderType}. Changing to ${alias} will clear your current cart.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Change & Clear Cart',
            onPress: () => {
              dispatch(clearCart());
              dispatch(setCartOrderType(alias));
              proceedWithOrderType(alias);
            },
          },
        ],
      );
    } else {
      dispatch(setCartOrderType(alias));
      proceedWithOrderType(alias);
    }
  }, [selectedIdx, orderTypes, dispatch]);

  const proceedWithOrderType = useCallback(
    (alias: OrderType['alias']) => {
      switch (alias) {
        case 'delivery':
          addressSheetRef.current?.expand();
          break;
        case 'takeaway':
          takeawaySheetRef.current?.expand();
          break;
        case 'dine-in':
          // dispatch(
          //   setAddress({
          //     id: null,
          //     title:null,
          //     latitude: null,
          //     longitude: null,
          //   }),
          // );


          Alert.alert(
            'Dine In Experience',
            `Coming soon!`,
            [
              {
                text: 'Okay',
                style: 'cancel',
              },
            ],
          );

          // uncomment the part below when we need to enable dine-in
          // dispatch(
          //   setOrderType({
          //     menuType: 'dine-in',
          //     orderTypeAlias: 'dine-in',
          //   }),
          // );
          break;
      }
    },
    [dispatch, orderTypes, selectedIdx],
  );

  const handleSelectPress = () => {
    takeawaySheetRef.current?.close();
    setTimeout(() => {
      branchesSheetRef.current?.expand();
    }, 200);
  };

  return (
    <>
      <View style={[styles.container, {
        paddingBottom: bottom,
        paddingTop: top
      }]}>
        {/* Previous background image (for crossfade) */}
        {prevBackground && (
          <Animated.View
            style={[styles.backgroundImageContainer, { opacity: prevOpacity }]}>
            <FastImage
              source={prevBackground}
              style={styles.backgroundImage}
              resizeMode={FastImage.resizeMode.cover}
            />
          </Animated.View>
        )}

        {/* Current background image */}
        {currentBackground && (
          <Animated.View
            style={[
              styles.backgroundImageContainer,
              { opacity: currentOpacity },
            ]}>
            <FastImage
              source={currentBackground}
              style={styles.backgroundImage}
              resizeMode={FastImage.resizeMode.cover}
            />
          </Animated.View>
        )}

        <LinearGradient
          style={styles.imageOverlay}
          colors={['rgba(0, 0, 0, 0.2)', 'black']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        <View style={styles.contentContainer}>
          <Tabs
            tabs={tabs}
            selectedIndex={selectedIdx}
            onTabPress={setSelectedIdx}
            isLoading={orderTypesLoading}
          />

          {orderTypesLoading ? (
            <ContentSkeleton />
          ) : (
            <>
              <View style={styles.textContainer}>
                <Text style={styles.title}>
                  {orderTypes?.[selectedIdx]?.title}
                </Text>
                <Text style={styles.description}>
                  {orderTypes?.[selectedIdx]?.description}
                </Text>
              </View>
              <Button onPress={handleProceed}>Proceed</Button>
            </>
          )}
        </View>
      </View>
      {showSheets && (
        <>
          <DeliverySheet ref={addressSheetRef} />
          <TakeawaySheet
            selectedBranch={
              branchOptions.find(br => br.value === selectedBranch)?.label ||
              null
            }
            ref={takeawaySheetRef}
            onSelectPress={handleSelectPress}
          />
          <SelectSheet
            ref={branchesSheetRef}
            value={selectedBranch}
            options={branchOptions}
            onChange={handleBranchChange}
            title="Select Branch"
            loading={branchesLoading}
          />
        </>
      )}
    </>
  );
};

export default ServiceSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: SCREEN_PADDING.horizontal,
    // paddingVertical: SCREEN_PADDING.vertical,
    backgroundColor: 'black', // Prevents gray flash
  },
  imageOverlay: {
    position: 'absolute',
    width: width,
    height: height,
    left: 0,
    bottom: 0,
    zIndex: 2,
  },
  backgroundImageContainer: {
    position: 'absolute',
    width: width,
    height: height,
    bottom: 0,
    left: 0,
    zIndex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    gap: 24,
    justifyContent: 'flex-end',
    zIndex: 3,
  },
  textContainer: {
    minHeight: 250,
  },
  title: {
    ...TYPOGRAPHY.LARGE_TITLE,
    color: COLORS.lightColor,
  },
  description: {
    ...TYPOGRAPHY.HEADLINE,
    color: COLORS.lightColor,
    opacity: 0.4,
  },
});
