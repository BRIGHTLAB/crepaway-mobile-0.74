import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import LoyaltyProgressCard from '../components/Loyalty/LoyaltyProgressCard';
import RedeemPointsComponent from '../components/Loyalty/RedeemPointsComponent';
import RewardTierCard from '../components/Loyalty/RewardTierCard';
import TrackYourPoints from '../components/Loyalty/TrackYourPoints';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../theme';
import { normalizeFont } from '../utils/normalizeFonts';

const LoyaltyScreen = () => {
  const navigation = useNavigation<any>();
  const rewardTiers = [
    { id: 1, tierName: 'Bronze', earnedPoints: 500, orders: 100, color: '#CD9302' },
    { id: 2, tierName: 'Silver', earnedPoints: 1000, orders: 200, color: '#C0C0C0' },
    { id: 3, tierName: 'Gold', earnedPoints: 2500, orders: 500, color: '#FFD700' },
    { id: 4, tierName: 'Platinum', earnedPoints: 5000, orders: 1000, color: '#E5E4E2' },
  ];

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <Animated.ScrollView
      showsVerticalScrollIndicator={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      contentContainerStyle={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.infoButton}
            activeOpacity={0.8}
            onPress={() => {
              navigation.navigate('LoyaltyInfo')
              console.log('weiaewaekwoewakoewakoewakoewkoekoako')
            }}
          >
            <Text style={styles.infoButtonText}>i</Text>
          </TouchableOpacity>
          <Text style={styles.title}>John, you're at the Bronze Tier</Text>
        </View>
        <LoyaltyProgressCard
          tierName="Bronze"
          totalDashes={10}
          filledDashes={5}
          progressColor="#FFD700"
          description="Complete 9 more orders this month maintain Bronze in November"
          pointsCount="372K"
          pointsUnit="Pts"
          hideBackground
          disabled
        />
      </View>

      {/* Reward tiers */}
      <View style={styles.rewardTiersContainer}>

        <LinearGradient
          colors={['#3F0F6C', '#4C1482']}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: 300,
          }}
        />
        <View style={{
          gap: 20,
          paddingHorizontal: SCREEN_PADDING.horizontal,

        }}>
          <Text style={styles.rewardTiersTitle}>Reward tiers</Text>
          <Text style={{
            ...TYPOGRAPHY.BODY,
            color: COLORS.white,
            textAlign: 'center',
          }}>Our program includes four tiers based on the total number of orders or visits within a  90-day period</Text>

        </View>
        {/* Reward tiers list */}
        <FlatList
          data={rewardTiers}
          renderItem={({ item }) => (
            <RewardTierCard
              scrollY={scrollY}
              tierName={item.tierName}
              earnedPoints={item.earnedPoints}
              orders={item.orders}
              color={item.color}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          style={{
            marginTop: 22
          }}
          contentContainerStyle={{
            gap: 20,
            paddingHorizontal: SCREEN_PADDING.horizontal,
          }}
        />

        {/*  Track your points  */}
        <TrackYourPoints
          pointsData={[
            { id: 1, date: '23 08 2024', amount: '200$', points: 400 },
            { id: 2, date: '18 07 2024', amount: '30$', points: 300 },
            { id: 3, date: '24 06 2024', amount: '10$', points: 170 },
            { id: 4, date: '14 05 2024', amount: '140$', points: 800 },
            { id: 5, date: '12 04 2024', amount: '160$', points: 400 },
          ]}
          overallAmount="1000$"
          overallPoints="21k"
        />

        {/* Redeem your points */}
        <View
          style={{
            marginTop: 80,
            paddingBottom: 50,
          }}>
          <RedeemPointsComponent />
        </View>

      </View>
    </Animated.ScrollView>
  );
};

export default LoyaltyScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.secondaryColor,
    paddingBottom: SCREEN_PADDING.vertical,
    gap: 45,
  },
  contentWrapper: {
    marginTop: 25,
    gap: 10,
  },
  headerContainer: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  infoButton: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: COLORS.primaryColor,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    // top: 15,
  },
  infoButtonText: {
    fontFamily: 'Poppins-Medium',
    color: COLORS.white,
    fontSize: normalizeFont(18),
  },
  title: {
    color: COLORS.white,
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
    fontSize: normalizeFont(32),
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.foregroundColor,
  },
  rewardTiersContainer: {
    paddingTop: 21,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  rewardTiersTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: normalizeFont(24),
    textAlign: 'center',
    color: COLORS.white,
  },
});
