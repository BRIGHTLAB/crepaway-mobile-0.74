import {FlatList, StyleSheet, Text, View} from 'react-native';
import OfferCard from '../components/Menu/OfferCard';
import React, {useEffect, useState} from 'react';
import {GET} from '../api';
import ItemCard from '../components/Menu/ItemCard';
import MenuItemSkeleton from '../components/SkeletonLoader/MenuItemSkeleton';
import {useNewItemsQuery} from '../api/newItemsApi';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {DineInOrderStackParamList} from '../navigation/DineInOrderStack';

type NavigationProp = NativeStackNavigationProp<DineInOrderStackParamList>;

const NewItemsScreen = () => {
  const {data: newItems, isLoading} = useNewItemsQuery({
    menu: 'mobile-app-delivery',
    branch: 'ashrafieh',
  });

  const navigation = useNavigation<NavigationProp>();

  const renderItem = ({item}: {item: Item}) => (
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
        style={{width: '100%'}}
        onItemPress={id => {
          navigation.navigate('MenuItem', {itemId: id});
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
          contentContainerStyle={{gap: 16}}
          columnWrapperStyle={{
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default NewItemsScreen;

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
