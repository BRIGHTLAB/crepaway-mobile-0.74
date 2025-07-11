import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Banner from '../components/Banner';
import CategoryList from '../components/Menu/CategoryList';
import OffersList from '../components/Menu/OffersList';
import ItemsList from '../components/Menu/ItemsList';
import CartCounter from '../components/Menu/CartCounter';
import NotificationsCounter from '../components/Notifications/NotificationsCounter';
import Icon_BackArrow from '../../assets/SVG/Icon_BackArrow';
import { useGetHomepageQuery } from '../api/homeApi';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DineInOrderStackParamList } from '../navigation/DineInOrderStack';
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

type DineInOrderScreenNavigationProp =
  NativeStackNavigationProp<DineInOrderStackParamList>;

const DineInOrderScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<DineInOrderScreenNavigationProp>();
  const state = useSelector((state: RootState) => state.user);

  const { data, isLoading, error } = useGetHomepageQuery({
    menu: 'mobile-app-delivery',
    branch: state.branchTable
      ? state.branchTable.split('.')?.[0]?.toLowerCase()
      : '',
  });

  const categories = data?.categories;
  const newItems = data?.new_items;
  const exclusiveOffers = data?.exclusive_offers;
  const favoriteItems = data?.favorite_items;
  const bestSellers = data?.best_sellers;

  const { top } = useSafeAreaInsets();

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
                onPress={() => navigation.goBack()}
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
                onPress={() => navigation.navigate('Favorites')}
                onItemPress={id => {
                  navigation.navigate('MenuItem', {
                    itemId: id,
                  });
                }}
              />
            }
            {
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
            }

            {
              <OffersList
                isLoading={isLoading}
                data={exclusiveOffers ?? []}
                onPress={() => {
                  // i need to navigate to offers
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
            }
            {
              <ItemsList
                isLoading={isLoading}
                title="Best Sellers"
                data={bestSellers ?? []}
                onPress={() => navigation.navigate('BestSellers')}
                onItemPress={() => { }}
              // onItemPress={(id) => {navigation.navigate('MenuItem', {
              //   itemId: id
              // })} }
              />
            }
          </View>
        </View>
        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
};

export default DineInOrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
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
