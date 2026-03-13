import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useGetContentQuery } from '../api/dataApi';
import { useGetHomepageQuery } from '../api/homeApi';
import Banner from '../components/Banner';
import CategoryList from '../components/Menu/CategoryList';
import ItemsList from '../components/Menu/ItemsList';
import OffersList from '../components/Menu/OffersList';
import { DineInOrderStackParamList } from '../navigation/DineInOrderStack';
import { RootState } from '../store/store';
import { COLORS } from '../theme';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import CustomHeader from '../components/Header';

type DineInOrderScreenNavigationProp =
  NativeStackNavigationProp<DineInOrderStackParamList>;

const DineInOrderScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<DineInOrderScreenNavigationProp>();
  const state = useSelector((state: RootState) => state.user);

  const { data: content, isLoading: isContentLoading } = useGetContentQuery();

  const { data, isLoading, error, refetch, isFetching } = useGetHomepageQuery({
    menuType: state.menuType,
    branch: state.branchTable
      ? state.branchTable.split('.')?.[0]?.toLowerCase()
      : null,
  });

  const categories = data?.categories;
  const newItems = data?.new_items?.filter(item => item.is_paused !== 1) ?? [];
  const exclusiveOffers = data?.exclusive_offers;
  const favoriteItems = data?.favorite_items?.filter(item => item.is_paused !== 1) ?? [];
  const bestSellers = data?.best_sellers?.filter(item => item.is_paused !== 1) ?? [];

  const { top } = useSafeAreaInsets();

  const { refreshing, onRefresh } = usePullToRefresh({
    refetch,
    isFetching,
    isLoading,
  });

  // Get banner data from content API, matching HomeScreen approach
  const bannerData = useMemo(() => {
    if (!content?.length) return [];
    // Use dine-in specific banner key, fallback to delivery
    const bannerKey = 'home-delivery-swiper';
    return content
      .filter((item) => item.key === bannerKey && item.image_url)
      .map((item) => ({
        image: item.image_url ?? '',
        title: item.title ?? '',
      }));
  }, [content]);

  // Animated scroll header (matching HomeScreen)
  const scrollY = useSharedValue(0);
  const lastColorRef = useRef('');

  const updateHeaderColor = useCallback((color: string) => {
    if (lastColorRef.current === color) return;
    lastColorRef.current = color;
    navigation.setOptions({
      headerTintColor: color,
      headerLeft: () => (
        <CustomHeader color={color} title="Dine-In" />
      ),
    });
  }, [navigation]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      const iconColor = interpolateColor(
        scrollY.value,
        [0, 200],
        ['#fff', '#000'],
      );
      runOnJS(updateHeaderColor)(iconColor);
    },
  });

  useLayoutEffect(() => {
    scrollY.value = 0;
    updateHeaderColor('#fff');
  }, []);

  const headerBackgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 200],
      [0, 1],
      Extrapolation.CLAMP,
    );

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
        }>
        <View style={[styles.swiperContainer, { minHeight: 246 + top }]}>
          {isContentLoading || bannerData.length === 0 ? (
            <SkeletonPlaceholder>
              <SkeletonPlaceholder.Item
                width={Dimensions.get('window').width}
                height={246 + top}
                borderRadius={0}
              />
            </SkeletonPlaceholder>
          ) : (
            <Banner data={bannerData} />
          )}
        </View>

        <View style={styles.listsContainer}>
          <CategoryList
            data={categories ?? []}
            isLoading={isLoading}
            onCategoryPress={item => {
              navigation.navigate('MenuItems', {
                item,
              });
            }}
          />

          <ItemsList
            isLoading={isLoading}
            title="Favorite Items"
            data={favoriteItems ?? []}
            onPress={() => navigation.navigate('Favorites')}
            onItemPress={id => {
              navigation.navigate('MenuItem', {
                itemId: id,
              });
            }}
          />

          <ItemsList
            isLoading={isLoading}
            title="New Items"
            data={newItems ?? []}
            onPress={() => navigation.navigate('NewItems')}
            onItemPress={id => {
              navigation.navigate('MenuItem', {
                itemId: id,
              });
            }}
          />

          <OffersList
            isLoading={isLoading}
            data={exclusiveOffers ?? []}
            onPress={() => {
              navigation.navigate('OffersStack', {
                screen: 'Offers',
                params: undefined,
              });
            }}
            onItemPress={(id: number) => {
              navigation.navigate('OffersStack', {
                screen: 'OfferDetails',
                params: {
                  itemId: id,
                },
              });
            }}
          />

          <ItemsList
            isLoading={isLoading}
            title="Best Sellers"
            data={bestSellers ?? []}
            onPress={() => navigation.navigate('BestSellers' as any)}
            onItemPress={id => {
              navigation.navigate('MenuItem', {
                itemId: id,
              });
            }}
          />
        </View>
      </Animated.ScrollView>

      {/* invisible hook to trigger header updates */}
      <Animated.View style={headerBackgroundStyle} />
    </View>
  );
};

export default DineInOrderScreen;

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
    paddingTop: 15,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: COLORS.backgroundColor,
  },
  swiperContainer: {
    marginBottom: 10,
  },
});
