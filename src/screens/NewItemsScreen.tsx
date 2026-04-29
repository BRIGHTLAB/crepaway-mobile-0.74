import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useNewItemsQuery } from '../api/newItemsApi';
import ItemCard from '../components/Menu/ItemCard';
import MenuItemSkeleton from '../components/SkeletonLoader/MenuItemSkeleton';
import { RootStackParamList } from '../navigation/NavigationStack';
import { RootState } from '../store/store';
import { COLORS, SCREEN_PADDING } from '../theme';
import Icon_Spine from '../../assets/SVG/Icon_Spine';
import Button from '../components/UI/Button';
import { normalizeFont } from '../utils/normalizeFonts';

const NewItemsScreen = () => {

  const userState = useSelector((state: RootState) => state.user)

  const { data: newItems, isLoading } = useNewItemsQuery({
    menuType: userState.menuType,
    branch: userState.branchAlias,
    addressId: userState.addressId,
  });

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const hasNewItems = !!newItems && newItems.length > 0;

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.cardContainer}>
      <ItemCard
        id={item?.id}
        itemsId={item?.items_id}
        name={item.name}
        description={item.description || ''}
        image_url={item.image_url || ''}
        price={item.price || 0}
        symbol={item.symbol}
        tags={item.tags}
        isFavorite={item.is_favorite}
        isPaused={item.is_paused === 1}
        style={{ width: '100%' }}
        onItemPress={id => {
          navigation.navigate('MenuItem', { itemId: id });
        }}
      />
    </View>
  );

  const EmptyNewItemsState = () => (
    <View style={styles.emptyContainer}>
      <Icon_Spine
        width={normalizeFont(100)}
        height={normalizeFont(100)}
        color={COLORS.primaryColor}
        style={{ marginBottom: 16 }}
      />
      <Text style={styles.emptyTitle}>No New Items Yet</Text>
      <Text style={styles.emptySubText}>
        Check back soon for the latest additions to our menu!
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
      {/* <Text style={styles.title}>Offers</Text> */}
      {isLoading ? (
        <MenuItemSkeleton />
      ) : hasNewItems ? (
        <FlatList
          data={newItems}
          renderItem={renderItem}
          keyExtractor={item => item.id?.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
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
      ) : (
        <EmptyNewItemsState />
      )}
    </View>
  );
};

export default NewItemsScreen;

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
