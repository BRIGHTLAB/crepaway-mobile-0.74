import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { debounce } from 'lodash';
import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon_Search from '../../assets/SVG/Icon_Search';
import { useGetItemsQuery } from '../api/menuApi';
import { useGetSearchHistoryQuery } from '../api/searchApi';
import ItemCard from '../components/Menu/ItemCard';
import MenuItemSkeleton from '../components/SkeletonLoader/MenuItemSkeleton';
import { DineInOrderStackParamList } from '../navigation/DineInOrderStack';
import { RootState } from '../store/store';
import { COLORS, SCREEN_PADDING } from '../theme';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { normalizeFont } from '../utils/normalizeFonts';

const DineInSearchScreen = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchDebounceValue, setSearchDebounceValue] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<DineInOrderStackParamList>>();

  const { data: searchHistory } = useGetSearchHistoryQuery();

  const userState = useSelector((state: RootState) => state.user);

  const {
    data: searchResults,
    isFetching,
    isLoading,
    refetch,
  } = useGetItemsQuery({
    menuType: userState.menuType,
    branch: userState.branchTable
      ? userState.branchTable.split('.')?.[0]?.toLowerCase()
      : null,
    search: searchDebounceValue,
  });

  const { refreshing, onRefresh } = usePullToRefresh({
    refetch,
    isFetching,
    isLoading,
  });

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }, []),
  );

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

  const handleClear = () => {
    setSearchValue('');
    setSearchDebounceValue('');
    searchInputRef.current?.focus();
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
      {/* Search input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon_Search width={18} height={18} color={COLORS.foregroundColor} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="What are you craving?"
            placeholderTextColor={COLORS.foregroundColor}
            value={searchValue}
            onChangeText={handleChangeSearch}
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchValue.length > 0 && (
            <TouchableOpacity onPress={handleClear} hitSlop={8}>
              <View style={styles.clearButton}>
                <Text style={styles.clearButtonText}>✕</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* History chips */}
      {!searchDebounceValue && searchHistory && searchHistory.length > 0 && (
        <View style={styles.header}>
          <Text style={styles.title}>Recent Searches</Text>
          <View style={styles.chips}>
            {searchHistory.map((el, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.chip}
                onPress={() => handleChipPress(el.search_value)}>
                <Icon_Search
                  width={12}
                  height={12}
                  color={COLORS.foregroundColor}
                />
                <Text style={styles.chipText}>{el?.search_value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results */}
      {searchDebounceValue ? (
        isFetching ? (
          <MenuItemSkeleton />
        ) : searchResults?.data && searchResults.data.length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsCount}>
              {searchResults.data.length}{' '}
              {searchResults.data.length === 1 ? 'result' : 'results'} found
            </Text>
            <FlatList
              data={searchResults.data}
              renderItem={renderItem}
              keyExtractor={item => item.id?.toString()}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 16 }}
              ListFooterComponent={() => (
                <View style={{ height: SCREEN_PADDING.vertical }} />
              )}
              columnWrapperStyle={{ gap: 16 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={COLORS.primaryColor}
                  colors={[COLORS.primaryColor]}
                />
              }
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon_Search
              width={normalizeFont(80)}
              height={normalizeFont(80)}
              color={COLORS.foregroundColor}
              style={{ marginBottom: 16, opacity: 0.4 }}
            />
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptySubText}>
              Try searching with different keywords or browse our menu
            </Text>
          </View>
        )
      ) : (
        !searchHistory?.length && (
          <View style={styles.emptyState}>
            <Icon_Search
              width={normalizeFont(80)}
              height={normalizeFont(80)}
              color={COLORS.primaryColor}
              style={{ marginBottom: 10, opacity: 0.8 }}
            />
            <Text style={styles.emptyTitle}>What are you craving?</Text>
            <Text style={styles.emptySubText}>
              Type above to find your favorite items
            </Text>
          </View>
        )
      )}
    </View>
  );
};

export default DineInSearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  searchContainer: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderColor,
  },
  searchInputContainer: {
    height: 46,
    backgroundColor: COLORS.lightColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: normalizeFont(14),
    fontFamily: 'Poppins-Regular',
    color: COLORS.darkColor,
    paddingVertical: 0,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.foregroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: COLORS.white,
    fontSize: 10,
    lineHeight: 12,
  },
  header: {
    gap: 10,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingTop: 16,
  },
  title: {
    fontSize: normalizeFont(16),
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.darkColor,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.lightColor,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  chipText: {
    fontSize: normalizeFont(13),
    fontFamily: 'Poppins-Regular',
    color: COLORS.darkColor,
  },
  cardContainer: {
    flex: 1,
    maxWidth: '48%',
  },
  resultsContainer: {
    flex: 1,
    gap: 8,
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  resultsCount: {
    fontSize: normalizeFont(13),
    fontFamily: 'Poppins-Regular',
    color: COLORS.foregroundColor,
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: normalizeFont(20),
    color: COLORS.darkColor,
    marginBottom: 6,
  },
  emptySubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalizeFont(14),
    color: COLORS.foregroundColor,
    textAlign: 'center',
    lineHeight: 22,
  },
});
