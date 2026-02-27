import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BackHandler,
  Dimensions,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useGetContentQuery } from '../api/dataApi';
import { useGetHomepageQuery } from '../api/homeApi';
import Banner from '../components/Banner';
import FadeOverlay from '../components/FadeOverlay';
import CartCounter from '../components/Menu/CartCounter';
import CategoryList from '../components/Menu/CategoryList';
import ItemsList from '../components/Menu/ItemsList';
import OffersList from '../components/Menu/OffersList';
import InfoPopup from '../components/Popups/InfoPopup';
import PromoCarousel from '../components/PromoCarousel';
import { RootStackParamList } from '../navigation/NavigationStack';
import { setOrderType } from '../store/slices/userSlice';
import { RootState, useAppDispatch } from '../store/store';

import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";
import { useGetTierProgressQuery } from '../api/loyaltyApi';
import CustomHeader from '../components/Header';
import LoyaltyProgressCard from '../components/Loyalty/LoyaltyProgressCard';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { COLORS, SCREEN_PADDING } from '../theme';

const { width } = Dimensions.get("window");
const BANNER_HEIGHT = 350;

const IMAGES = {
  bannerBg: require('../../assets/images/banner.png')
}

// Define the navigation prop type
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();

  const state = useSelector((state: RootState) => state.user);
  const { bottom, top } = useSafeAreaInsets();
  const { data: content } = useGetContentQuery();
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  // Fetch tier progress data
  const { data: tierProgress, isLoading: isTierProgressLoading } = useGetTierProgressQuery({},
    { skip: !state.id || !state.isLoggedIn }
  );

  // Get banner data based on order type
  const bannerData = useMemo(() => {
    if (!content?.length) return [];
    const bannerKey = state.orderType === 'delivery' ? 'home-delivery-swiper' : 'home-takeaway-swiper';
    return content
      .filter((item) => item.key === bannerKey && item.image_url)
      .map((item) => ({
        image: item.image_url ?? '',
        title: item.title ?? '',
      }));
  }, [content, state.orderType]);

  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          dispatch(
            setOrderType({
              menuType: null,
              orderTypeAlias: null,
            }),
          );
          return true;
        },
      );

      return () => backHandler.remove();
    }, [dispatch])
  );

  const { data, isLoading, error, refetch, isFetching } = useGetHomepageQuery({
    menuType: state.menuType,
    branch: state.branchAlias,
    addressId: state.addressId,
  });

  // Handle error from useGetHomepageQuery
  React.useEffect(() => {
    if (error) {
      setShowErrorPopup(true);
    }
  }, [error]);

  // Handle popup close - navigate to ServiceSelectionScreen
  const handleErrorPopupClose = () => {
    setShowErrorPopup(false);
    dispatch(setOrderType({
      menuType: null,
      orderTypeAlias: null,
    }));
  };

  const { refreshing, onRefresh } = usePullToRefresh({
    refetch,
    isFetching,
    isLoading,
  });

  const categories = data?.categories;
  const newItems = data?.new_items?.filter(item => item.is_paused !== 1) ?? [];
  const featuredItems = data?.featured_items?.filter(item => item.is_paused !== 1) ?? [];
  const exclusiveOffers = data?.exclusive_offers;
  const favoriteItems = data?.favorite_items?.filter(item => item.is_paused !== 1) ?? [];
  const bestSellers = data?.best_sellers?.filter(item => item.is_paused !== 1) ?? [];

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      // calculate color as string
      const iconColor = interpolateColor(
        scrollY.value,
        [0, 200],
        ["#fff", "#000"]
      );

      // pass the plain string to JS
      runOnJS(updateHeaderColor)(iconColor);
    },
  });

  function updateHeaderColor(color: string) {
    navigation.setOptions({
      headerTintColor: color,
      headerLeft: () => <CustomHeader color={color} clearOrderType title={state.orderType === 'delivery' ? 'Delivery' : 'Takeaway'} />,
      // headerTitle: () => (<Text style={{backgroundColor: COLORS.primaryColor, borderRadius: 20, paddingVertical: 4 , paddingHorizontal: 8, marginTop:4,  lineHeight: 18, color: COLORS.white, fontSize: 14, fontFamily: 'Poppins-SemiBold', textTransform: 'uppercase', letterSpacing: 1 }}>{state.orderType === 'delivery' ? 'Delivery' : 'Takeaway'}</Text>),
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
            <CartCounter color={color} />
          </TouchableOpacity>
        </View>
      ),
    });
  }

  // Update header opacity dynamically
  useLayoutEffect(() => {
    scrollY.value = 0; // reset on mount
    updateHeaderColor('#fff'); // Set initial header with white color
  }, []);

  const headerBackgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 200],
      [0, 1],
      Extrapolation.CLAMP
    );

    // React Navigation headers are controlled with setOptions → we need runOnJS
    runOnJS(navigation.setOptions)({
      headerStyle: {
        backgroundColor: `rgba(255,255,255,${opacity})`,
      },
    });

    return {};
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryColor}
            colors={[COLORS.primaryColor]}
          />
        }
      >
        <View style={styles.swiperContainer}>
          <Banner data={bannerData} />
        </View>

        <View style={styles.listsContainer}>

          <CategoryList
            data={categories ?? []}
            isLoading={isLoading}
            onCategoryPress={item => {
              navigation.navigate('HomeStack', {
                screen: 'MenuItems',
                params: { item },
              });
            }}
          />

          {/* Loyalty Tier Progress */}
          {state.isLoggedIn && tierProgress?.current_tier && (
            <View style={{
              paddingHorizontal: SCREEN_PADDING.horizontal,
            }}>
              <LoyaltyProgressCard
                tierName={tierProgress.current_tier.name}
                totalDashes={
                  tierProgress.is_max_tier
                    ? Math.round(tierProgress.current_tier.threshold)
                    : tierProgress.next_tier
                      ? Math.round(tierProgress.next_tier.threshold - tierProgress.current_tier.threshold)
                      : 10
                }
                filledDashes={
                  tierProgress.is_max_tier
                    ? Math.round(tierProgress.current_balance)
                    : Math.round(tierProgress.current_balance - tierProgress.current_tier.threshold)
                }
                progressColor={tierProgress.current_tier.extras?.color || COLORS.primaryColor}
                description={
                  tierProgress.is_max_tier
                    ? `You've reached the highest tier!`
                    : `Complete ${tierProgress.remaining_to_next_tier?.toFixed(0)} more ${tierProgress.unit?.key || 'orders'} to reach ${tierProgress.next_tier?.name}`
                }
                pointsCount={tierProgress.current_balance >= 1000 ? `${(tierProgress.current_balance / 1000).toFixed(1)}K` : tierProgress.current_balance.toFixed(0)}
                pointsUnit={tierProgress.unit?.name || 'Pts'}
                scrollY={scrollY}
                onPress={() => {
                  navigation.navigate('Loyalty');
                }}
              />
            </View>
          )}

          {/* Promo Codes Carousel */}
          {state.isLoggedIn && (
            <PromoCarousel
              promos={data?.user_promos ?? []}
              currency={data?.currency ?? null}
              scrollY={scrollY}
            />
          )}

          {/* Featured Items */}
          <ItemsList
            isLoading={isLoading}
            title="Featured Items"
            data={featuredItems ?? []}
            onPress={() => navigation.navigate('HomeStack', { screen: 'featuredItems' })}
            onItemPress={id => {
              navigation.navigate('MenuItem', {
                itemId: id,
              })
            }
            }
          />

          <ItemsList
            isLoading={isLoading}
            title="Favorite Items"
            data={favoriteItems ?? []}
            onPress={() => navigation.navigate('HomeStack', { screen: 'FavoriteItems' })}
            onItemPress={id =>
              navigation.navigate('MenuItem', {
                itemId: id,
              })
            }
          // onItemPress={(id) => {navigation.navigate('', {
          //   itemId: id
          // })} }
          />

          <ItemsList
            isLoading={isLoading}
            title="New Items"
            data={newItems ?? []}
            onPress={() => navigation.navigate('HomeStack', { screen: 'NewItems' })}
            onItemPress={id =>
              navigation.navigate('MenuItem', {
                itemId: id,
              })
            }
          />

          <OffersList
            isLoading={isLoading}
            data={exclusiveOffers ?? []}
            onPress={() => navigation.navigate('HomeStack', { screen: 'Offers' })}
            onItemPress={id => {
              navigation.navigate('HomeStack', { screen: 'OfferDetails', params: { itemId: id } });
            }}
          />

          {/* {
              <ItemsList
                isLoading={isLoading}
                title="Best Sellers"
                data={bestSellers ?? []}
                onPress={() => navigation.navigate('BestSellers')}
                onItemPress={id =>
                  navigation.navigate('MenuItem', {
                    itemId: id,
                  })
                }
              />
            } */}
        </View>

      </Animated.ScrollView>

      {/* invisible hook just to trigger header updates */}
      <Animated.View style={headerBackgroundStyle} />

      {/* Fade In Overlay */}
      <FadeOverlay
        duration={400}
        color="black"
        onFadeComplete={() => console.log("Fade done")}
      />

      {/* Error Popup */}
      <InfoPopup
        visible={showErrorPopup}
        title="Not Available"
        message="The selected branch or menu is not available for this address. Please select a different address to continue."
        onClose={handleErrorPopupClose}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.backgroundColor,
  },
  headerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 6,
    height: 56,
    zIndex: 10,
  },
  cartButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  listsContainer: {
    gap: 20,
    marginTop: 10,
    paddingTop: 15,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: COLORS.backgroundColor
  },
  swiperContainer: {
    // marginTop: 60,
    // paddingHorizontal: 10,
    marginBottom: 10,
    // borderBottomLeftRadius: 8,
    // borderBottomRightRadius: 8,
    // overflow: 'hidden',
  }
});
