import { BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useHeaderHeight } from '@react-navigation/elements';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useSelector } from 'react-redux';
import Icon_Cart from '../../assets/SVG/Icon_Cart';
import Icon_Decrease_Quantity from '../../assets/SVG/Icon_Decrease_Quantity';
import Icon_Increase_Quantity from '../../assets/SVG/Icon_Increase_Quantity';
import Icon_WishList from '../../assets/SVG/Icon_Wishlist';
import Icon_Wishlist_Filled from '../../assets/SVG/Icon_Wishlist_Filled';
import {
  useGetItemDetailsQuery,
  useToggleFavoriteMutation,
} from '../api/menuApi';
import ModifierGroup from '../components/Menu/ModifierGroup';
import TasteTriadProgress from '../components/Menu/TasteTriadProgress';
import DynamicSheet from '../components/Sheets/DynamicSheet';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { TYPOGRAPHY } from '../constants/typography';
import { DeliveryTakeawayStackParamList } from '../navigation/DeliveryTakeawayStack';
import { addItem, updateItem } from '../store/slices/cartSlice';
import { RootState, useAppDispatch } from '../store/store';
import { COLORS, SCREEN_PADDING } from '../theme';


const SkeletonLoader = () => {
  return (
    <SkeletonPlaceholder>
      <SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item
          height={300}
          width="100%"
        // borderBottomLeftRadius={16}
        // borderBottomRightRadius={16}
        />
        <SkeletonPlaceholder.Item padding={16}>
          <SkeletonPlaceholder.Item height={24} width="60%" marginBottom={8} />
          <SkeletonPlaceholder.Item height={18} width="80%" marginBottom={16} />
          <SkeletonPlaceholder.Item height={24} width="30%" marginBottom={8} />
          <SkeletonPlaceholder.Item
            flexDirection="row"
            alignItems="center"
            gap={4}
            marginBottom={16}>
            <SkeletonPlaceholder.Item height={16} width={40} />
            <SkeletonPlaceholder.Item height={16} width={60} />
          </SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item
            flexDirection="row"
            flexWrap="wrap"
            gap={8}
            marginBottom={16}>
            <SkeletonPlaceholder.Item height={24} width={60} borderRadius={8} />
            <SkeletonPlaceholder.Item height={24} width={60} borderRadius={8} />
            <SkeletonPlaceholder.Item height={24} width={60} borderRadius={8} />
          </SkeletonPlaceholder.Item>
          {/* <SkeletonPlaceholder.Item
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            gap={30}
            width="50%"
            marginHorizontal="auto"
            marginTop={20}
            marginBottom={16}>
            <SkeletonPlaceholder.Item width={25} height={25} />
            <SkeletonPlaceholder.Item width={40} height={24} />
            <SkeletonPlaceholder.Item width={25} height={25} />
          </SkeletonPlaceholder.Item> */}
          {/* <SkeletonPlaceholder.Item height={50} width="100%" borderRadius={8} /> */}
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

interface IProps {
  // item: Item;
}

type MenuItemScreenRouteProp = RouteProp<
  DeliveryTakeawayStackParamList,
  'MenuItem'
>;

const MenuItemScreen = ({ }: IProps) => {
  const navigation = useNavigation();
  const route = useRoute<MenuItemScreenRouteProp>();
  const { itemId, itemUuid } = route.params;
  const [quantity, setQuantity] = useState(1);
  const dispatch = useAppDispatch();
  const tasteSheetRef = useRef<BottomSheetMethods | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [selectedModifiers, setSelectedModifiers] = useState<
    SelectedModifierGroup[]
  >([]);
  const [specialInstruction, setSpecialInstruction] = useState('');
  const cartState = useSelector((state: RootState) => state.cart);

  const menu = 'mobile-app-delivery';
  const branch = useSelector((state: RootState) => state.user.branchName) || ''


  const { bottom } = useSafeAreaInsets();

  const {
    data: item,
    isLoading,
    error,
  } = useGetItemDetailsQuery({ itemId, menu, branch });

  const [toggleFavorite, { isLoading: isTogglingFavorite }] =
    useToggleFavoriteMutation();

  const handleWishList = async () => {
    try {
      setFavorite(prev => !prev);
      await toggleFavorite({ itemId, menu, branch });
    } catch (error) {
      setFavorite(prev => !prev);
      console.error('Error toggling favorite:', error);
    }
  };

  useEffect(() => {
    if (item) {
      setFavorite(item.is_favorite === 1);
    }
  }, [item]);

  useEffect(() => {
    if (!!itemUuid && cartState.items[itemUuid]) {
      const cartItem = cartState.items[itemUuid];
      setQuantity(cartItem.quantity);
      setSpecialInstruction(cartItem.special_instruction || '');
      if (cartItem.modifier_groups) {
        const formattedModifiers = cartItem.modifier_groups.map(group => ({
          id: group.id,
          modifier_groups_id: group.modifier_groups_id,
          name: group.name || '',
          modifier_items: group.modifier_items.map(item => ({
            id: item.id,
            modifier_items_id: item.modifier_items_id,
            plu: item.plu,
            price: item.price,
            quantity: item.quantity,
            name: item.name || '',
            symbol: item.symbol || '',
          })),
        }));
        setSelectedModifiers(formattedModifiers);
      }
    }
  }, [itemUuid, cartState.items]);

  const handleAddToCart = () => {
    if (item) {
      const cartItem = {
        id: item.id,
        categories_id: item.categories_id,
        items_id: item.items_id,
        plu: item.plu || '',
        name: item.name || '',
        symbol: item.symbol || '',
        price: item.price,
        description: item.description || '',
        image_url: item.image_url || '',
        quantity: quantity,
        special_instruction: specialInstruction,
        modifier_groups:
          selectedModifiers.length > 0 ? selectedModifiers : undefined,
      };

      // console.log('selected modifiers', JSON.stringify(selectedModifiers));

      if (!!itemUuid) {
        dispatch(updateItem({ uuid: itemUuid, item: cartItem }));
      } else {
        dispatch(addItem(cartItem));
      }

      setQuantity(1);
      setSpecialInstruction('');

      navigation.goBack();
    }
  };

  const handleIncreaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  // const handleFetchItem = async () => {
  //   if (!itemId) return;

  //   setIsLoading(true);
  //   const {data} = await GET<Item>({
  //     endpoint: `/items/${itemId}?menu=mobile-app-delivery&branch=ashrafieh`,
  //   });
  //   if (data) {
  //     setItem(data);
  //     setFavorite(data?.is_favorite === 1);
  //     // console.log('item inner mod groups', data?.modifier_groups);
  //   }

  //   setIsLoading(false);
  // };

  // useEffect(() => {
  //   handleFetchItem();
  // }, []);

  // const handleWishList = async () => {
  //   setFavorite(prev => !prev);

  //   const response = await POST({
  //     endpoint: `/favorite_items/${itemId}?menu=mobile-app-delivery&branch=ashrafieh`,
  //   });

  //   // console.log('response favorite', response);

  //   if (response.status !== 200) {
  //     setFavorite(prev => !prev);
  //   }
  // };

  const calculateModifiersTotal = () => {
    return selectedModifiers.reduce((total, modifierGroup) => {
      const group = item?.modifier_groups.find(
        group => group.id === modifierGroup.id,
      );

      if (group && group.has_additional_charge) {
        return (
          total +
          modifierGroup.modifier_items.reduce((groupTotal, modifierItem) => {
            return groupTotal + (modifierItem.price || 0) * modifierItem.quantity;
          }, 0)
        );
      }
      return total;
    }, 0);
  };

  const headerHeight = useHeaderHeight();
  return (
    <>
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <View style={{ flex: 1, backgroundColor: 'white' }}>

          <KeyboardAvoidingView
            style={{
              flex: 1,
            }}
            behavior={"padding"}
            keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight + 10 : 0}
          >
            <ScrollView style={{ backgroundColor: '#fff' }}>

              <FastImage
                source={{
                  uri:
                    item?.image_url ||
                    'https://d3vfh4cqgoixck.cloudfront.net/images/locations_placeholder1.webp',
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.cover}
                style={styles.image}
              />

              {item?.taste_triad && item?.taste_triad?.length > 0 && (
                <TouchableOpacity
                  style={styles?.tasteContainer}
                  onPress={() => tasteSheetRef.current?.expand()}>
                  {item?.taste_triad?.map((el, idx) => (
                    <TasteTriadProgress
                      key={idx}
                      percentage={el?.percentage}
                      color={el.hex_color}
                      title={el.title}
                    />
                  ))}
                </TouchableOpacity>
              )}

              <View style={styles.contentContainer}>
                <View style={styles.header}>
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      gap: 6,
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.title}>{item?.name}</Text>
                    <TouchableOpacity onPress={handleWishList}>
                      {favorite ? (
                        <Icon_Wishlist_Filled style={{ marginTop: 4 }} />
                      ) : (
                        <Icon_WishList style={{ marginTop: 4 }} />
                      )}
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.description}>{item?.description}</Text>
                </View>

                <View style={{ marginBottom: 8, marginTop: 10, gap: 6 }}>
                  {/* Price  */}
                  <Text style={styles.price}>
                    {item?.symbol} {item?.price}
                  </Text>

                  {/* Rating  */}
                  {/* <View style={styles.ratingContainer}>
                  <Icon_Star style={{marginBottom: 4}} />
                  <Text style={styles.rating}>4.93</Text>
                  <Text style={styles.nbrRating}>(300 ratings)</Text>
                </View> */}
                </View>

                {/* Tags  */}
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    marginTop: 4,
                    gap: 8,
                  }}>
                  {item?.tags &&
                    item?.tags?.length > 0 &&
                    item?.tags?.map((el, idx) => {
                      return (
                        <View
                          key={idx}
                          style={{
                            backgroundColor: el?.color || '#F2CA4540',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                            borderRadius: 8,
                            padding: 8,
                          }}>
                          <FastImage
                            style={{ height: 16, width: 16 }}
                            source={{
                              uri: el.icon_url,
                              priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.contain}
                          />

                          <Text style={{}}>{el.name}</Text>
                        </View>
                      );
                    })}
                </View>

                {/* <Button
                style={styles.addToCartButton}
                icon={<Icon_Cart />}
                iconPosition="right"
                textSize="large"
                onPress={handleAddToCart}>
                {!!itemUuid ? 'Update Cart' : 'Add to Cart'} - {item?.symbol}{' '}
                {item
                  ? (item.price * quantity + calculateModifiersTotal()).toFixed(
                      2,
                    )
                  : '0.00'}
              </Button> */}

                {/* Modifiers  */}
                <View style={{ marginTop: 16, gap: 16 }}>
                  {item?.modifier_groups.map((group, idx) => {
                    return (
                      <ModifierGroup
                        key={idx}
                        group={group}
                        selectedModifiers={selectedModifiers}
                        setSelectedModifiers={setSelectedModifiers}
                      />
                    );
                  })}
                </View>

                <View style={{ marginTop: 16, gap: 6 }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      fontSize: 16,
                      color: COLORS.darkColor,
                    }}>
                    Special Instruction
                  </Text>
                  <Input
                    placeholder="Special Instruction"
                    value={specialInstruction}
                    onChangeText={setSpecialInstruction}
                  />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <View
            style={{
              paddingHorizontal: SCREEN_PADDING.horizontal,
              paddingBottom: 34,
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: -4,
              },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              elevation: 5,
            }}>
            {/* Quantity Controls */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 30,
                width: '50%',
                marginHorizontal: 'auto',
                marginTop: 20,
              }}>
              <TouchableOpacity
                onPress={handleDecreaseQuantity}
                style={[styles.quantityButton]}
                disabled={quantity < 2}>
                <Icon_Decrease_Quantity
                  color={quantity < 2 ? '#8391A1' : COLORS.primaryColor}
                />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                onPress={handleIncreaseQuantity}
                style={styles.quantityButton}>
                <Icon_Increase_Quantity />
              </TouchableOpacity>
            </View>

            <Button
              style={styles.addToCartButton}
              icon={<Icon_Cart />}
              iconPosition="right"
              textSize="large"
              onPress={handleAddToCart}>
              {!!itemUuid ? 'Update Cart' : 'Add to Cart'} - {item?.symbol}{' '}
              {item
                ? (item.price * quantity + calculateModifiersTotal()).toFixed(2)
                : '0.00'}
            </Button>
          </View>
        </View>

      )}

      <DynamicSheet ref={tasteSheetRef}>
        <BottomSheetView style={{
          paddingBottom: bottom
        }}>
          <Text style={{ color: COLORS.darkColor }}>Taste Triad</Text>
          <Text style={{ color: COLORS.foregroundColor }}>
            Elevating Your Culinary Experience with Flavor, Texture, and Spice
          </Text>

          <View style={{ flexDirection: 'column', gap: 7 }}>
            {item?.taste_triad?.map((el, idx) => (
              <View
                key={idx}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TasteTriadProgress
                  percentage={el?.percentage}
                  color={el.hex_color}
                  title={el.title}
                />

                <Text style={{ fontFamily: 'Poppins-Normal', fontSize: 16 }}>
                  {el?.description}
                </Text>
              </View>
            ))}
          </View>
        </BottomSheetView>
      </DynamicSheet>
    </>
  );
};

export default MenuItemScreen;

const styles = StyleSheet.create({
  image: {
    height: 300,
    width: '100%',
    // aspectRatio: 1.31,
    // borderBottomLeftRadius: 16,
    // borderBottomRightRadius: 16,
  },
  tasteContainer: {
    paddingTop: 16,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 16,
  },
  header: {},
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 24,
    color: COLORS.darkColor,
    width: '90%',
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.foregroundColor,
  },
  price: {
    fontFamily: 'Poppins-Medium',
    fontSize: 24,
    fontWeight: '500',
    color: COLORS.secondaryColor,
    lineHeight: 32,
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.darkColor,
  },
  nbrRating: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.foregroundColor,
  },

  quantityButton: {
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: COLORS.primaryColor,
  },
  addToCartButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
