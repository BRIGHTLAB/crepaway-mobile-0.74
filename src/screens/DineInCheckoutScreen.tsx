import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon_Arrow_Right from '../../assets/SVG/Icon_Arrow_Right';
import Icon_Checkout from '../../assets/SVG/Icon_Checkout';
import TotalSection from '../components/Menu/TotalSection';
import Button from '../components/UI/Button';
import RadioButton from '../components/UI/RadioButton';
import { DineInStackParamList } from '../navigation/DineInStack';
import { COLORS, SCREEN_PADDING } from '../theme';

type NavigationProp = NativeStackNavigationProp<DineInStackParamList>;

// Collapsible Section Component
const CollapsibleSection = ({
  title,
  children,
  defaultExpanded = false,
  rightElement,
}: {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  rightElement?: React.ReactNode;
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {rightElement}
          <View style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}>
            <Icon_Arrow_Right color={COLORS.foregroundColor} />
          </View>
        </View>
      </TouchableOpacity>
      {expanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

// Mock ordered item component for display
const OrderedItemRow = ({
  name,
  description,
  price,
  quantity,
  imageUrl,
}: {
  name: string;
  description: string;
  price: string;
  quantity: number;
  imageUrl?: string;
}) => (
  <View style={styles.itemRow}>
    <FastImage
      source={{ uri: imageUrl || 'https://placehold.co/80x80/png' }}
      style={styles.itemImage}
      resizeMode={FastImage.resizeMode.cover}
    />
    <View style={styles.itemInfo}>
      <Text style={styles.itemName} numberOfLines={1}>{name}</Text>
      <Text style={styles.itemDescription} numberOfLines={1}>{description}</Text>
      <Text style={styles.itemPrice}>{price}</Text>
      <Text style={styles.itemCustomization}>Customization if any</Text>
    </View>
    <View style={styles.quantityBadge}>
      <Text style={styles.quantityText}>{quantity}</Text>
    </View>
  </View>
);

const DineInCheckoutScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { bottom } = useSafeAreaInsets();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [promoCode, setPromoCode] = useState('');
  const [tipPercentage, setTipPercentage] = useState(0);

  // Mock data - will be replaced with real data from socket/state
  const mockItems = [
    { id: 1, name: 'The Truffle Maker', description: 'Grilled beef patty, melted mozz...', price: 'LBP 650,000', quantity: 1, imageUrl: '' },
    { id: 2, name: 'The Truffle Maker', description: 'Grilled beef patty, melted mozz...', price: 'LBP 650,000', quantity: 2, imageUrl: '' },
    { id: 3, name: 'The Truffle Maker', description: 'Grilled beef patty, melted mozz...', price: 'LBP 650,000', quantity: 1, imageUrl: '' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 120 }]}>
        
        {/* Ordered Items Section */}
        <CollapsibleSection title="Ordered Items" defaultExpanded={true}>
          {mockItems.map((item) => (
            <OrderedItemRow
              key={item.id}
              name={item.name}
              description={item.description}
              price={item.price}
              quantity={item.quantity}
              imageUrl={item.imageUrl}
            />
          ))}
        </CollapsibleSection>

        {/* Payment Method Section */}
        <CollapsibleSection
          title="Payment Method"
          defaultExpanded={false}
          rightElement={
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('AddCard')}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          }>
          <View style={styles.paymentMethodContainer}>
            {/* Cash Option */}
            <View style={styles.paymentMethodItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <FastImage
                  source={require('../../assets/images/payment/cash.png')}
                  style={{ width: 48, height: 28 }}
                />
                <View>
                  <Text style={styles.paymentMethodText}>Cash</Text>
                  <Text style={styles.paymentMethodDescription}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.defaultBadge}>Default</Text>
                <RadioButton
                  onPress={() => setSelectedPaymentMethod('cash')}
                  checked={selectedPaymentMethod === 'cash'}
                />
              </View>
            </View>

            {/* Card Option - Placeholder */}
            <View style={styles.paymentMethodItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.visaIcon}>
                  <Text style={styles.visaText}>VISA</Text>
                </View>
                <View>
                  <Text style={styles.paymentMethodText}>****6944</Text>
                  <Text style={styles.paymentMethodDescription}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                  </Text>
                </View>
              </View>
              <RadioButton
                onPress={() => setSelectedPaymentMethod('card')}
                checked={selectedPaymentMethod === 'card'}
              />
            </View>
          </View>
        </CollapsibleSection>

        {/* Totals Section - Reusing TotalSection component */}
        <TotalSection
          subtotal="LBP 1,950,000"
          pointsRewarded="+ 100K pts"
          tips={{
            value: tipPercentage,
            onPress: () => {
              // TODO: Open tips selection modal
            },
          }}
          promoCode={promoCode}
          onPromoCodeChange={setPromoCode}
          total="LBP 2,000,000"
          totalUSD="USD 20.00"
          canEdit={true}
        />
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={[styles.bottomButtons, { paddingBottom: bottom + 16 }]}>
        <Button icon={<Icon_Checkout />} onPress={() => {}}>
          Checkout
        </Button>
        <Button
          variant="primary"
          onPress={() => {}}
          icon={
            <FastImage
              source={require('../../assets/images/payment/cash.png')}
              style={{ width: 24, height: 16 }}
              tintColor="#FFF"
            />
          }>
          Split The Bill
        </Button>
      </View>
    </View>
  );
};

export default DineInCheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightColor,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SCREEN_PADDING.horizontal,
    gap: 16,
  },
  sectionContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.darkColor,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  addButton: {
    borderWidth: 1,
    borderColor: COLORS.foregroundColor,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  addButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.foregroundColor,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.foregroundColor}20`,
    gap: 10,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.darkColor,
  },
  itemDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: COLORS.foregroundColor,
  },
  itemPrice: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.secondaryColor,
  },
  itemCustomization: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: COLORS.foregroundColor,
  },
  quantityBadge: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 36,
    alignItems: 'center',
  },
  quantityText: {
    color: '#FFF',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  paymentMethodContainer: {
    gap: 12,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.foregroundColor}20`,
  },
  paymentMethodText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.darkColor,
  },
  paymentMethodDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: COLORS.foregroundColor,
    maxWidth: 200,
  },
  defaultBadge: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: COLORS.foregroundColor,
  },
  visaIcon: {
    width: 48,
    height: 28,
    backgroundColor: '#1A1F71',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visaText: {
    color: '#FFF',
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});
