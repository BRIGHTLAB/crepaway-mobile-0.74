import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken
} from 'react-native';
import Icon_Arrow_Right from '../../../assets/SVG/Icon_Arrow_Right';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../../theme';
import { normalizeFont } from '../../utils/normalizeFonts';

type RewardItem = {
  id: number;
  title: string;
  points: number;
  badge?: string;
};

const rewards: RewardItem[] = [
  { id: 1, title: 'Itunes', points: 300, badge: '$10' },
  { id: 2, title: 'Spotify', points: 450, badge: '$15' },
  { id: 3, title: 'Amazon', points: 600, badge: '$20' },
  { id: 4, title: 'Play Store', points: 750, badge: '$25' },
];

const RedeemPointsComponent: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (viewableItems && viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 60,
  });

  const renderItem: ListRenderItem<RewardItem> = ({ item }) => (
    <View style={styles.rewardCard}>
      <View style={styles.imagePlaceholder}>

      </View>
      <Text style={styles.rewardTitle}>{item.title}</Text>
      <Text style={styles.rewardPoints}>{item.points} pts</Text>

      <TouchableOpacity activeOpacity={0.9} style={styles.redeemButton}>
        <Text style={styles.redeemButtonText}>Redeem points</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{
        backgroundColor: COLORS.white,
        width: SCREEN_WIDTH - 24,
        height: 261,
        borderRadius: 5,
        position: 'absolute',
        top: -20,
        left: 12,
        right: 12,
        bottom: 0,
      }} />
      <View style={styles.headerRow}>
        <Text style={styles.title}>Redeeming points</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('RedeemablePoints')}
        >
          <Text style={styles.viewAllText}>View all</Text>
          <Icon_Arrow_Right
            width={16}
            height={16}
            color={COLORS.darkColor}
            style={{ marginBottom: 2 }}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        You can redeem your EcoPoints for the following rewards
      </Text>

      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
      />

      <View style={styles.paginationContainer}>
        {rewards.map((reward, index) => (
          <View
            key={reward.id}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default RedeemPointsComponent;

const SCREEN_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING.horizontal + 12,
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.black,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    fontSize: normalizeFont(12),
    color: COLORS.darkColor,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.darkColor,
    marginTop: 8,
    paddingHorizontal: SCREEN_PADDING.horizontal + 12,
  },
  listContentContainer: {
    paddingTop: 24,
    paddingBottom: 8,
  },
  rewardCard: {
    alignItems: 'center',
    width: SCREEN_WIDTH,
    paddingHorizontal: SCREEN_PADDING.horizontal + 12
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

  badgeText: {
    ...TYPOGRAPHY.TAGS,
    color: COLORS.white,
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
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

