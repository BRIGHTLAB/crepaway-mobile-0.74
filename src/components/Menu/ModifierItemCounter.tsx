import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme';

interface ModifierItemCounterProps {
  itemId: number;
  count: number;
  maxCount: number;
  onIncrement: (itemId: number) => void;
  onReset: (itemId: number) => void;
  title: string;
  price?: number;
}

const ModifierItemCounter: React.FC<ModifierItemCounterProps> = ({
  itemId,
  count,
  maxCount,
  onIncrement,
  onReset,
  title,
  price,
}) => {
  const handlePress = () => {
    if (count < maxCount) {
      onIncrement(itemId);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress} style={styles.pressable}>
        <View style={[styles.checkbox, count > 0 && styles.checked]}>
          <Text style={styles.count}>{count > 0 ? count : ''}</Text>
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {title} {price ? `$${price}` : ''}
            </Text>
          </View>
          {count > 0 && (
            <Pressable onPress={() => onReset(itemId)}>
              <Text style={styles.removeText}>remove</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    </View>
  );
};

export default ModifierItemCounter;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: COLORS.darkColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginRight: 8,
  },
  checked: {
    backgroundColor: COLORS.primaryColor,
    borderColor: COLORS.primaryColor,
  },
  count: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  titleContainer: {
    flexShrink: 1,
  },
  title: {
    fontSize: 16,
  },
  removeText: {
    fontSize: 16,
    color: COLORS.primaryColor,
  },
});
