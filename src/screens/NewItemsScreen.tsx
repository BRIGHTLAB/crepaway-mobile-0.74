import { FlatList, StyleSheet, Text, View } from 'react-native';
import OfferCard from '../components/Menu/OfferCard';
import React, { useEffect, useState } from 'react';
import { GET } from '../api';
import ItemCard from '../components/Menu/ItemCard';
import MenuItemSkeleton from '../components/SkeletonLoader/MenuItemSkeleton';
import { useNewItemsQuery } from '../api/newItemsApi';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/NavigationStack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SCREEN_PADDING } from '../theme';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const NewItemsScreen = () => {

  const branch = useSelector((state: RootState) => state.user.branchName) || ''

  const { data: newItems, isLoading } = useNewItemsQuery({
    menu: 'mobile-app-delivery',
    branch,
  });

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.cardContainer}>
      <ItemCard
        id={item?.id}
        name={item.name}
        description={item.description || ''}
        image_url={item.image_url || ''}
        price={item.price || 0}
        symbol={item.symbol}
        tags={item.tags}
        isFavorite={item.is_favorite}
        style={{ width: '100%' }}
        onItemPress={id => {
          navigation.navigate('HomeStack', {
            screen: 'MenuItem',
            params: { itemId: id },
          });
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Offers</Text> */}
      {isLoading ? (
        <MenuItemSkeleton />
      ) : (
        <FlatList
          data={newItems}
          renderItem={renderItem}
          keyExtractor={item => item.id?.toString()}
          numColumns={2}
          contentContainerStyle={{ gap: 16 }}
          columnWrapperStyle={{
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={{ height: SCREEN_PADDING.vertical }} />
          )}
          ListFooterComponent={() => (
            <View style={{ height: SCREEN_PADDING.vertical }} />
          )}
        />
      )}
    </View>
  );
};

export default NewItemsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING.horizontal,
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
