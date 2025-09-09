import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon_Cart from '../../../assets/SVG/Icon_Cart';
import {COLORS} from '../../theme';
import {useSelector} from 'react-redux';
import {RootState, useAppDispatch} from '../../store/store';

const CartCounter = ({color}: {color?: string}) => {
  const state = useSelector((state: RootState) => state.cart);
  const itemCount = Object.values(state.items)?.length;

  return (
    <View style={styles.container}>
      <Icon_Cart
        color={color || '#191919'}
        width={26}
        height={26}
        style={styles.iconStyle}
      />
      {itemCount > 0 && (
        <View style={styles.cartCount}>
          <Text style={styles.cartCountText}>{itemCount}</Text>
        </View>
      )}
    </View>
  );
};

export default CartCounter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center'
  },
  iconStyle: {
    marginTop: 5, 
    marginRight: 3,
  },
  cartCount: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primaryColor,
    width: 18,
    height: 18,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: 'white',
  },
});
