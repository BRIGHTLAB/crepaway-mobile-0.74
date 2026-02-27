import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../theme';

export interface TabType<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

interface SegmentedControlProps<T = string> {
  tabs: TabType<T>[];
  selectedTab: TabType<T>;
  onTabChange: (tab: TabType<T>) => void;
}

const SegmentedControl = <T extends string = string>({
  tabs,
  selectedTab,
  onTabChange,
}: SegmentedControlProps<T>) => {
  return (
    <View style={styles.segmentedControlContainer}>
      {tabs.map((tab, index) => {
        const isSelected = selectedTab.value === tab.value;
        const isFirst = index === 0;
        const isLast = index === tabs.length - 1;
        const isDisabled = tab.disabled === true;

        return (
          <React.Fragment key={tab.value}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                isSelected && !isDisabled && styles.segmentButtonSelected,
                isFirst && { borderTopLeftRadius: 5, borderBottomLeftRadius: 5 },
                isLast && { borderTopRightRadius: 5, borderBottomRightRadius: 5 },
                isDisabled && { opacity: 0.4 },
              ]}
              activeOpacity={0.9}
              disabled={isDisabled}
              onPress={() => onTabChange(tab)}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  isSelected && !isDisabled && styles.segmentButtonTextSelected,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
            {!isLast && (
              <View
                style={{
                  width: 1,
                  height: '100%',
                  backgroundColor: COLORS.borderColor,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default SegmentedControl;

const styles = StyleSheet.create({
  segmentedControlContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 5,
    overflow: 'hidden',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  segmentButtonSelected: {
    backgroundColor: COLORS.primaryColor,
  },
  segmentButtonText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.darkColor,
    fontFamily: 'Poppins-Medium',
  },
  segmentButtonTextSelected: {
    color: COLORS.white,
  },
});
