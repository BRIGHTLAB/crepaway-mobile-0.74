import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {COLORS, TYPOGRAPHY} from '../../theme';
import Icon_Arrow_Right from '../../../assets/SVG/Icon_Arrow_Right';

type Props = {
  iconLeft?: React.ReactNode;
  title: string;
  onPress: () => void;
  error?: string;
};

const SelectButton = ({title, iconLeft, onPress, error}: Props) => {
  return (
    <View style={{gap: 4, width: '100%'}}>
      <TouchableOpacity
        style={[
          styles.btn,
          {
            borderColor: error ? COLORS.errorColor : COLORS.borderColor,
          },
        ]}
        onPress={onPress}>
        {iconLeft && iconLeft}
        <Text numberOfLines={1} ellipsizeMode="tail" style={{flex: 1}}>
          {title}
        </Text>
        <View style={{marginLeft: 'auto'}}>
          <Icon_Arrow_Right color={COLORS.black} />
        </View>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default SelectButton;

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#BABABA26',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  error: {
    ...TYPOGRAPHY.TAGS,
    color: COLORS.errorColor,
  },
});
