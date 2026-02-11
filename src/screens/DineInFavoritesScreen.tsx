import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useGetFavoritesQuery } from '../api/favoriteApi';
import ItemCard from '../components/Menu/ItemCard';
import MenuItemSkeleton from '../components/SkeletonLoader/MenuItemSkeleton';
import { RootState } from '../store/store';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { COLORS } from '../theme';

const DineInFavoritesScreen = () => {

  const userState = useSelector((state: RootState) => state.user)
  const {
    data: favoriteItems,
    isLoading,
    refetch,
    isFetching,
  } = useGetFavoritesQuery({
    menuType: userState.menuType,
    branch: userState.branchTable
      ? userState.branchTable.split('.')?.[0]?.toLowerCase()
      : null,
  });

  const navigation = useNavigation<any>();

  const { refreshing, onRefresh } = usePullToRefresh({
    refetch,
    isFetching,
    isLoading,
  });

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
          style={{ width: '100%' }}
          onItemPress={() => {
            navigation.navigate('MenuItem', { itemId: item.id });
          }}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <MenuItemSkeleton />
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
          contentContainerStyle={{ gap: 16 }}
          columnWrapperStyle={{
            gap: 16,
          }}
        />
      )}
    </View>
  );
};

export default DineInFavoritesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
});
