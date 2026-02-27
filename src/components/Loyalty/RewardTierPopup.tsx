import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon_Checkmark from '../../../assets/SVG/Icon_Checkmark';
import Icon_Handbag from '../../../assets/SVG/Icon_Handbag';
import Icon_Spine from '../../../assets/SVG/Icon_Spine';
import Icon_Wavy from '../../../assets/SVG/Icon_Wavy';
import Icon_Wishlist from '../../../assets/SVG/Icon_Wishlist';
import { COLORS, TYPOGRAPHY } from '../../theme';
import { normalizeFont } from '../../utils/normalizeFonts';
import DynamicPopup from '../UI/DynamicPopup';
import RewardTierLabelValue from './RewardTierLabelValue';

interface RewardTierPopupProps {
  visible: boolean;
  onClose: () => void;
  tierName: string;
  earnedPoints?: number | string;
  orders: number | string;
  pointsRedemption: string;
  benefits: string[];
  color: string;
}

const RewardTierPopup: React.FC<RewardTierPopupProps> = ({
  visible,
  onClose,
  tierName,
  earnedPoints,
  orders,
  pointsRedemption,
  benefits,
  color,
}) => {
  // Format orders - display as provided (could be number or string with range)
  const ordersDisplay = typeof orders === 'number'
    ? orders.toString()
    : orders;

  return (
    <DynamicPopup
      visible={visible}
      onClose={onClose}
      closeOnBackdropPress={true}
      style={{ backgroundColor: '#f4f4f4', overflow: 'hidden' }}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.tierName, { color }]}>{tierName}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {earnedPoints != null && (
            <RewardTierLabelValue
              label="Earned points"
              value={typeof earnedPoints === 'number' ? earnedPoints.toString() : earnedPoints}
              icon={<Icon_Wavy color={color} />}
            />
          )}
          <RewardTierLabelValue
            label="Orders"
            value={ordersDisplay}
            icon={<Icon_Handbag color={color} />}
          />
          <RewardTierLabelValue
            label="Benefits"
            value={benefits}
            icon={<Icon_Wishlist width={20} height={20} color={color} />}
          />
          <RewardTierLabelValue
            label="Points redemption"
            value={pointsRedemption}
            icon={<Icon_Checkmark color={color} />}
          />

          <Icon_Spine width={400} height={400} color="#EAEAEA" style={{ position: 'absolute', top: -150, right: -270, zIndex: -1 }} />
          <Icon_Spine width={300} height={300} color="#EAEAEA" style={{ position: 'absolute', top: -100, right: -250, zIndex: -1 }} />
        </View>
      </View>
    </DynamicPopup>
  );
};

export default RewardTierPopup;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 24,
  },
  tierName: {
    ...TYPOGRAPHY.LARGE_TITLE,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: normalizeFont(16),
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    lineHeight: 18,
  },
  content: {
    width: '100%',
    gap: 20,
  },
});






