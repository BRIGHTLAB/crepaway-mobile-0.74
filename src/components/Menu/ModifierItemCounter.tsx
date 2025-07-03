import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {COLORS} from '../../theme';

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
          {count > 0 && (
            <Pressable
              onPress={() => onReset(itemId)}
              style={styles.resetButton}>
              <Text style={styles.resetText}>X</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.title}>
          {title} {price ? `$${price}` : ''}
        </Text>
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
    gap: 8,
  },
  checkbox: {
    position: 'relative',
    width: 24,
    height: 24,
    borderWidth: 2,
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
  title: {
    fontSize: 16,
  },
  resetButton: {
    position: 'absolute',
    top: -8,
    left: -11,
    width: 16,
    height: 16,
    backgroundColor: 'black',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
