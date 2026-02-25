import React from 'react';
import { StyleSheet, View } from 'react-native';

interface DashedProgressBarProps {
  totalDashes: number;
  filledDashes: number;
  color: string;
}

const DashedProgressBar: React.FC<DashedProgressBarProps> = ({
  totalDashes,
  filledDashes,
  color,
}) => {
  // Ensure filledDashes doesn't exceed totalDashes
  const safeFilledDashes = Math.min(filledDashes, totalDashes);
  // Ensure filledDashes is not negative
  const validFilledDashes = Math.max(0, safeFilledDashes);

  return (
    <View style={styles.container}>
      {Array.from({ length: totalDashes }).map((_, index) => {
        const isFilled = index < validFilledDashes;
        return (
          <View
            key={index}
            style={[
              styles.dash,
              isFilled ? { backgroundColor: color } : styles.unfilledDash,
            ]}
          />
        );
      })}
    </View>
  );
};

export default DashedProgressBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dash: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  unfilledDash: {
    backgroundColor: '#bdbdbd',
  },
});
