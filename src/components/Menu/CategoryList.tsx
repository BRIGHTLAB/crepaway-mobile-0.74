import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import CategoryCard from './CategoryCard';
import TopListHeader from './TopListHeader';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/NavigationStack';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {SCREEN_PADDING} from '../../theme';

interface IProps {
  data: Category[];
  isLoading?: boolean;
  onCategoryPress: (item: Category) => void;
}

type CategoryListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MenuItems'
>;

const CategoryList = ({data, isLoading, onCategoryPress}: IProps) => {
  const navigation = useNavigation<CategoryListNavigationProp>();

  const [showAll, setShowAll] = React.useState(true);
  const numColumns = 3;
  const screenWidth = Dimensions.get('window').width;
  const horizontalPadding = 16;
  const gap = 8;

  const cardWidth =
    (screenWidth - (horizontalPadding * 2 ) - (gap*(numColumns-1)) ) / numColumns;

  const displayedCategories = showAll ? data : data.slice(0, numColumns);

  const renderItem = ({item}: {item: Category}) => {
    return (
      <CategoryCard
        name={item.name}
        image_url={item.image_url}
        style={{width: cardWidth, marginRight: gap, marginBottom: gap}}
        onPress={() => onCategoryPress(item)}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <TopListHeader
          title="Categories"
          showAll={showAll}
          setShowAll={setShowAll}
          isLoading={isLoading}
        />

        <View style={[
          styles.gridContainer,
          {
            paddingLeft: horizontalPadding,
          }
        ]}>
          {[...Array(9)].map((_, index) => (
            <View
              key={index}
              style={[
                {
                  width: cardWidth, marginRight: gap, marginBottom: gap
                },
              ]}>
              <SkeletonPlaceholder>
                <SkeletonPlaceholder.Item
                  flexDirection="column"
                  alignItems="center">
                  <SkeletonPlaceholder.Item
                    width={cardWidth}
                    height={110}
                    borderRadius={10}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {data?.length > 0 && (
        <TopListHeader
          title="Categories"
          showAll={showAll}
          setShowAll={setShowAll}
        />
      )}
      <FlatList
        data={displayedCategories}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={numColumns}
        scrollEnabled={false}
        // contentContainerStyle={{ paddingBottom: 2}}
        style={{ paddingHorizontal: horizontalPadding }}
        columnWrapperStyle={{
          justifyContent: 'flex-start',
        }}
        ItemSeparatorComponent={() => <View style={{width: 0}} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginHorizontal: 'auto',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  skeletonItem: {
    marginBottom: 10,
  },
});

export default CategoryList;
