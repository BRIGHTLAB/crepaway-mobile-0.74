import React, { useState } from 'react';
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SegmentedControl, { TabType } from '../components/UI/SegmentedControl';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../theme';

type TabValue = 'all' | 'redeemed';

type RewardItem = {
  id: number;
  title: string;
  points: number;
};

const TABS: TabType[] = [
  { label: 'All', value: 'all' },
  { label: 'Redeemed', value: 'redeemed' },
];

const REWARDS: RewardItem[] = [
  { id: 1, title: 'Itunes', points: 300 },
  { id: 2, title: 'Spotify', points: 450 },
  { id: 3, title: 'Amazon', points: 600 },
  { id: 4, title: 'Play Store', points: 750 },
];

const RedeemablePointsScreen = () => {
  const [selectedTab, setSelectedTab] = useState<TabType>(TABS[0]);

  const renderRewardItem = ({ item }: { item: RewardItem }) => (
    <View style={styles.rewardCard}>
      <View style={styles.imagePlaceholder} />
      <Text style={styles.rewardTitle}>{item.title}</Text>
      <Text style={styles.rewardPoints}>{item.points} pts</Text>
      <TouchableOpacity activeOpacity={0.9} style={styles.redeemButton}>
        <Text style={styles.redeemButtonText}>Redeem points</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <View style={styles.content}>
        {/* Tabs from TrackYourPoints: only All & Redeemed */}
        <View style={styles.tabsWrapper}>
          <SegmentedControl
            tabs={TABS}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
          />
        </View>

        {/* Title & description */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Redeeming points</Text>
          <Text style={styles.subtitle}>
            You can redeem your EcoPoints for the following rewards
          </Text>
        </View>

        {/* Reward cards using only renderItem layout */}
        <FlatList
          data={REWARDS}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRewardItem}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContentContainer}
        />
      </View>
    </ScrollView>
  );
};

export default RedeemablePointsScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.secondaryColor,
  },
  gradientWrapper: {
    flex: 1,
    paddingTop: SCREEN_PADDING.vertical,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
  },
  content: {
    flex: 1,
    gap: 24,
    paddingBottom: SCREEN_PADDING.vertical + 24,
  },
  tabsWrapper: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    marginTop: 25,
    maxWidth: 300,
  },
  headerSection: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    marginTop: 10,
    gap: 8,
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.white,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.white,
    opacity: 0.9,
  },
  listContentContainer: {
    paddingTop: 24,
    paddingBottom: 8,
    gap: 70
  },
  rewardCard: {
    alignItems: 'center',
    width: Dimensions.get('window').width,
    paddingHorizontal: SCREEN_PADDING.horizontal + 12,
  },
  imagePlaceholder: {
    width: 160,
    height: 220,
    borderRadius: 12,
    backgroundColor: COLORS.accentColor,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 8,
  },
  rewardTitle: {
    ...TYPOGRAPHY.SUB_HEADLINE,
    color: COLORS.white,
    marginTop: 16,
  },
  rewardPoints: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '700',
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 4,
  },
  redeemButton: {
    marginTop: 16,
    width: '100%',
    backgroundColor: COLORS.darkColor,
    paddingVertical: 16,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redeemButtonText: {
    ...TYPOGRAPHY.CTA,
    color: COLORS.white,
  },
});
