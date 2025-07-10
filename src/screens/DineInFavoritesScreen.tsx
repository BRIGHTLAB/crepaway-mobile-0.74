import { FlatList, StyleSheet, Text, View } from 'react-native';
import OfferCard from '../components/Menu/OfferCard';
import React, { useEffect, useState } from 'react';
import { GET } from '../api';
import ItemCard from '../components/Menu/ItemCard';
import MenuItemSkeleton from '../components/SkeletonLoader/MenuItemSkeleton';
import { useGetFavoritesQuery } from '../api/favoriteApi';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const DineInFavoritesScreen = () => {

  const branch = useSelector((state: RootState) => state.user.branchName) || ''
  const { data: favoriteItems, isLoading } = useGetFavoritesQuery({
    menu: 'mobile-app-delivery',
    branch,
  });

  const navigation = useNavigation<any>();

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
  },
});
