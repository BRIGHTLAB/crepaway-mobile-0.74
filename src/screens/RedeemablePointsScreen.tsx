import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../theme';

const RedeemablePointsScreen = () => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Redeemable points</Text>
      <Text style={styles.subtitle}>
        Here you can see a detailed breakdown of all the points you have earned
        and redeemed, and how many are currently available to use.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Available points</Text>
        <Text style={styles.pointsValue}>21,000 pts</Text>
        <Text style={styles.cardText}>
          Use your points on your next order or keep collecting to unlock even
          bigger rewards.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>How it works</Text>
        <Text style={styles.cardText}>
          Points are added to your account after each eligible order. You can
          redeem them at checkout on participating items and offers.
        </Text>
      </View>
    </ScrollView>
  );
};

export default RedeemablePointsScreen;

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
  pointsValue: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.primaryColor,
  },
});
