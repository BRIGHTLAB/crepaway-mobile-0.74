import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {COLORS} from '../../theme';

interface RadioButtonProps {
  checked: boolean;
  onPress: () => void;
  title?: string;
  description?: string;
}

const RadioButton = ({
  checked,
  onPress,
  title,
  description,
}: RadioButtonProps) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={[styles.radioCircle, checked && styles.checkedRadio]}>
        {checked && <View style={styles.checkedInnerCircle} />}
      </View>
      {(title || description) && (
        <View style={styles.textContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  checkedRadio: {
    borderColor: COLORS.primaryColor,
  },
  checkedInnerCircle: {
    width: 14,
    height: 14,
    borderRadius: 50,
    backgroundColor: 'red',
  },
  textContainer: {
    marginLeft: 12,
  },
  title: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.darkColor,
  },
  description: {
    fontSize: 12,
    color: COLORS.foregroundColor,
  },
});

export default RadioButton;
