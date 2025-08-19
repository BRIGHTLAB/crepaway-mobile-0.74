import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { debounce } from 'lodash';
import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon_Search from '../../assets/SVG/Icon_Search';
import {
  useGetSearchHistoryQuery,
  useGetSearchResultsQuery,
} from '../api/searchApi';
import ItemsList from '../components/Menu/ItemsList';
import OffersList from '../components/Menu/OffersList';
import Input from '../components/UI/Input';
import { RootStackParamList } from '../navigation/NavigationStack';
import { RootState } from '../store/store';
import { COLORS, SCREEN_PADDING } from '../theme';

const SearchScreen = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchDebounceValue, setSearchDebounceValue] = useState('');

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: searchHistory, isLoading: isLoadingHistory } =
    useGetSearchHistoryQuery();

  const userState = useSelector((state: RootState) => state.user)

  const { data: searchResults, isLoading } = useGetSearchResultsQuery(
    {
      menuType: userState.menuType,
      branch: userState.branchName,
      searchValue: searchDebounceValue,
      addressId: userState.addressId,
    },
    // {
    //   skip: searchDebounceValue === '',
    // },
  );

  const handleChangeSearch = (value: string) => {
    setSearchValue(value);
    handleSearchDebounce(value);
  };

  const handleSearchDebounce = useCallback(
    debounce(async (value: string) => {
      setSearchDebounceValue(value);
    }, 1500),
    [],
  );

  const handleChipPress = (value: string) => {
    setSearchValue(value);
    setSearchDebounceValue(value);
  };

  return (
    <ScrollView style={styles.container}>
      {/* <StatusBar barStyle={'dark-content'} /> */}
      <View style={{ paddingTop: 16 }}>
        <Input
          placeholder="Search"
          iconLeft={<Icon_Search />}
          value={searchValue}
          onChangeText={val => handleChangeSearch(val)}
        />
      </View>

      <View style={{ gap: 8 }}>
        {/* Header  */}
        {searchHistory && (
          <View style={styles.header}>
            <Text style={styles.title}>History</Text>
            {/* Chips  */}
            <View style={styles.chips}>
              {searchHistory?.length > 0 &&
                searchHistory?.map((el, idx) => {
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={{
                        backgroundColor: COLORS.lightColor,
                        paddingVertical: 4,
                        paddingHorizontal: 6,
                        borderRadius: 8,
                      }}
                      onPress={() => handleChipPress(el.search_value)}>
                      <Text style={{ color: COLORS.darkColor }}>
                        {el?.search_value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View>
        )}

        <View style={styles.listContainer}>
          {
            <ItemsList
              title="New Items"
              isLoading={isLoading}
              data={searchResults?.new_items ?? []}
              onPress={() =>
                navigation.navigate('HomeStack', { screen: 'NewItems' })
              }
              onItemPress={id => {
                navigation.navigate('HomeStack', {
                  screen: 'MenuItem',
                  params: { itemId: id },
                });
              }}
            />
          }
          {
            <OffersList
              data={searchResults?.exclusive_offers ?? []}
              isLoading={isLoading}
              onPress={() =>
                navigation.navigate('HomeStack', { screen: 'Offers' })
              }
              onItemPress={id => {
                navigation.navigate('HomeStack', {
                  screen: 'MenuItem',
                  params: { itemId: id },
                });
              }}
            />
          }
          {/* {
            <ItemsList
              title="Best Sellers"
              data={searchResults?.best_sellers ?? []}
              isLoading={isLoading}
              onPress={() =>
                navigation.navigate('HomeStack', {screen: 'BestSellers'})
              }
              onItemPress={id => {
                navigation.navigate('HomeStack', {
                  screen: 'MenuItem',
                  params: {itemId: id},
                });
              }}
            />
          } */}
        </View>
      </View>
      <View style={{ height: 16 }} />
    </ScrollView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    // paddingVertical: SCREEN_PADDING.vertical,
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    gap: 8,
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.darkColor,
    marginTop: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  listContainer: {
    gap: 20,
    marginTop: 10,
  },
});
