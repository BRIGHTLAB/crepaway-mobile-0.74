import { StyleSheet, Text, View } from 'react-native';
import Input from '../UI/Input';
import { COLORS } from '../../theme';
import Icon_Promo from '../../../assets/SVG/Icon_Promo';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

interface IProps {
  subtotal: string;
  deliveryCharge?: string | null;
  pointsRewarded: string;
  promoCode?: string;
  promoCodeError?: string | null;
  onPromoCodeChange?: (code: string) => void;
  total: string;
  discount?: string;
  isLoading?: boolean;
  disabled?: boolean;
  orderType?: string;
  canEdit?: boolean;
}

const TotalSection = ({
  subtotal,
  deliveryCharge,
  pointsRewarded,
  promoCode,
  promoCodeError,
  onPromoCodeChange,
  total,
  discount,
  isLoading = false,
  disabled = false,
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

      {/* Discount */}
      {discount && (
        <View style={styles.subTotalContainer}>
          <Text style={styles.subTotalTitle}>Discount</Text>
          <Text style={[styles.subTotalValue, { color: COLORS.secondaryColor }]}>
            - {discount}
          </Text>
        </View>
      )}

      {/* Promo Code  */}
      {(canEdit || (promoCode && disabled)) && (
        <View style={styles.subTotalContainer}>
          <Text style={styles.subTotalTitle}>Promo Code</Text>
          <View style={{ width: 150 }}>
            <Input
              iconLeft={<Icon_Promo />}
              placeholder="Enter code"
              value={promoCode}
              onChangeText={onPromoCodeChange}
              disabled={disabled}
            />
            {promoCodeError && (
              <Text style={styles.errorText}>{promoCodeError}</Text>
            )}
          </View>
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
    // borderBottomWidth: 2,
    // borderBottomColor: `${COLORS.foregroundColor}10`,
  },
  totalTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.darkColor,
  },
  errorText: {
    color: 'red',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'right',
  },
});
