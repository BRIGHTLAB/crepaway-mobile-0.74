
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import uuid from 'react-native-uuid';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
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
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { TYPOGRAPHY } from '../constants/typography';
import { DineInOrderStackParamList } from '../navigation/DineInOrderStack';
import { RootState } from '../store/store';
import { COLORS, SCREEN_PADDING } from '../theme';
import { normalizeFont } from '../utils/normalizeFonts';
import SocketService from '../utils/SocketService';
import { OrderedItem } from './TableScreen';

const SkeletonLoader = () => {
  return (
    <SkeletonPlaceholder>
      <SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item
          height={276}
          width="100%"
        />
        <SkeletonPlaceholder.Item padding={16} borderTopLeftRadius={24} borderTopRightRadius={24}>
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

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const DineInMenuItemScreen = ({ }: IProps) => {
  const navigation = useNavigation();
  const route = useRoute<DineInMenuItemScreenRouteProp>();
  const { itemId, itemUuid, item } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [selectedModifiers, setSelectedModifiers] = useState<
    SelectedModifierGroup[]
  >([]);
  const [specialInstruction, setSpecialInstruction] = useState('');
  const userState = useSelector((state: RootState) => state.user);
  const isTableLocked = useSelector((state: RootState) => state.dineIn.isTableLocked);



  const {
    data: itemData,
    isLoading,
    error,
  } = useGetItemDetailsQuery({
    itemId, menuType: userState.menuType, branch: userState.branchTable
      ? userState.branchTable.split('.')?.[0]?.toLowerCase()
      : null,
  });

  console.log('queryparams')
  const [toggleFavorite, { isLoading: isTogglingFavorite }] =
    useToggleFavoriteMutation();

  console.log('osp', JSON.stringify(itemData, null, 2));
  const handleWishList = async () => {
    try {
      setFavorite(prev => !prev);
      await toggleFavorite({
        itemId, menuType: userState.menuType, branch: userState.branchTable
          ? userState.branchTable.split('.')?.[0]?.toLowerCase()
          : null,
      });
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

    const isNewItem = !itemUuid;

    // Check if table is locked
    if (isTableLocked) {
      console.log('Table is locked, cannot add items');
      return;
    }

    if (
      !itemData ||
      !userState ||
      !userState.branchTable ||
      !userState.tableSessionId
    ) {
      console.log('itemData', itemData);
      console.log('userState', userState);
      console.log('userState.branchTable', userState.branchTable);
      console.log('userState.tableSessionId', userState.tableSessionId);
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
      plu: itemData.plu || '',
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

    const toastMessage = itemUuid 
      ? `${itemData.name} (x${quantity}) updated in order`
      : `${itemData.name} (x${quantity}) added to order`;
    Toast.show({
      type: 'success',
      text1: toastMessage,
      visibilityTime: 3000,
      position: 'bottom',
    });

    if (isNewItem) {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }

    setQuantity(1);
    setSpecialInstruction('');
    setSelectedModifiers([]);

    // Navigate back
    navigation.goBack();
  };


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
            return groupTotal + (modifierItem.price || 0) * modifierItem.quantity;
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
        <View style={{ flex: 1, backgroundColor: COLORS.backgroundColor }}>

          <KeyboardAvoidingView
            style={{
              flex: 1,
            }}
            behavior={"padding"}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              alwaysBounceVertical={true}
              bounces={true}
              overScrollMode="always"
            >

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



              <View style={[styles.contentContainer, styles.detailCard]}>
                <View style={styles.headerContainer}>
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
                  {!!itemData?.description && (
                    <Text style={styles.description}>{itemData?.description}</Text>
                  )}
                </View>

                <View style={{ paddingHorizontal: 16, marginBottom: 8, marginTop: 10, gap: 6 }}>
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
                {itemData?.tags && itemData.tags.length > 0 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      marginTop: 4,
                      gap: 8,
                      paddingHorizontal: SCREEN_PADDING.horizontal,
                    }}>
                    {itemData?.tags?.map((el, idx) => {
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
                )}

                {/* Modifiers  */}
                <View style={{ marginTop: 16, gap: 16 }}>
                  {itemData?.modifier_groups.map((group, idx) => {
                    return (
                      <React.Fragment key={idx}>
                        <ModifierGroup
                          group={group}
                          selectedModifiers={selectedModifiers}
                          setSelectedModifiers={setSelectedModifiers}
                          isEditMode={!!itemUuid}
                        />
                        <View style={{
                          height: 10,
                          backgroundColor: COLORS.borderColor,
                          opacity: 0.03,
                        }} />
                      </React.Fragment>
                    );
                  })}
                </View>

                <View style={{ marginTop: 16, gap: 6, paddingHorizontal: 16 }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      fontSize: 16,
                      color: COLORS.darkColor,
                    }}>
                    Special Instruction
                  </Text>
                  <Input
                    placeholder=""
                    value={specialInstruction}
                    onChangeText={setSpecialInstruction}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <View
            style={{
              paddingHorizontal: SCREEN_PADDING.horizontal,
              paddingBottom: 34,
              backgroundColor: COLORS.backgroundColor,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: -4,
              },
              shadowOpacity: 0.03,
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
                marginTop: 15,
              }}>
              <TouchableOpacity
                onPress={handleDecreaseQuantity}
                style={[styles.quantityButton]}
                disabled={quantity < 2}>
                <Icon_Decrease_Quantity
                  width={14}
                  height={2}
                  color={quantity < 2 ? '#8391A1' : COLORS.primaryColor}
                />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                onPress={handleIncreaseQuantity}
                style={styles.quantityButton}>
                <Icon_Increase_Quantity width={15} height={15} />
              </TouchableOpacity>
            </View>



            <View
              style={styles.addToCartButton}>
              <Button
                disabled={isTableLocked}
                icon={<Icon_Cart />}
                iconPosition="right"
                textSize="large"
                onPress={handleAddToOrder}
                variant={isTableLocked ? 'accent' : 'primary'}
                backgroundColor={isTableLocked ? '#FF6D00' : undefined}>
                {isTableLocked
                  ? 'Table is locked'
                  : `${!!itemUuid ? 'Update Order' : 'Add to Order'} - ${itemData?.symbol} ${itemData
                    ? (
                      itemData.price * quantity +
                      calculateModifiersTotal()
                    ).toFixed(2)
                    : '0.00'}`
                }
              </Button>

            </View>

          </View>
        </View>
      )}


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
  },
  tasteContainer: {
    paddingTop: 16,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contentContainer: {
    // paddingVertical: 16,
  },
  detailCard: {
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: COLORS.backgroundColor,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerContainer: {
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: normalizeFont(22),
    color: COLORS.darkColor,
    width: '90%',
    textTransform: 'capitalize',
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalizeFont(13),
    color: COLORS.foregroundColor,
  },
  price: {
    fontFamily: 'Poppins-Medium',
    fontSize: normalizeFont(22),
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
    fontSize: 20,
    color: COLORS.primaryColor,
  },
  addToCartButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
