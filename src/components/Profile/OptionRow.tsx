import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Icon_Arrow_Right from '../../../assets/SVG/Icon_Arrow_Right';
import {COLORS, TYPOGRAPHY} from '../../theme';
import {TouchableOpacity} from '@gorhom/bottom-sheet';

type Props = {
  icon?: React.ReactElement;
  text: string;
  onPress: () => void;
  disabled?: boolean;
};

const OptionRow = ({icon, text, disabled = false, onPress}: Props) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabledContainer]}
      onPress={onPress}
      disabled={disabled}>
      {icon && (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            opacity: disabled ? 0.6 : 1,
          }}>
          {icon}
        </View>
      )}
      <Text
        style={[
          {
            ...TYPOGRAPHY.BODY,
            color: COLORS.darkColor,
          },
          disabled && styles.disabledText,
        ]}>
        {text}
      </Text>
      <Icon_Arrow_Right
        color={COLORS.black}
        style={{marginLeft: 'auto', opacity: disabled ? 0.6 : 1}}
      />
    </TouchableOpacity>
  );
};

export default OptionRow;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    alignItems: 'center',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
});
