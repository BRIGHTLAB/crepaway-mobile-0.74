import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon_Spine from '../../../assets/SVG/Icon_Spine';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../../theme';
import SegmentedControl, { TabType } from '../UI/SegmentedControl';

interface PointsData {
  id: number;
  date: string;
  amount: string;
  points: number;
}

interface TrackYourPointsProps {
  pointsData: PointsData[];
  overallAmount: string;
  overallPoints: string;
}

const TrackYourPoints: React.FC<TrackYourPointsProps> = ({
  pointsData,
  overallAmount,
  overallPoints,
}) => {
  const tabs: TabType[] = [
    { label: 'Earned', value: 'earned' },
    { label: 'Redeemed', value: 'redeemed' },
    { label: 'All', value: 'all' },
  ];

  const [selectedTab, setSelectedTab] = useState<TabType>(tabs[0]);

  return (
    <View style={styles.container}>
      <Icon_Spine width={400} height={400} color="#34115599" style={{ position: 'absolute', top: 30, left: '50%', transform: [{ translateX: -180 }] }} />
      <Icon_Spine width={300} height={300} color="#34115599" style={{ position: 'absolute', top: 100, left: '50%', transform: [{ translateX: -130 }] }} />
      <Text style={styles.title}>Track your points</Text>

      {/* Segmented Control */}
      <SegmentedControl
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      {/* Three Lists Container */}
      <View style={styles.listsContainer}>
        {/* Date List */}
        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>Date</Text>
          </View>
          <View style={styles.listContent}>
            {pointsData.map((item) => (
              <Text key={item.id} style={styles.listItemText}>
                {item.date}
              </Text>
            ))}
          </View>
        </View>

        {/* Amount List */}
        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>Amount</Text>
          </View>
          <View style={styles.listContent}>
            {pointsData.map((item) => (
              <Text key={item.id} style={styles.listItemText}>
                {item.amount}
              </Text>
            ))}
          </View>
        </View>

        {/* Points List */}
        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>Points</Text>
          </View>
          <View style={styles.listContent}>
            {pointsData.map((item) => (
              <Text key={item.id} style={styles.listItemText}>
                {item.points}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Overall Summary */}
      <View style={styles.overallSummary}>
        <Text style={styles.overallText}>Overall</Text>
        <Text style={{ ...TYPOGRAPHY.BODY, color: COLORS.white, opacity: 0.8 }}>{overallAmount}</Text>
        <Text style={{ ...TYPOGRAPHY.BODY, color: COLORS.white, opacity: 0.8 }}>{overallPoints}</Text>
      </View>
    </View>
  );
};

export default TrackYourPoints;

const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    gap: 22,
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.white,
    textAlign: 'center',
  },
  listsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  listCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    paddingBottom: 10,
  },
  listHeader: {
    margin: 2,
    backgroundColor: COLORS.secondaryColor,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 5,
  },
  listHeaderText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.white,
    fontFamily: 'Poppins-Medium',
  },
  listContent: {
    padding: 8,
    gap: 12,
  },
  listItemText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.black,
    textAlign: 'center',
  },
  overallSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  overallText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.white,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
  },
});
