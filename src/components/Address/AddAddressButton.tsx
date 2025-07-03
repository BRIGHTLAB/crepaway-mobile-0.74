import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import Icon_Add from '../../../assets/SVG/Icon_Add';

type Props = {
  onPress: () => void;
};

const AddAddressButton = ({onPress}: Props) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Icon_Add />
      <Text style={styles.text}>Add New Address</Text>
    </TouchableOpacity>
  );
};

export default AddAddressButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#BABABA26',
    borderWidth: 2,
    borderColor: '#8391A1',
    borderStyle: 'dashed',
    gap: 11,
    paddingVertical: 16,
    borderRadius: 8,
  },
  text: {
    color: '#8391A1',
    fontSize: 14,
  },
});
