import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import FastImage from 'react-native-fast-image';
import { COLORS } from '../../theme';
import { OrderItem } from '../../api/ordersApi';

type Props = {
  item: OrderItem;
};

const Item = ({ item }: Props) => {
  console.log('item', item);
  return (
    <View style={styles.orderItemContainer}>
      <FastImage
        source={{
          uri: item.image_url,
        }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={styles.itemPrice}>
          ${item.price} × {item.quantity}
        </Text>
      </View>
    </View>
  );
};

export default Item;

const styles = StyleSheet.create({
  orderItemContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.darkColor,
  },
  itemDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.foregroundColor,
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.secondaryColor,
  },
});
