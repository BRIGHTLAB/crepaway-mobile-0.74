import {StyleSheet, View, FlatList} from 'react-native';
import React from 'react';
import OfferCard from './OfferCard';
import TopListHeader from './TopListHeader';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {COLORS, SCREEN_PADDING} from '../../theme';

interface IProps {
  data: Offer[];
  onPress: () => void;
  isLoading?: boolean;
  hideViewAll?: boolean;
  onItemPress: (id: number) => void;
}

const OffersList = ({
  data,
  onPress,
  isLoading,
  hideViewAll,
  onItemPress,
}: IProps) => {
  const [showAll, setShowAll] = React.useState(false);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <TopListHeader
          title="Exclusive Offers"
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
              <SkeletonPlaceholder.Item
                width={220}
                height={156}
                borderRadius={8}
                marginRight={16}
              />
            </SkeletonPlaceholder>
          )}
          ItemSeparatorComponent={() => <View style={{width: 16}} />}
          ListFooterComponent={() => <View style={{width: 16}} />}
          ListHeaderComponent={() => <View style={{width: 16}} />}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {data?.length > 0 && (
        <TopListHeader
          title="Exclusive Offers"
          showAll={showAll}
          setShowAll={setShowAll}
          mainView={false}
          onPress={onPress}
        />
      )}
      <FlatList
        data={data}
        keyExtractor={item => item?.id?.toString()}
        renderItem={({item}) => (
          <OfferCard
            id={item?.id}
            image_url={item.image_url}
            onItemPress={onItemPress}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        // contentContainerStyle={{paddingHorizontal: 8}}
        ItemSeparatorComponent={() => <View style={{width: 16}} />}
        ListFooterComponent={() => <View style={{width: 16}} />}
        ListHeaderComponent={() => <View style={{width: 16}} />}
      />
    </View>
  );
};

export default OffersList;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginHorizontal: 'auto',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SCREEN_PADDING.horizontal,
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
