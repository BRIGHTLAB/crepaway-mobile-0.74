import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon_Add from '../../assets/SVG/Icon_Add';
import Icon_Credit_Card from '../../assets/SVG/Icon_Credit_Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { COLORS, SCREEN_PADDING } from '../theme';

const DineInAddCardScreen = () => {
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleAddCard = () => {
    // TODO: Add card logic
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 100 }]}>
        
        <Text style={styles.title}>Add Card Details</Text>

        {/* Card Icon */}
        <View style={styles.cardIconContainer}>
          <Icon_Credit_Card width={120} height={80} color={COLORS.primaryColor} />
        </View>

        {/* Card Number */}
        <View style={styles.inputContainer}>
          <Input
            placeholder="Add 16 digits"
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="numeric"
            maxLength={19}
            iconLeft={
              <View style={styles.visaIcon}>
                <Text style={styles.visaText}>VISA</Text>
              </View>
            }
          />
        </View>

        {/* Cardholder Name */}
        <View style={styles.inputContainer}>
          <Input
            placeholder="Cardholder's name"
            value={cardholderName}
            onChangeText={setCardholderName}
            autoCapitalize="words"
          />
        </View>

        {/* Expiry and CVC */}
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              placeholder="Expiry"
              value={expiry}
              onChangeText={setExpiry}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              placeholder="CVC"
              value={cvc}
              onChangeText={setCvc}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>
      </ScrollView>

      {/* Add Button */}
      <View style={[styles.bottomButton, { paddingBottom: bottom + 16 }]}>
        <Button icon={<Icon_Add color="#FFF" />} onPress={handleAddCard}>
          Add
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

export default DineInAddCardScreen;

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
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: COLORS.darkColor,
    textAlign: 'center',
    marginTop: 16,
  },
  cardIconContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  visaIcon: {
    backgroundColor: '#1A1F71',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  visaText: {
    color: '#FFF',
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});
