import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useLayoutEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BackHandler,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Text
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useGetContentQuery } from '../api/dataApi';
import { useGetHomepageQuery } from '../api/homeApi';
import FadeOverlay from '../components/FadeOverlay';
import LoyaltyCard from '../components/LoyaltyCard';
import CartCounter from '../components/Menu/CartCounter';
import CategoryList from '../components/Menu/CategoryList';
import ItemsList from '../components/Menu/ItemsList';
import OffersList from '../components/Menu/OffersList';
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
import CustomHeader from '../components/Header';
import { COLORS } from '../theme';
import Banner from '../components/Banner';
import ParallaxBanner from '../components/ParallaxBanner';

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

  // Get banner data based on order type
  const bannerData = useMemo(() => {
    const orderType = state.orderType;
    let contentKey = 'home-delivery-swiper'; // default

    if (orderType === 'takeaway') {
      contentKey = 'home-takeaway-swiper';
    } else if (orderType === 'delivery') {
      contentKey = 'home-delivery-swiper';
    }

    // Find all content items with the matching key and extract image_url
    const bannerItems = content?.filter(item => item.key === contentKey) || [];

    return bannerItems.map(item => ({
      image: item.image_url || '',
      title: item.title || '',
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

  const { data, isLoading, error } = useGetHomepageQuery({
    menuType: state.menuType,
    branch: state.branchName,
    addressId: state.addressId,
  });

  const categories = data?.categories;
  const newItems = data?.new_items;
  const featuredItems = data?.featured_items;
  const exclusiveOffers = data?.exclusive_offers;
  const favoriteItems = data?.favorite_items;
  const bestSellers = data?.best_sellers;

  /* */
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      // calculate color as string
      const iconColor = interpolateColor(
        scrollY.value,
        [0, 100],
        ["#fff", "#000"]
      );

      // pass the plain string to JS
      runOnJS(updateHeaderColor)(iconColor);
    },

  });

  function updateHeaderColor(color: string) {
    navigation.setOptions({
      headerTintColor: color,
      headerLeft: () => <CustomHeader color={color} clearOrderType />,
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
          {/* <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', {
                    screen: 'Notifications',
                  })
                }>
                <NotificationsCounter color={color} />
              </TouchableOpacity> */}
        </View>
      ),
    });
  }
  const bannerStyle = useAnimatedStyle(() => {
    let height = BANNER_HEIGHT;
    let translateY = 0;

    if (scrollY.value < 0) {
      height = BANNER_HEIGHT - scrollY.value; // stretch down
    } else {
      translateY = interpolate(
        scrollY.value,
        [0, BANNER_HEIGHT],
        [0, -BANNER_HEIGHT],
        Extrapolation.CLAMP
      );
    }

    return { height, transform: [{ translateY }] };
  });

  // Update header opacity dynamically
  useLayoutEffect(() => {
    scrollY.value = 0; // reset on mount
  }, []);

  const headerBackgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],   // smaller distance
      [0, 1],     // fade fully
      Extrapolation.CLAMP
    );

    // React Navigation headers are controlled with setOptions → we need runOnJS
    runOnJS(navigation.setOptions)({
      headerStyle: {
        backgroundColor: `rgba(255,255,255,${opacity})`,
      },
      headerTitle: opacity > 0.7 ? "" : "",
      headerTitleStyle: {
        opacity,
      },

    });

    return {};
  });

  return (
    <View style={styles.container}>

      {/* Banner */}
      <Animated.View style={[styles.bannerContainer, bannerStyle]}>
        <Image
          source={IMAGES.bannerBg}
          style={styles.bannerImage}
          blurRadius={3}
        />
        {/* Overlay */}
        <View style={styles.overlay} />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: BANNER_HEIGHT - 180, marginTop: -20, }}
      >

        <View style={styles.listsContainer}>

          <View style={styles.swiperContainer}>
            {/* <View style={{ width: '100%', height: 200, backgroundColor: 'red', borderRadius: 5, opacity: 0.5 }} /> */}
            <ParallaxBanner data={bannerData} />
          </View>

          <LoyaltyCard />

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
            title="Fav Items"
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
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white'
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
  listsContainer: {
    gap: 20,
    marginTop: 120,
    paddingTop: 15,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: COLORS.white
  },
  /* */
  bannerContainer: {
    position: "absolute",
    top: 0,
    width: width,
    height: BANNER_HEIGHT,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)", // semi-transparent overlay
    justifyContent: "center",
    alignItems: "center",
  },
  bannerStyle: {
    position: "relative"
  },
  swiperContainer:{
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -170,
    marginBottom: -20,
  }
});
