import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FadeInFastImage } from './FadeInFastImage';
import FastImage from 'react-native-fast-image';

const { width: screenWidth } = Dimensions.get('window');

interface BannerItem {
  image: string;
  title: string;
}

interface BannerProps {
  data: BannerItem[];
}

const Banner: React.FC<BannerProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList<BannerItem>>(null);
  const { top } = useSafeAreaInsets()

  const renderItem = ({ item }: { item: BannerItem }) => {
    return (
      <View style={[styles.slide]}>
        <FadeInFastImage
          source={{
            uri: item.image ||
              'https://d3vfh4cqgoixck.cloudfront.net/images/locations_placeholder1.webp',
            priority: FastImage.priority.normal,
          }}
          style={styles.image}
          containerStyle={styles.image}
          duration={300}
          resizeMode={FastImage.resizeMode.cover}
          placeholderColor="#f2f2f2"
        />
        <Text style={styles.title}>{item.title}</Text>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'black',
            opacity: 0.7,
            zIndex: 1,
            pointerEvents: 'none',
          }}></View>
      </View>
    );
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / screenWidth);
    setActiveIndex(currentIndex);
  };

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {data.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => flatListRef.current?.scrollToIndex({ index })}
            style={[
              styles.paginationDot,
              activeIndex === index ? styles.paginationDotActive : null,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container,
    {
      height: 246 + top
    }
    ]}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        keyExtractor={(item, index) => index.toString()}
      />
      {renderPagination()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  slide: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    padding: 16,
    zIndex: 2,
    marginBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    position: 'absolute',
    width: '100%',
    bottom: 15,
    zIndex: 1,
    gap: 8,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 4,
    backgroundColor: COLORS.lightColor,
    opacity: 0.5,
  },
  paginationDotActive: {
    width: 30,
    backgroundColor: COLORS.lightColor,
    opacity: 1,
  },
});

export default Banner;
