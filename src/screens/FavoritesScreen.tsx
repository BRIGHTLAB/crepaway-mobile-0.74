import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import Icon_Spine from '../../assets/SVG/Icon_Spine';
import { useGetFavoritesQuery } from '../api/favoriteApi';
import ItemCard from '../components/Menu/ItemCard';
import MenuItemSkeleton from '../components/SkeletonLoader/MenuItemSkeleton';
import Button from '../components/UI/Button';
import { RootStackParamList } from '../navigation/NavigationStack';
import { RootState } from '../store/store';
import { COLORS, SCREEN_PADDING } from '../theme';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { normalizeFont } from '../utils/normalizeFonts';

const FavoritesScreen = () => {

  const userState = useSelector((state: RootState) => state.user)

  const {
    data: favoriteItems,
    isLoading,
    refetch,
    isFetching,
  } = useGetFavoritesQuery({
    menuType: userState.menuType,
    branch: userState.branchAlias,
    addressId: userState.addressId,
  });

  const { refreshing, onRefresh } = usePullToRefresh({
    refetch,
    isFetching,
    isLoading,
  });

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();



  const renderItem = ({ item }: { item: Item }) => {
    // console.log('item', item);
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

  const emptyFavorites = !favoriteItems || favoriteItems.length === 0;

  const EmptyFavoritesState = () => (
    <View style={styles.emptyContainer}>
      <Icon_Spine
        width={normalizeFont(100)}
        height={normalizeFont(100)}
        color={COLORS.primaryColor}
        style={{ marginBottom: 16 }}
      />
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptySubText}>
        Save items you love — they'll show up here!
      </Text>
      <Button
        style={{ marginTop: 16 }}
        onPress={() =>
          navigation.navigate('HomeStack', {
            screen: 'MenuItems',
          })
        }>
        Browse Menu
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <MenuItemSkeleton />
      ) : emptyFavorites ? (
        <EmptyFavoritesState />
      ) : (
        <FlatList
          data={favoriteItems}
          renderItem={renderItem}
          keyExtractor={item => item.id?.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primaryColor}
              colors={[COLORS.primaryColor]}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          ListHeaderComponent={() => (
            <View style={{ height: SCREEN_PADDING.vertical }} />
          )}
          ListFooterComponent={() => (
            <View style={{ height: SCREEN_PADDING.vertical }} />
          )}
          columnWrapperStyle={{
            gap: 16,
          }}
        />
      )}
    </View>
  );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    backgroundColor: COLORS.backgroundColor,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardContainer: {
    flex: 1,
    maxWidth: '48%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: normalizeFont(22),
    color: COLORS.darkColor,
  },
  emptySubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalizeFont(14),
    color: COLORS.foregroundColor,
    textAlign: 'center',
  },
});
