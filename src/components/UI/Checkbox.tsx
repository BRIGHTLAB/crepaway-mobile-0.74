import { StyleSheet, Text, View, Pressable } from 'react-native';
import React from 'react';
import { COLORS } from '../../theme';

interface CheckboxProps {
  onCheck?: (isChecked: boolean) => void;
  checked: boolean;
  title?: string;
  isRadio?: boolean;
}

const Checkbox = ({
  onCheck,
  checked,
  title,
  isRadio = false,
}: CheckboxProps) => {
  const toggleCheckbox = () => {
    onCheck?.(!checked);
  };

  return (
    <Pressable onPress={toggleCheckbox} style={styles.container}>
      <View
        style={[
          styles.checkbox,
          checked && styles.checked,
          isRadio && styles.radio,
        ]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      {title && <Text style={styles.title}>{title}</Text>}
    </Pressable>
  );
};

export default Checkbox;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.darkColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  checked: {
    backgroundColor: COLORS.primaryColor,
    borderColor: COLORS.primaryColor,
  },
  radio: {
    borderRadius: 12,
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
  },
});
