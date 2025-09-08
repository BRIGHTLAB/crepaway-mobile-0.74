import React from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { COLORS, SCREEN_PADDING } from '../../theme';
import ItemCard from './ItemCard';
import TopListHeader from './TopListHeader';

interface IProps {
  title: string;
  data: Item[];
  showNoDetails?: boolean;
  onPress: () => void;
  onItemPress: (id: number) => void;
  isLoading?: boolean;
}

const ItemsList = ({
  title,
  data,
  onPress,
  onItemPress,
  showNoDetails = false,
  isLoading,
}: IProps) => {
  const [showAll, setShowAll] = React.useState(false);

  // Calculate card width to show 1.5 cards per screen
  const { width: screenWidth } = Dimensions.get('window');
  const availableWidth = screenWidth - (SCREEN_PADDING.horizontal * 2); // Account for screen padding
  const cardWidth = (availableWidth / 1.5) - 8; // 1.5 cards per screen, minus gap

  if (isLoading) {
    return (
      <View style={styles.container}>
        <TopListHeader
          title={title}
          showAll={showAll}
          setShowAll={setShowAll}
          mainView={false}
          onPress={onPress}
          isLoading={isLoading}
        />
        <FlatList
          data={[...Array(4)]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          renderItem={() => (
            <SkeletonPlaceholder>
              <SkeletonPlaceholder.Item flexDirection="column">
                <SkeletonPlaceholder.Item
                  width={cardWidth}
                  height={156}
                  borderRadius={8}
                  marginBottom={8}
                />
                <SkeletonPlaceholder.Item
                  width={120}
                  height={20}
                  marginBottom={4}
                />
                <SkeletonPlaceholder.Item width={80} height={20} />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder>
          )}
          ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
          ListFooterComponent={() => <View style={{ width: 16 }} />}
          ListHeaderComponent={() => <View style={{ width: 16 }} />}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {data?.length > 0 && (
        <TopListHeader
          title={title}
          showAll={showAll}
          setShowAll={setShowAll}
          mainView={false}
          onPress={onPress}
        />
      )}
      <FlatList
        data={data?.length > 0 ? data?.slice(0, 8) : []}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          return (
            <ItemCard
              id={item.id}
              name={item.name}
              description={item.description}
              image_url={item.image_url || ''}
              price={item.price || 0}
              symbol={item.symbol}
              tags={item.tags}
              isFavorite={item.is_favorite}
              showNoDetails={showNoDetails}
              style={{ width: cardWidth }}
              onItemPress={onItemPress || (() => { })}
            />
          );
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
        ListFooterComponent={() => <View style={{ width: 16 }} />}
        ListHeaderComponent={() => <View style={{ width: 16 }} />}
      />
    </View>
  );
};

export default ItemsList;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginHorizontal: 'auto',
  },
  topTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.darkColor,
  },
  viewAll: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.darkColor,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
});
