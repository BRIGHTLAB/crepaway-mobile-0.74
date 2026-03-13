import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon_Decrease_Quantity from '../../../assets/SVG/Icon_Decrease_Quantity';
import Icon_Increase_Quantity from '../../../assets/SVG/Icon_Increase_Quantity';
import { COLORS } from '../../theme';

type QuantityControlProps = {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
};

const QuantityControl = ({
  value,
  onIncrease,
  onDecrease,
  min = 1,
  max,
}: QuantityControlProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onDecrease}
        disabled={value <= min}>
        <Icon_Decrease_Quantity color={'#FFF'} />
      </TouchableOpacity>
      <Text style={styles.value}>{value}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onIncrease}
        disabled={max !== undefined && value >= max}>
        <Icon_Increase_Quantity color={'#FFF'} />
      </TouchableOpacity>
    </View>
  );
};

export default QuantityControl;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primaryColor,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: '#FFF',
    fontSize: 18,
    width: 32,
    height: 32,
    paddingTop: 2,
    textAlign: 'center',
  },
});
