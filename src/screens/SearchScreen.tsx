import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { debounce } from 'lodash';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Keyboard,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon_Search from '../../assets/SVG/Icon_Search';
import { useGetItemsQuery } from '../api/menuApi';
import { useGetSearchHistoryQuery } from '../api/searchApi';
import ItemCard from '../components/Menu/ItemCard';
import MenuItemSkeleton from '../components/SkeletonLoader/MenuItemSkeleton';
import Input from '../components/UI/Input';
import { RootStackParamList } from '../navigation/NavigationStack';
import { RootState } from '../store/store';
import { COLORS, SCREEN_PADDING } from '../theme';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

const SearchScreen = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchDebounceValue, setSearchDebounceValue] = useState('');

  console.log('searchDebounceValue', searchDebounceValue);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: searchHistory, isLoading: isLoadingHistory } =
    useGetSearchHistoryQuery();

  console.log('searchHistory', searchHistory);


  const userState = useSelector((state: RootState) => state.user)

  const {
    data: searchResults,
    isFetching,
    isLoading,
    refetch,
  } = useGetItemsQuery({
    menuType: userState.menuType,
    branch: userState.branchAlias,
    addressId: userState.addressId,
    search: searchDebounceValue, // Add search parameter
  });
  console.log('searchResults', searchResults);

  const { refreshing, onRefresh } = usePullToRefresh({
    refetch,
    isFetching,
    isLoading,
  });

  const handleChangeSearch = (value: string) => {
    setSearchValue(value);
    handleSearchDebounce(value);
  };

  const handleSearchDebounce = useCallback(
    debounce(async (value: string) => {
      setSearchDebounceValue(value);
    }, 500),
    [],
  );

  const handleChipPress = (value: string) => {
    setSearchValue(value);
    setSearchDebounceValue(value);
  };

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
  };

  const renderItem = ({ item }: { item: Item }) => {
    return (
      <View style={styles.cardContainer}>
        <ItemCard
          id={item.id}
          name={item.name}
          description={item.description || ''}
          image_url={item.image_url || ''}
          price={item.price || 0}
          symbol={item.symbol}
          tags={item.tags}
          isFavorite={item.is_favorite}
          onItemPress={id => {
            navigation.navigate('MenuItem', { itemId: id });
          }}
        />
      </View>
    );
  };
  return (
    <View style={styles.container}>
      {/* <StatusBar barStyle={'dark-content'} /> */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search"
          iconLeft={<Icon_Search />}
          value={searchValue}
          onChangeText={val => handleChangeSearch(val)}
          returnKeyType="done"
          onSubmitEditing={handleSearchSubmit}
        />
      </View>

      {/* Header  */}
      {searchHistory && searchHistory?.length > 0 && (
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
          {/* Chips  */}
          <View style={styles.chips}>
            {
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

      {searchDebounceValue ? (
        isFetching ? (
          <MenuItemSkeleton />
        ) : searchResults?.data && searchResults?.data?.length > 0 ? (
          <FlatList
            data={searchResults?.data || []}
            renderItem={renderItem}
            keyExtractor={item => item.id?.toString()}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 16 }}
            ListHeaderComponent={() => (
              <View style={{ height: 16 }} />
            )}
            ListFooterComponent={() => (
              <View style={{ height: SCREEN_PADDING.vertical }} />
            )}
            columnWrapperStyle={{
              gap: 16,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primaryColor}
                colors={[COLORS.primaryColor]}
              />
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No results found</Text>
          </View>
        )
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Start typing to search for items</Text>
        </View>
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  header: {
    gap: 8,
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
  searchContainer: {
    paddingTop: 16,
  },
  cardContainer: {
    flex: 1,
    maxWidth: '48%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: COLORS.foregroundColor,
    textAlign: 'center',
  }
});
