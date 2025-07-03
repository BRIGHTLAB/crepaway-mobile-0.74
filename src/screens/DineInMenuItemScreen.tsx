import uuid from 'react-native-uuid';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import FastImage from 'react-native-fast-image';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/NavigationStack';
import { TYPOGRAPHY } from '../constants/typography';
import TasteTriadProgress from '../components/Menu/TasteTriadProgress';
import store, { RootState, useAppDispatch } from '../store/store';
import { addItem, updateItem } from '../store/slices/cartSlice';
import Icon_Increase_Quantity from '../../assets/SVG/Icon_Increase_Quantity';
import Icon_Decrease_Quantity from '../../assets/SVG/Icon_Decrease_Quantity';
import Button from '../components/UI/Button';
import Icon_Cart from '../../assets/SVG/Icon_Cart';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import DynamicSheet from '../components/Sheets/DynamicSheet';
import Icon_WishList from '../../assets/SVG/Icon_Wishlist';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Input from '../components/UI/Input';
import Icon_Wishlist_Filled from '../../assets/SVG/Icon_Wishlist_Filled';
import ModifierGroup from '../components/Menu/ModifierGroup';
import { useSelector } from 'react-redux';
import {
  useGetItemDetailsQuery,
  useToggleFavoriteMutation,
} from '../api/menuApi';
import { COLORS } from '../theme';
import { DineInOrderStackParamList } from '../navigation/DineInOrderStack';
import SocketService from '../utils/SocketService';
import { OrderedItem, OrderedItems } from './TableScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetView } from '@gorhom/bottom-sheet';

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

type DineInMenuItemScreenRouteProp = RouteProp<
  DineInOrderStackParamList,
  'MenuItem'
>;

const DineInMenuItemScreen = ({ }: IProps) => {
  const navigation = useNavigation();
  const route = useRoute<DineInMenuItemScreenRouteProp>();
  const { itemId, itemUuid, item } = route.params;
  const [quantity, setQuantity] = useState(1);
  const tasteSheetRef = useRef<BottomSheetMethods | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [selectedModifiers, setSelectedModifiers] = useState<
    SelectedModifierGroup[]
  >([]);
  const [specialInstruction, setSpecialInstruction] = useState('');
  const userState = useSelector((state: RootState) => state.user);

  const menu = 'mobile-app-delivery';
  const branch = 'ashrafieh';

  const {
    data: itemData,
    isLoading,
    error,
  } = useGetItemDetailsQuery({ itemId, menu, branch });

  const [toggleFavorite, { isLoading: isTogglingFavorite }] =
    useToggleFavoriteMutation();

  console.log('osp', JSON.stringify(itemData, null, 2));
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
    if (itemData) {
      setFavorite(itemData.is_favorite === 1);
    }
  }, [itemData]);

  console.log('whatever');
  useEffect(() => {
    if (!itemUuid || !item || !itemData) return;

    setQuantity(item.quantity);
    setSpecialInstruction(item.special_instruction || '');
    console.log('modifiersare', item?.modifier_groups?.[0]?.modifier_items);
    // Set selected modifiers if available
    console.log('itemSentToScreen', JSON.stringify(item, null, 2));
    if (item?.modifier_groups && item.modifier_groups.length > 0) {
      const formattedModifiers = item.modifier_groups.map(
        (group: OrderedItem['modifier_groups'][0]) => ({
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
        }),
      );
      console.log('format', formattedModifiers);
      setSelectedModifiers(formattedModifiers);
    }
  }, [itemUuid, item, itemData]);

  const handleAddToOrder = () => {
    console.log('itemData', itemData);
    console.log('userState', userState);
    console.log('userState.branchTable', userState.branchTable);
    console.log('userState.tableSessionId', userState.tableSessionId);
    if (
      !itemData ||
      !userState ||
      !userState.branchTable ||
      !userState.tableSessionId
    ) {
      console.error('Missing required data to add item');
      return;
    }

    const socketInstance = SocketService.getInstance();

    // Format modifiers if any
    const formattedModifiers =
      selectedModifiers.length > 0
        ? selectedModifiers.map(modifierGroup => ({
          id: modifierGroup.id,
          name: modifierGroup.name,
          modifier_groups_id: modifierGroup.modifier_groups_id,
          modifier_items: modifierGroup.modifier_items.map(modItem => ({
            id: modItem.id,
            name: modItem.name,
            price: modItem.price,
            quantity: modItem.quantity,
            plu: modItem.plu,
            modifier_items_id: modItem.modifier_items_id,
            // symbol: modItem.symbol,
          })),
        }))
        : [];

    // Prepare item data
    const preparedItem = {
      id: itemData.id,
      name: itemData.name || '',
      image_url: itemData.image_url || '',
      price: itemData.price,
      symbol: itemData.symbol || '',
      quantity: quantity,
      special_instruction: specialInstruction,
      modifier_groups: formattedModifiers,
      epoch: Date.now(),
      status: 'pending',
      deleted: 0,
      added_by: {
        id: userState.id,
        name: userState.name,
        image_url: userState.image_url,
        type: 'user',
      },
    };

    // Generate new UUID if needed
    const uUid = itemUuid || uuid.v4();

    // Structure the item object with UUID as key
    const messageData = {
      tableName: userState.branchTable,
      item: {
        [uUid]: preparedItem,
      },
    };

    console.log('sending to tableUpdate ', messageData);
    // Emit socket message to update item
    socketInstance.emit('message', {
      type: 'updateItem',
      data: messageData,
    });

    setQuantity(1);
    setSpecialInstruction('');
    setSelectedModifiers([]);

    // Navigate back
    navigation.goBack();
  };
  const { bottom } = useSafeAreaInsets();

  const handleIncreaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const calculateModifiersTotal = () => {
    return selectedModifiers.reduce((total, modifierGroup) => {
      const group = itemData?.modifier_groups.find(
        group => group.id === modifierGroup.id,
      );

      if (group && group.has_additional_charge) {
        return (
          total +
          modifierGroup.modifier_items.reduce((groupTotal, modifierItem) => {
            return groupTotal + modifierItem.price * modifierItem.quantity;
          }, 0)
        );
      }
      return total;
    }, 0);
  };

  return (
    <>
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView style={{ backgroundColor: '#fff' }}>
            <FastImage
              source={{
                uri:
                  itemData?.image_url ||
                  'https://d3vfh4cqgoixck.cloudfront.net/images/locations_placeholder1.webp',
                priority: FastImage.priority.normal,
              }}
              resizeMode={FastImage.resizeMode.cover}
              style={styles.image}
            />

            {itemData?.taste_triad && itemData?.taste_triad?.length > 0 && (
              <TouchableOpacity
                style={styles?.tasteContainer}
                onPress={() => tasteSheetRef.current?.expand()}>
                {itemData?.taste_triad?.map((el, idx) => (
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
                  <Text style={styles.title}>{itemData?.name}</Text>
                  <TouchableOpacity onPress={handleWishList}>
                    {favorite ? (
                      <Icon_Wishlist_Filled style={{ marginTop: 4 }} />
                    ) : (
                      <Icon_WishList style={{ marginTop: 4 }} />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.description}>{itemData?.description}</Text>
              </View>

              <View style={{ marginBottom: 8, marginTop: 10, gap: 6 }}>
                {/* Price  */}
                <Text style={styles.price}>
                  {itemData?.symbol} {itemData?.price}
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
                {itemData?.tags &&
                  itemData?.tags?.length > 0 &&
                  itemData?.tags?.map((el, idx) => {
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
                onPress={handleAddToOrder}>
                {!!itemUuid ? 'Update Cart' : 'Add to Cart'} - {item?.symbol}{' '}
                {item
                  ? (item.price * quantity + calculateModifiersTotal()).toFixed(
                      2,
                    )
                  : '0.00'}
              </Button> */}

              {/* Modifiers  */}
              <View style={{ marginTop: 16, gap: 16 }}>
                {itemData?.modifier_groups.map((group, idx) => {
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
          <View
            style={{
              paddingHorizontal: 16,
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
              onPress={handleAddToOrder}>
              {!!itemUuid ? 'Update Order' : 'Add to Order'} -{' '}
              {itemData?.symbol}{' '}
              {itemData
                ? (
                  itemData.price * quantity +
                  calculateModifiersTotal()
                ).toFixed(2)
                : '0.00'}
            </Button>
          </View>
        </View>
      )}

      <DynamicSheet ref={tasteSheetRef}>
        <BottomSheetView style={
          { paddingBottom: bottom }
        }>
          <Text style={{ color: COLORS.darkColor }}>Taste Triad</Text>
          <Text style={{ color: COLORS.foregroundColor }}>
            Elevating Your Culinary Experience with Flavor, Texture, and Spice
          </Text>

          <View style={{ flexDirection: 'column', gap: 7 }}>
            {itemData?.taste_triad?.map((el, idx) => (
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

export default DineInMenuItemScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    height: 300,
    width: '100%',
    // aspectRatio: 1.31,
    // borderBottomLeftRadius: 16,
    // borderBottomRightRadius: 16,
  },
  tasteContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
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
