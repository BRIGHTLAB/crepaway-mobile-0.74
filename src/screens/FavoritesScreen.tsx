import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useGetFavoritesQuery } from '../api/favoriteApi';
import ItemCard from '../components/Menu/ItemCard';
import MenuItemSkeleton from '../components/SkeletonLoader/MenuItemSkeleton';
import { RootStackParamList } from '../navigation/NavigationStack';
import { RootState } from '../store/store';
import { SCREEN_PADDING } from '../theme';

const FavoritesScreen = () => {

  const userState = useSelector((state: RootState) => state.user)

  const { data: favoriteItems, isLoading } = useGetFavoritesQuery({
    menuType: userState.menuType,
    branch: userState.branchName,
    addressId: userState.addressId,
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
            navigation.navigate('HomeStack', {
              screen: 'MenuItem',
              params: { itemId: id },
            });
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
