import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../theme';

const LoyaltyInfoScreen = () => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>About the loyalty program</Text>
      <Text style={styles.subtitle}>
        Earn points every time you order from Crepaway. Climb tiers to unlock
        exclusive perks, special offers and more.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>How to earn points</Text>
        <Text style={styles.cardText}>
          Points are collected on every eligible order. The more you order over
          a 90-day period, the higher your tier and the more rewards you unlock.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tiers</Text>
        <Text style={styles.cardText}>
          Bronze, Silver, Gold and Platinum tiers are based on your total
          orders or visits. Each tier comes with its own set of benefits and
          rewards.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Redeeming points</Text>
        <Text style={styles.cardText}>
          You can redeem points at checkout on selected items or promotions.
          Your available balance and history are always visible in the loyalty
          section.
        </Text>
      </View>
    </ScrollView>
  );
};

export default LoyaltyInfoScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: SCREEN_PADDING.vertical,
    backgroundColor: COLORS.secondaryColor,
    gap: 24,
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.white,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.foregroundColor,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.darkColor,
    fontFamily: 'Poppins-Medium',
  },
  cardText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.darkColor,
    opacity: 0.8,
  },
});
