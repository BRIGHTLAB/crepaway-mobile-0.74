import React from 'react';
import { StyleSheet, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { COLORS } from '../../theme';

const AddressSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index} style={styles.itemContainer}>
          <SkeletonPlaceholder>
            <>
              <View style={styles.itemHeader}>
                {/* Location icon placeholder */}
                <View style={styles.iconPlaceholder} />
                {/* Title placeholder */}
                <View style={styles.titlePlaceholder} />
                {/* Action buttons placeholder */}
                <View style={styles.actionsPlaceholder}>
                  <View style={styles.iconPlaceholder} />
                  <View style={styles.iconPlaceholder} />
                </View>
              </View>
              {/* Address description placeholder */}
              <View style={styles.descriptionPlaceholder} />
            </>
          </SkeletonPlaceholder>
        </View>
      ))}
    </View>
  );
};

export default AddressSkeleton;

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  itemContainer: {
    gap: 8,
    padding: 18,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  itemHeader: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  titlePlaceholder: {
    marginLeft: 12,
    width: 100,
    height: 20,
    borderRadius: 4,
    flex: 1,
  },
  actionsPlaceholder: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 8,
  },
  descriptionPlaceholder: {
    width: '80%',
    height: 15,
    borderRadius: 4,
    marginTop: 8,
    marginLeft: 32,
  },
});
