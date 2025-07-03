import {
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Banner from '../components/Banner';
import CategoryList from '../components/Menu/CategoryList';
import OffersList from '../components/Menu/OffersList';
import ItemsList from '../components/Menu/ItemsList';
import { GET } from '../api';
import CartCounter from '../components/Menu/CartCounter';
import { RootState, useAppDispatch } from '../store/store';
import NotificationsCounter from '../components/Notifications/NotificationsCounter';
import Icon_BackArrow from '../../assets/SVG/Icon_BackArrow';
import { setOrderType } from '../store/slices/userSlice';
import { useGetHomepageQuery } from '../api/homeApi';
import { useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { DeliveryTakeawayStackParamList } from '../navigation/DeliveryTakeawayStack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const bannerData = [
  {
    image: 'https://placehold.co/600x400/png',
    title: 'Slide 1',
  },
  {
    image: 'https://placehold.co/600x400/png',
    title: 'Slide 2',
  },
  {
    image: 'https://placehold.co/600x400/png',
    title: 'Slide 3',
  },
];

// Define the navigation prop type
type NavigationProp = NativeStackNavigationProp<DeliveryTakeawayStackParamList>;

const HomeScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();

  const state = useSelector((state: RootState) => state.user);
  const { bottom, top } = useSafeAreaInsets();


  useEffect(() => {
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
  }, [dispatch, navigation]);

  useEffect(() => {
    console.log('branchName', state.orderType);
  }, [state.branchName]);

  const { data, isLoading, error } = useGetHomepageQuery({
    menu: 'mobile-app-delivery',
    branch: state.branchName ? state.branchName?.toLowerCase() : '',
  });

  const categories = data?.categories;
  const newItems = data?.new_items;
  const exclusiveOffers = data?.exclusive_offers;
  const favoriteItems = data?.favorite_items;
  const bestSellers = data?.best_sellers;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Banner data={bannerData} />
          <View style={[styles.headerContainer, {
            top
          }]}>
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
                <Icon_BackArrow color={'#FFF'} />
                <Text
                  style={{
                    color: '#FFF',
                    fontFamily: 'Poppins-Medium',
                    fontSize: 16,
                  }}>
                  Back
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.cartButton, { marginLeft: 'auto' }]}
              onPress={() => navigation.navigate('Cart')}>
              <CartCounter color={'#FFF'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => navigation.navigate('Notifications')}>
              <NotificationsCounter color={'#FFF'} />
            </TouchableOpacity>
          </View>

          <View style={styles.listsContainer}>
            {
              <CategoryList
                data={categories ?? []}
                isLoading={isLoading}
                onCategoryPress={item => {
                  navigation.navigate('MenuItems', {
                    item,
                  });
                }}
              />
            }
            {
              <ItemsList
                isLoading={isLoading}
                title="Fav Items"
                data={favoriteItems ?? []}
                onPress={() => navigation.navigate('FavoriteItems')}
                onItemPress={id =>
                  navigation.navigate('MenuItem', {
                    itemId: id,
                  })
                }
              // onItemPress={(id) => {navigation.navigate('', {
              //   itemId: id
              // })} }
              />
            }
            {
              <ItemsList
                isLoading={isLoading}
                title="New Items"
                data={newItems ?? []}
                onPress={() => navigation.navigate('NewItems')}
                onItemPress={id =>
                  navigation.navigate('MenuItem', {
                    itemId: id,
                  })
                }
              />
            }

            {
              <OffersList
                isLoading={isLoading}
                data={exclusiveOffers ?? []}
                onPress={() => navigation.navigate('Offers')}
                onItemPress={id => {
                  navigation.navigate('OfferDetails', { itemId: id });
                }}
              />
            }
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
        </View>
        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
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
    marginTop: 10,
  },
});
