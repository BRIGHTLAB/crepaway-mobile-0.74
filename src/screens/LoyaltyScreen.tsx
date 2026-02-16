import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View, ViewToken } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useSelector } from 'react-redux';
import { useGetPointsHistoryQuery, useGetTierProgressQuery, useGetTiersQuery } from '../api/loyaltyApi';
import LoyaltyProgressCard from '../components/Loyalty/LoyaltyProgressCard';
import RewardTierCard from '../components/Loyalty/RewardTierCard';
import RewardTierPopup from '../components/Loyalty/RewardTierPopup';
import TrackYourPoints from '../components/Loyalty/TrackYourPoints';
import { RootState } from '../store/store';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../theme';
import { normalizeFont } from '../utils/normalizeFonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Skeleton for the header and tier progress section
const TierProgressSkeleton = () => (
  <SkeletonPlaceholder
    backgroundColor="#3D1070"
    highlightColor="#5A1A9E">
    <SkeletonPlaceholder.Item paddingHorizontal={SCREEN_PADDING.horizontal}>
      {/* Info button */}
      <SkeletonPlaceholder.Item
        width={25}
        height={25}
        borderRadius={12.5}
        alignSelf="flex-end"
        marginBottom={8}
      />
      {/* Title */}
      <SkeletonPlaceholder.Item
        width={280}
        height={40}
        borderRadius={8}
        marginBottom={8}
      />
      <SkeletonPlaceholder.Item
        width={220}
        height={40}
        borderRadius={8}
        marginBottom={16}
      />
      {/* Progress card skeleton */}
      <SkeletonPlaceholder.Item
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginTop={10}>
        <SkeletonPlaceholder.Item gap={8} flex={1}>
          <SkeletonPlaceholder.Item width={100} height={20} borderRadius={4} />
          <SkeletonPlaceholder.Item width={'100%'} height={12} borderRadius={4} />
          <SkeletonPlaceholder.Item width={200} height={14} borderRadius={4} />
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item alignItems="center" gap={4}>
          <SkeletonPlaceholder.Item width={50} height={28} borderRadius={4} />
          <SkeletonPlaceholder.Item width={40} height={16} borderRadius={4} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder.Item>
  </SkeletonPlaceholder>
);

// Skeleton for reward tier cards
const RewardTiersSkeleton = () => (
  <SkeletonPlaceholder
    backgroundColor="#5A1A9E"
    highlightColor="#7B2BC7">
    <SkeletonPlaceholder.Item>
      {/* Title and description */}
      <SkeletonPlaceholder.Item alignItems="center" gap={12} paddingHorizontal={SCREEN_PADDING.horizontal}>
        <SkeletonPlaceholder.Item width={150} height={30} borderRadius={8} />
        <SkeletonPlaceholder.Item width={300} height={16} borderRadius={4} />
        <SkeletonPlaceholder.Item width={280} height={16} borderRadius={4} />
      </SkeletonPlaceholder.Item>
      {/* Cards row */}
      <SkeletonPlaceholder.Item
        flexDirection="row"
        gap={20}
        marginTop={22}
        paddingHorizontal={SCREEN_PADDING.horizontal}>
        <SkeletonPlaceholder.Item
          width={337}
          height={150}
          borderRadius={5}
        />
        <SkeletonPlaceholder.Item
          width={337}
          height={150}
          borderRadius={5}
        />
      </SkeletonPlaceholder.Item>
      {/* Pagination dots */}
      <SkeletonPlaceholder.Item
        flexDirection="row"
        justifyContent="center"
        gap={6}
        marginTop={18}>
        <SkeletonPlaceholder.Item width={10} height={10} borderRadius={5} />
        <SkeletonPlaceholder.Item width={6} height={6} borderRadius={3} />
        <SkeletonPlaceholder.Item width={6} height={6} borderRadius={3} />
        <SkeletonPlaceholder.Item width={6} height={6} borderRadius={3} />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder.Item>
  </SkeletonPlaceholder>
);

// Skeleton for Track Your Points section
const TrackYourPointsSkeleton = () => (
  <SkeletonPlaceholder
    backgroundColor="#5A1A9E"
    highlightColor="#7B2BC7">
    <SkeletonPlaceholder.Item paddingHorizontal={SCREEN_PADDING.horizontal} paddingTop={80} gap={22}>
      {/* Title */}
      <SkeletonPlaceholder.Item width={180} height={28} borderRadius={8} alignSelf="center" />
      {/* Segmented control */}
      <SkeletonPlaceholder.Item
        width={'100%'}
        height={44}
        borderRadius={8}
      />
      {/* Two list cards */}
      <SkeletonPlaceholder.Item flexDirection="row" gap={8}>
        <SkeletonPlaceholder.Item flex={1} height={200} borderRadius={5} />
        <SkeletonPlaceholder.Item flex={1} height={200} borderRadius={5} />
      </SkeletonPlaceholder.Item>
      {/* Overall summary */}
      <SkeletonPlaceholder.Item width={'100%'} height={48} borderRadius={5} />
    </SkeletonPlaceholder.Item>
  </SkeletonPlaceholder>
);

const LoyaltyScreen = () => {
  const navigation = useNavigation<any>();
  const { data: rewardTiers = [], isLoading, error } = useGetTiersQuery();
  const state = useSelector((state: RootState) => state.user);

  // Fetch tier progress data for orders
  const { data: tierProgress, isLoading: isTierProgressLoading } = useGetTierProgressQuery({}, { skip: !state.id || !state.isLoggedIn });

  // Fetch points history for track your points section
  const { data: pointsHistory, isLoading: isPointsHistoryLoading } = useGetPointsHistoryQuery(
    { unitKey: 'points' },
    { skip: !state.id || !state.isLoggedIn }
  );

  const [selectedTier, setSelectedTier] = useState<LoyaltyTier | null>(null);
  const [activeTierIndex, setActiveTierIndex] = useState(0);

  const scrollY = useSharedValue(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (viewableItems && viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveTierIndex(viewableItems[0].index);
      }
    },
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 60,
  });
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  console.log('rewardTiers', rewardTiers);

  return (
    <Animated.ScrollView
      showsVerticalScrollIndicator={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      contentContainerStyle={styles.container}>
      <View style={styles.contentWrapper}>
        {isTierProgressLoading ? (
          <TierProgressSkeleton />
        ) : (
          <>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.infoButton}
                activeOpacity={0.8}
                onPress={() => {
                  navigation.navigate('LoyaltyInfo')
                }}
              >
                <Text style={styles.infoButtonText}>i</Text>
              </TouchableOpacity>
              <Text style={styles.title}>
                {tierProgress?.current_tier
                  ? `${state.name || 'Hey'}, you're at the ${tierProgress.current_tier.name} Tier`
                  : 'Welcome to Rewards'}
              </Text>
            </View>
            {tierProgress?.current_tier && (
              <LoyaltyProgressCard
                tierName={tierProgress.current_tier.name}
                totalDashes={
                  tierProgress.is_max_tier
                    ? Math.round(tierProgress.current_tier.threshold)
                    : tierProgress.next_tier
                      ? Math.round(tierProgress.next_tier.threshold - tierProgress.current_tier.threshold)
                      : 10
                }
                filledDashes={
                  tierProgress.is_max_tier
                    ? Math.round(tierProgress.current_balance)
                    : Math.round(tierProgress.current_balance - tierProgress.current_tier.threshold)
                }
                progressColor={tierProgress.current_tier.extras?.color || '#FFD700'}
                description={
                  tierProgress.is_max_tier
                    ? `You've reached the highest tier!`
                    : `Complete ${tierProgress.remaining_to_next_tier.toFixed(0)} more orders to reach ${tierProgress.next_tier?.name}`
                }
                pointsCount={tierProgress.current_balance >= 1000 ? `${(tierProgress.current_balance / 1000).toFixed(1)}K` : tierProgress.current_balance.toFixed(0)}
                pointsUnit={tierProgress.unit?.name || 'Orders'}
                hideBackground
                disabled
              />
            )}
          </>
        )}
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
        {isLoading ? (
          <RewardTiersSkeleton />
        ) : (
          <>
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
            {rewardTiers.length > 0 && (
              <>
                <FlatList
                  data={rewardTiers}
                  renderItem={({ item }) => (
                    <RewardTierCard
                      scrollY={scrollY}
                      tierName={item.name}
                      earnedPoints={item.extras?.earned_points ?? 0}
                      orders={item.extras?.orders ?? 0}
                      color={item.extras?.color ?? '#FFD700'}
                      onPress={() => {
                        setSelectedTier(item);
                      }}
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
                  onViewableItemsChanged={onViewableItemsChanged.current}
                  viewabilityConfig={viewabilityConfig.current}
                />

                {/* Pagination dots */}
                <View style={styles.paginationContainer}>
                  {rewardTiers.map((tier, index) => (
                    <View
                      key={tier.id}
                      style={[
                        styles.paginationDot,
                        index === activeTierIndex && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {/*  Track your points  */}
        {isPointsHistoryLoading ? (
          <TrackYourPointsSkeleton />
        ) : (
          <TrackYourPoints
            pointsData={pointsHistory?.transactions ?? []}
            overallPoints={pointsHistory?.overall_balance
              ? pointsHistory.overall_balance >= 1000
                ? `${(pointsHistory.overall_balance / 1000).toFixed(1)}k`
                : `${pointsHistory.overall_balance}`
              : '0'
            }
          />
        )}

        {/* Redeem your points */}
        {/* <View
          style={{
            marginTop: 80,
            paddingBottom: 50,
          }}>
          <RedeemPointsComponent />
        </View> */}

      </View>

      {/* Reward Tier Popup */}
      {selectedTier && (
        <RewardTierPopup
          visible={!!selectedTier}
          onClose={() => {
            setSelectedTier(null);
          }}
          tierName={selectedTier.name}
          earnedPoints={selectedTier.extras?.earned_points ?? 0}
          orders={selectedTier.extras?.orders ?? 0}
          pointsRedemption={selectedTier.extras?.points_redemption ?? ''}
          benefits={selectedTier.extras?.benefits ?? []}
          color={selectedTier.extras?.color ?? '#FFD700'}
        />
      )}
    </Animated.ScrollView>
  );
};

export default LoyaltyScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.secondaryColor,
    paddingBottom: SCREEN_PADDING.vertical + 20,
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.borderColor,
  },
  paginationDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primaryColor,
  },
});
