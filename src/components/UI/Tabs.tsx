import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {COLORS} from '../../theme';

type TabItem = {
  icon: JSX.Element;
  title: string;
};

type TabsProps = {
  tabs: TabItem[];
  onTabPress: (index: number) => void;
  selectedIndex: number;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
  tabStyle?: StyleProp<ViewStyle>;
};

const TabItemComponent = ({
  item: {icon, title},
  selected,
}: {
  item: TabItem;
  selected: boolean;
}) => {
  const iconColor = selected ? COLORS.lightColor : COLORS.lightColor;

  return (
    <View
      style={[
        styles.item,
        {backgroundColor: selected ? COLORS.primaryColor : 'transparent'},
      ]}>
      {icon && (
        <View style={[styles.iconContainer, {opacity: selected ? 1 : 0.4}]}>
          {React.cloneElement(icon, {color: iconColor})}
        </View>
      )}
      <Text style={{color: COLORS.lightColor, opacity: selected ? 1 : 0.4}}>
        {title}
      </Text>
    </View>
  );
};

const Tabs = ({
  tabs,
  onTabPress,
  selectedIndex,
  style,
  tabStyle,
  isLoading = false,
}: TabsProps) => {
  if (isLoading) {
    return <TabsSkeleton />;
  }

  return (
    <View style={[styles.container, style]}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            onTabPress(index);
            console.log('tabPress', index);
          }}
          style={[styles.tabButton, tabStyle]}>
          <TabItemComponent item={tab} selected={selectedIndex === index} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const TabsSkeleton = () => {
  return (
    <SkeletonPlaceholder
      backgroundColor="rgba(0, 0, 0, 0.8)"
      highlightColor="rgba(255, 255, 255, 0.1)">
      <View style={styles.container}>
        {[...Array(3)].map((_, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 51, // matches paddingVertical from styles.item
              marginHorizontal: index === 1 ? 8 : 0,
            }}
          />
        ))}
      </View>
    </SkeletonPlaceholder>
  );
};

export default Tabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 13.5,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
