import {Pressable, StyleSheet} from 'react-native';
import React from 'react';
import FastImage from 'react-native-fast-image';

interface IProps {
  id: number;
  image_url: string;
  style?: object;
  onItemPress: (id: number) => void;
}

const OfferCard = ({id, image_url, style, onItemPress}: IProps) => {
  console.log('item id', id);

  return (
    <Pressable onPress={() => onItemPress(id)}>
      <FastImage
        source={{
          uri:
            image_url ||
            'https://d3vfh4cqgoixck.cloudfront.net/images/locations_placeholder1.webp',
          priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.cover}
        style={[styles.image, style]}
      />
    </Pressable>
  );
};

export default OfferCard;

const styles = StyleSheet.create({
  image: {
    width: 220,
    height: 156,
    borderRadius: 8,
  },
});
