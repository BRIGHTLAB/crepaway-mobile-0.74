import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Icon_BackArrow from '../../assets/SVG/Icon_BackArrow';
import { useGetHomepageQuery } from '../api/homeApi';
import Banner from '../components/Banner';
import CategoryList from '../components/Menu/CategoryList';
import ItemsList from '../components/Menu/ItemsList';
import OffersList from '../components/Menu/OffersList';
import { DineInOrderStackParamList } from '../navigation/DineInOrderStack';
import { RootState } from '../store/store';



type DineInOrderScreenNavigationProp =
  NativeStackNavigationProp<DineInOrderStackParamList>;

const DineInOrderScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<DineInOrderScreenNavigationProp>();
  const state = useSelector((state: RootState) => state.user);

  const { data, isLoading, error } = useGetHomepageQuery({
    menuType: state.menuType,
    branch: state.branchTable
      ? state.branchTable.split('.')?.[0]?.toLowerCase()
      : null,
  });

  const categories = data?.categories;
  const newItems = data?.new_items;
  const exclusiveOffers = data?.exclusive_offers;
  const favoriteItems = data?.favorite_items;
  const bestSellers = data?.best_sellers;

  const { top } = useSafeAreaInsets();

  console.log('data', data?.new_items);


  const bannerData = useMemo(() => {
    return [
      {
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        title: 'Delicious Food',
      },
      {
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        title: 'Fresh Ingredients',
      },
    ];
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.swiperContainer}>
            <Banner data={bannerData} />
          </View>
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
                title="Favorite Items"
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
  swiperContainer: {
    marginBottom: 10,
  }
});
