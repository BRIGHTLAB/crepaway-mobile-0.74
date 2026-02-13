import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import FastImage from 'react-native-fast-image';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useSelector } from 'react-redux';
import Icon_WishList from '../../assets/SVG/Icon_Wishlist';
import Icon_Wishlist_Filled from '../../assets/SVG/Icon_Wishlist_Filled';
import {
  useGetCategoriesQuery,
  useGetItemsQuery,
  useToggleFavoriteMutation,
} from '../api/menuApi';
import { RootState } from '../store/store';
import { COLORS, SCREEN_PADDING } from '../theme';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { normalizeFont } from '../utils/normalizeFonts';

// Fixed heights for more accurate calculations
const ITEM_HEIGHT = 120; // Height of each menu item
const CATEGORY_HEADER_HEIGHT = 30; // Height of category header
const CATEGORY_FOOTER_HEIGHT = 16; // Height of space after category

interface MenuItemProps {
  item: Item;
  onPress: () => void;
  isFavorite: boolean;
}

const MenuItem: React.FC<MenuItemProps> = React.memo(
  ({ item, onPress, isFavorite }) => {
    const [favorite, setFavorite] = useState(isFavorite);

    useEffect(() => {
      setFavorite(isFavorite);
    }, [isFavorite]);

    const userState = useSelector((state: RootState) => state.user)

    const [toggleFavorite, { isLoading: isTogglingFavorite }] =
      useToggleFavoriteMutation();

    const handleWishList = async () => {
      try {
        setFavorite(prev => !prev);
        await toggleFavorite({ itemId: item.id, branch: userState.branchAlias, menuType: userState.menuType, addressId: userState.addressId });
      } catch (error) {
        setFavorite(prev => !prev);
      }
    };

    return (
      <TouchableOpacity onPress={onPress} style={styles.menuContainer}>
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            flex: 1,
          }}>
          <FastImage
            source={{
              uri: item?.image_url ?? '',
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}
            style={{
              width: 80,
              height: 80,
              borderRadius: 10,
            }}
          />
          <View style={styles.menuItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.itemPrice}>
              {item.symbol} {item.price}
            </Text>
          </View>
        </View>

        {/* right  */}
        <Pressable
          style={{ alignSelf: 'flex-start' }}
          onPress={e => {
            e.stopPropagation();
            handleWishList();
          }}
          hitSlop={8}>
          {favorite ? (
            <Icon_Wishlist_Filled style={{ marginTop: 8 }} />
          ) : (
            <Icon_WishList style={{ marginTop: 8 }} />
          )}
        </Pressable>
      </TouchableOpacity>
    );
  },
);

const CategorySection = React.memo(
  ({
    category,
    navigation,
  }: {
    category: {
      id: number;
      alias: string;
      name: string;
      description: string | null;
      notes: string | null;
      image_url: string;
      mini_image_url: string;
      items: Item[];
    };
    navigation?: {
      navigate: (
        screen: string,
        params?: {
          itemId: number;
        },
      ) => void;
    };
  }) => {
    return (
      <View key={category.id.toString()}>
        <Text style={styles.sectionHeader}>{category.name}</Text>
        {category.items.map((item, idx) => (
          <MenuItem
            key={`${item.id}-${idx}`}
            item={item}
            onPress={() => navigation?.navigate('MenuItem', { itemId: item.id })}
            isFavorite={item?.is_favorite === 1}
          />
        ))}
        <View style={{ height: CATEGORY_FOOTER_HEIGHT }} />
      </View>
    );
  },
);
const CategoryTab = React.memo(
  ({
    item,
    isSelected,
    onPress,
  }: {
    item: Category;
    isSelected: boolean;
    onPress: () => void;
  }) => {
    const indicatorAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

    useEffect(() => {
      Animated.spring(indicatorAnim, {
        toValue: isSelected ? 1 : 0,
        damping: 20,
        stiffness: 200,
        mass: 0.8,
        useNativeDriver: true,
      }).start();
    }, [isSelected]);

    return (
      <TouchableOpacity
        hitSlop={20}
        style={styles.categoryTab}
        onPress={onPress}>
        <Text
          style={[
            styles.categoryTitle,
            isSelected && styles.activeCategoryTitle,
          ]}>
          {item.name}
        </Text>
        <Animated.View
          style={[
            styles.categoryIndicator,
            {
              transform: [{ scaleX: indicatorAnim }],
              opacity: indicatorAnim,
            },
          ]}
        />
      </TouchableOpacity>
    );
  },
);

interface IProps {
  route?: {
    params: {
      item: Category;
    };
  };
  navigation?: {
    navigate: (
      screen: string,
      params?: {
        itemId: number;
      },
    ) => void;
  };
}

const MenuItemsScreen = ({ route, navigation }: IProps) => {
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>(0);
  const scrollViewRef = useRef<FlatList>(null);
  const flatListRef = useRef<FlatList>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [categoryOffsets, setCategoryOffsets] = useState<{
    [key: number]: number;
  }>({});
  const [categoryHeights, setCategoryHeights] = useState<{
    [key: number]: number;
  }>({});
  const [dataReady, setDataReady] = useState(false);

  const userState = useSelector((state: RootState) => state.user);
  const selectedCategory = route?.params?.item;

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    refetch: refetchCategories,
    isFetching: isCategoriesFetching,
  } = useGetCategoriesQuery({
    menuType: userState.menuType,
    branch: userState.branchAlias,
    addressId: userState.addressId,
  });

  const {
    data: items,
    isLoading: isItemsLoading,
    refetch: refetchItems,
    isFetching: isItemsFetching,
  } = useGetItemsQuery({
    menuType: userState.menuType,
    branch: userState.branchAlias,
    addressId: userState.addressId,
  });

  const { refreshing, onRefresh } = usePullToRefresh({
    refetch: () => Promise.all([refetchCategories(), refetchItems()]),
    isFetching: isCategoriesFetching || isItemsFetching,
    isLoading: isCategoriesLoading || isItemsLoading,
  });


  const groupedItems = categories.map(category => ({
    ...category,
    items:
      items && items?.data?.length > 0
        ? items?.data?.filter(item => item.menu_categories_id === category.id)
        : [],
  }));

  const calculateItemLayout = useCallback(() => {
    let offset = 0;
    const newOffsets: { [key: number]: number } = {};
    const newHeights: { [key: number]: number } = {};

    groupedItems.forEach(category => {
      const categoryHeight =
        CATEGORY_HEADER_HEIGHT +
        category.items.length * ITEM_HEIGHT +
        CATEGORY_FOOTER_HEIGHT;

      newOffsets[category.id] = offset;
      newHeights[category.id] = categoryHeight;
      offset += categoryHeight;
    });

    setCategoryOffsets(newOffsets);
    setCategoryHeights(newHeights);
    setDataReady(true);
  }, [groupedItems]);

  useEffect(() => {
    if (
      !isItemsLoading &&
      !isCategoriesLoading &&
      categories.length > 0 &&
      items
    ) {
      calculateItemLayout();
    }
  }, [
    isItemsLoading,
    isCategoriesLoading,
    categories,
    items,
    // calculateItemLayout,
  ]);

  useEffect(() => {
    if (
      isInitialLoad &&
      dataReady &&
      !isItemsLoading &&
      !isCategoriesLoading &&
      selectedCategory &&
      categories.length > 0
    ) {
      const categoryIndex = categories.findIndex(
        cat => cat.id === selectedCategory.id,
      );

      if (categoryIndex !== -1) {
        setTimeout(() => {
          scrollToCategory(categoryIndex, selectedCategory.id);
          setIsInitialLoad(false);
        }, 500);
      }
    }
  }, [
    isItemsLoading,
    isCategoriesLoading,
    selectedCategory,
    categories,
    isInitialLoad,
    dataReady,
  ]);

  const scrollToCategory = (idx: number, categoryId: number) => {
    setSelectedCategoryIndex(idx);

    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: idx,
        animated: true,
        viewPosition: 0.5,
      });
    }

    if (scrollViewRef.current && categoryOffsets[categoryId] !== undefined) {
      const scrollOffset = Math.max(0, categoryOffsets[categoryId] - 50);

      scrollViewRef.current.scrollToOffset({
        offset: scrollOffset,
        animated: true,
      });
    }
  };

  const getItemLayout = useCallback(
    (
      data:
        | ArrayLike<{
          alias: string;
          description: string | null;
          enabled: number;
          id: number;
          image_url: string;
          is_paused: number;
          items: Item[];
          mini_image_url: string;
          name: string;
          notes: string | null;
          order: number;
          paused_from_date: string | null;
          paused_to_date: string | null;
        }>
        | null
        | undefined,
      index: number,
    ) => {
      if (!data) {
        return { length: 0, offset: 0, index };
      }

      const category = data[index] as {
        alias: string;
        description: string | null;
        enabled: number;
        id: number;
        image_url: string;
        is_paused: number;
        items: Item[];
        mini_image_url: string;
        name: string;
        notes: string | null;
        order: number;
        paused_from_date: string | null;
        paused_to_date: string | null;
      };

      if (!category) {
        return { length: 0, offset: 0, index };
      }

      const height =
        categoryHeights[category.id] ||
        CATEGORY_HEADER_HEIGHT +
        category.items.length * ITEM_HEIGHT +
        CATEGORY_FOOTER_HEIGHT;
      const offset =
        categoryOffsets[category.id] ||
        Array.from({ length: index }, (_, i) => i).reduce(
          (sum: number, i: number) => {
            const cat = data[i] as {
              id: number;
              alias: string;
              name: string;
              description: string | null;
              notes: string | null;
              image_url: string;
              mini_image_url: string;
              items: Item[];
            };
            if (!cat) return sum;

            return (
              sum +
              (categoryHeights[cat.id] ||
                CATEGORY_HEADER_HEIGHT +
                cat.items.length * ITEM_HEIGHT +
                CATEGORY_FOOTER_HEIGHT)
            );
          },
          0,
        );

      return {
        length: height,
        offset: offset,
        index,
      };
    },
    [categoryHeights, categoryOffsets],
  );

  const renderCategorySection = useCallback(
    ({
      item: category,
    }: {
      item: {
        id: number;
        alias: string;
        name: string;
        description: string | null;
        notes: string | null;
        image_url: string;
        mini_image_url: string;
        items: Item[];
      };
    }) => {
      return <CategorySection category={category} navigation={navigation} />;
    },
    [],
  );

  const renderCategoryItem = useCallback(
    ({ item, index }: { item: Category; index: number }) => {
      return (
        <CategoryTab
          item={item}
          isSelected={selectedCategoryIndex === index}
          onPress={() => scrollToCategory(index, item.id)}
        />
      );
    },
    [selectedCategoryIndex, scrollToCategory],
  );

  return (
    <View style={[styles.container]}>
      {isItemsLoading ? (
        <SkeletonPlaceholder>
          <SkeletonPlaceholder.Item marginVertical={SCREEN_PADDING.vertical}>
            {/* Skeleton for Categories */}
            <SkeletonPlaceholder.Item
              flexDirection="row"
              alignItems="center"
              paddingHorizontal={SCREEN_PADDING.horizontal}
              gap={16}
              marginBottom={16}>
              {[...Array(6)].map((_, idx) => (
                <SkeletonPlaceholder.Item
                  key={idx}
                  width={50}
                  height={24}
                  borderRadius={8}
                />
              ))}
            </SkeletonPlaceholder.Item>

            {/* Skeleton for Grouped Items */}
            {[...Array(6)].map((_, idx) => (
              <SkeletonPlaceholder.Item
                key={idx}
                flexDirection="row"
                alignItems="center"
                marginBottom={16}
                paddingHorizontal={SCREEN_PADDING.horizontal}>
                <SkeletonPlaceholder.Item
                  width={80}
                  height={88}
                  borderRadius={8}
                />
                <SkeletonPlaceholder.Item marginLeft={16} flex={1}>
                  <SkeletonPlaceholder.Item
                    width="60%"
                    height={20}
                    borderRadius={4}
                    marginBottom={6}
                  />
                  <SkeletonPlaceholder.Item
                    width="40%"
                    height={20}
                    borderRadius={4}
                    marginBottom={6}
                  />
                  <SkeletonPlaceholder.Item
                    width="30%"
                    height={20}
                    borderRadius={4}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>
            ))}
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={categories}
            horizontal
            keyExtractor={item => item.id.toString()}
            renderItem={renderCategoryItem}
            showsHorizontalScrollIndicator={false}
            style={styles.categoryList}
            ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
            ListFooterComponent={() => <View style={{ width: 16 }} />}
            ListHeaderComponent={() => <View style={{ width: 16 }} />}
            onScrollToIndexFailed={info => {
              const wait = new Promise(resolve => setTimeout(resolve, 50));
              wait.then(() => {
                flatListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                  viewPosition: 0.5,
                });
              });
            }}
            initialNumToRender={15}
            maxToRenderPerBatch={15}
            windowSize={15}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={true}
          />

          <FlatList
            ref={scrollViewRef}
            data={groupedItems}
            renderItem={renderCategorySection}
            keyExtractor={item => item.id.toString()}
            style={{ paddingHorizontal: SCREEN_PADDING.horizontal, zIndex: 2 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primaryColor}
                colors={[COLORS.primaryColor]}
              />
            }
            onScrollToIndexFailed={info => {
              const wait = new Promise(resolve => setTimeout(resolve, 50));
              wait.then(() => {
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollToOffset({
                    offset:
                      info.index *
                      (CATEGORY_HEADER_HEIGHT +
                        5 * ITEM_HEIGHT +
                        CATEGORY_FOOTER_HEIGHT),
                    animated: true,
                  });
                }
              });
            }}
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            windowSize={3}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={50}
            getItemLayout={getItemLayout}
            onMomentumScrollEnd={event => {
              const offsetY = event.nativeEvent.contentOffset.y;
              let closestCategory = 0;
              let minDistance = Number.MAX_VALUE;

              Object.entries(categoryOffsets).forEach(
                ([categoryId, offset]) => {
                  const distance = Math.abs(offsetY - offset);
                  if (distance < minDistance) {
                    minDistance = distance;
                    closestCategory = Number(categoryId);
                  }
                },
              );

              const newIndex = categories.findIndex(
                cat => cat.id === closestCategory,
              );
              if (newIndex !== -1 && newIndex !== selectedCategoryIndex) {
                setSelectedCategoryIndex(newIndex);

                flatListRef.current?.scrollToIndex({
                  index: newIndex,
                  animated: true,
                  viewPosition: 0.5,
                });
              }
            }}
          />
        </>
      )}
    </View>
  );
};

export default MenuItemsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  categoryList: {
    maxHeight: 56,
    backgroundColor: COLORS.backgroundColor,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 5,

    zIndex: 5,
    overflow: 'visible'
  },
  categoryTab: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 3,
    paddingHorizontal: 4,
  },
  categoryTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    color: COLORS.darkColor,

    opacity: 0.45,
  },
  activeCategoryTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    color: COLORS.darkColor,
    opacity: 1,
  },
  categoryIndicator: {
    height: 2.5,
    width: '100%',
    backgroundColor: COLORS.primaryColor,
    marginTop: 4,
  },
  sectionHeader: {
    marginTop: 6,
    fontSize: normalizeFont(20),
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    color: COLORS.darkColor,
    height: CATEGORY_HEADER_HEIGHT,
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d2d2d2ff',
  },
  menuItem: {
    flex: 1,
    paddingTop: 0,
    gap: 1,
  },
  itemName: {
    fontSize: normalizeFont(16),
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    color: COLORS.darkColor,
    lineHeight: 18,
    textTransform: 'capitalize',
  },
  itemPrice: {
    fontSize: normalizeFont(16),
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    color: COLORS.secondaryColor,
    lineHeight: 20,
    marginTop: 6,
  },
  itemDescription: {
    fontSize: normalizeFont(12),
    color: COLORS.foregroundColor,
  },
});
