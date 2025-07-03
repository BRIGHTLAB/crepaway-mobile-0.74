import { Text, TouchableOpacity, View } from 'react-native';
import { CartItem } from '../../store/slices/cartSlice';
import { COLORS } from '../../theme';
import FastImage from 'react-native-fast-image';
import Icon_Decrease_Quantity from '../../../assets/SVG/Icon_Decrease_Quantity';
import Icon_Increase_Quantity from '../../../assets/SVG/Icon_Increase_Quantity';
import { OrderItem } from '../../api/ordersApi';
import { OrderedItem, TableUser } from '../../screens/TableScreen';
import React from 'react';

const OrderedItemCmp = ({
  item,
  orderedByUser,
  onQuantityIncrease,
  onQuantityDecrease,
  onItemImageClick,
  isDisabled,
}: {
  item: OrderedItem & { uuid: string };
  orderedByUser?: TableUser;
  onQuantityIncrease?: () => void;
  onQuantityDecrease?: () => void;
  onItemImageClick?: () => void;
  isDisabled: boolean,
}) => {
  const calculateItemTotal = () => {
    // Base item price
    let itemTotal = item?.price ? item.price * item.quantity : 0;

    // Add modifier prices
    if (item.modifier_groups) {
      item.modifier_groups.forEach(group => {
        group.modifier_items.forEach(modItem => {
          itemTotal += (modItem.price || 0) * (modItem.quantity || 1);
        });
      });
    }

    return itemTotal;
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: `${COLORS.foregroundColor}40`,
        paddingVertical: 10,
        opacity: isDisabled ? 0.5 : 1
      }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 8,
        }}>
        <TouchableOpacity onPress={onItemImageClick} disabled={isDisabled}>
          <FastImage
            source={{
              uri: item.image_url || 'https://placehold.co/600x400/png',
              priority: FastImage.priority.normal,
            }}
            style={{ width: 80, height: 88, borderRadius: 8 }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={2}
            style={{
              fontFamily: 'Poppins-Medium',
              fontSize: 16,
              color: COLORS.darkColor,
            }}>
            {item.name}
            {item?.quantity > 1 && <Text> x{item.quantity}</Text>}
          </Text>

          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              fontSize: 16,
              color: COLORS.secondaryColor,
            }}>
            {item.symbol} {calculateItemTotal().toFixed(2)}
          </Text>

          {/* Ordered By User Info */}
          {orderedByUser && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 4,
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: 10,
                  color: COLORS.foregroundColor,
                  marginRight: 4,
                }}>
                Ordered by:
              </Text>
              <FastImage
                source={{
                  uri:
                    orderedByUser.image_url ||
                    'https://placehold.co/200x200/png',
                  priority: FastImage.priority.normal,
                }}
                style={{ width: 16, height: 16, borderRadius: 8, marginRight: 4 }}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: 10,
                  color: COLORS.foregroundColor,
                }}>
                {orderedByUser.name}
              </Text>
            </View>
          )}

          {/* Modifier Groups */}
          {item.modifier_groups && item.modifier_groups.length > 0 && (
            <View style={{ marginTop: 4 }}>
              {item.modifier_groups.map(group => (
                <View key={group.id}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      fontSize: 11,
                      color: COLORS.darkColor,
                    }}>
                    {group.name}:
                  </Text>
                  {group.modifier_items.map(modItem => (
                    <View
                      key={modItem.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Regular',
                          fontSize: 10,
                          color: COLORS.foregroundColor,
                        }}>
                        {modItem.name}{' '}
                        {modItem.quantity > 1 ? `x${modItem.quantity}` : ''}
                      </Text>
                      {modItem.price ? (
                        <Text
                          style={{
                            fontFamily: 'Poppins-Regular',
                            fontSize: 10,
                            color: COLORS.secondaryColor,
                          }}>
                          {item.symbol} {modItem.price}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {item?.special_instruction && (
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Poppins-Regular',
                fontSize: 12,
                color: COLORS.foregroundColor,
                marginTop: 4,
              }}>
              Note: {item.special_instruction}
            </Text>
          )}
        </View>
      </View>

      {/* Quantity Controls */}
      {!isDisabled && onQuantityDecrease && onQuantityIncrease && (
        <View
          style={{
            backgroundColor: COLORS.primaryColor,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 8,
          }}>
          <TouchableOpacity
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={onQuantityDecrease}>
            <Icon_Decrease_Quantity color={'#FFF'} />
          </TouchableOpacity>
          <Text
            style={{
              color: '#FFF',
              fontSize: 18,
              width: 32,
              height: 32,
              paddingTop: 2,
              textAlign: 'center',
            }}>
            {item?.quantity}
          </Text>
          <TouchableOpacity
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={onQuantityIncrease}>
            <Icon_Increase_Quantity color={'#FFF'} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default OrderedItemCmp;
