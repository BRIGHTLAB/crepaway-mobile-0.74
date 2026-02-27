import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../theme';
import Icon_Add from '../../../assets/SVG/Icon_Add';
import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

interface IProps {
  subtotal: string;
  deliveryCharge?: string | null;
  pointsRewarded: string;
  promoApplied?: boolean;
  promoCode?: string;
  onAddPromoCode?: () => void;
  total: string;
  totalUSD?: string;
  discount?: string;
  tips?: {
    value: number;
    onPress: () => void;
  };
  isLoading?: boolean;
  disabled?: boolean;
  orderType?: string;
  canEdit?: boolean;
}

const TotalSection = ({
  subtotal,
  deliveryCharge,
  pointsRewarded,
  promoApplied,
  promoCode,
  onAddPromoCode,
  total,
  totalUSD,
  discount,
  tips,
  isLoading = false,
  orderType,
  canEdit = false,
}: IProps) => {
  const renderSkeleton = () => (
    <SkeletonPlaceholder>
      <View style={{ width: 80, height: 16, borderRadius: 4 }} />
    </SkeletonPlaceholder>
  );

  return (
    <View style={styles.container}>
      {/* Sub total  */}
      <View style={styles.subTotalContainer}>
        <Text style={styles.subTotalTitle}>SubTotal</Text>
        {isLoading ? (
          renderSkeleton()
        ) : (
          <Text style={styles.subTotalValue}>{subtotal}</Text>
        )}
      </View>

      {/* Delivery Charge  */}
      {deliveryCharge && orderType === 'delivery' && (
        <View style={styles.subTotalContainer}>
          <Text style={styles.subTotalTitle}>Delivery Charge</Text>
          {isLoading ? (
            renderSkeleton()
          ) : (
            <Text style={styles.subTotalValue}>{deliveryCharge}</Text>
          )}
        </View>
      )}

      {/* Points rewarded  */}
      <View style={styles.subTotalContainer}>
        <Text style={styles.subTotalTitle}>Points Rewarded</Text>
        {isLoading ? (
          renderSkeleton()
        ) : (
          <Text style={[styles.subTotalValue, { color: COLORS.secondaryColor }]}>
            {pointsRewarded}
          </Text>
        )}
      </View>

      {/* Tips */}
      {tips && (
        <View style={styles.subTotalContainer}>
          <Text style={styles.subTotalTitle}>Add Tips</Text>
          <TouchableOpacity style={styles.tipsButton} onPress={tips.onPress}>
            <Text style={styles.tipsButtonText}>% {tips.value}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Discount */}
      {discount && (
        <View style={styles.subTotalContainer}>
          <Text style={styles.subTotalTitle}>Discount</Text>
          <Text style={[styles.subTotalValue, { color: COLORS.secondaryColor }]}>
            - {discount}
          </Text>
        </View>
      )}

      {/* Total  */}
      <View style={[styles.totalContainer]}>
        <Text style={styles.totalTitle}>Total</Text>
        {isLoading ? (
          renderSkeleton()
        ) : (
          <Text style={styles.totalTitle}>{total}</Text>
        )}
      </View>

      {/* Total USD */}
      {totalUSD && (
        <View style={styles.subTotalContainer}>
          <Text style={styles.subTotalTitle}>Total (USD)</Text>
          {isLoading ? (
            renderSkeleton()
          ) : (
            <Text style={styles.totalTitle}>{totalUSD}</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default TotalSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  subTotalContainer: {
    borderBottomWidth: 2,
    borderBottomColor: `${COLORS.foregroundColor}10`,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subTotalTitle: {
    color: COLORS.darkColor,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  subTotalValue: {
    color: COLORS.foregroundColor,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  totalContainer: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.darkColor,
  },
  tipsButton: {
    borderWidth: 1,
    borderColor: COLORS.foregroundColor,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  tipsButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.foregroundColor,
  },
});
