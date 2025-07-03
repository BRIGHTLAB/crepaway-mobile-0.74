import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import FastImage from 'react-native-fast-image';

interface IProps {
  name: string;
  image_url?: string;
  style?: object;
  onPress: () => void;
}

const CategoryCard = ({name, image_url, style, onPress}: IProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <FastImage
        source={{
          uri:
            image_url ||
            'https://d3vfh4cqgoixck.cloudfront.net/images/locations_placeholder1.webp',
          priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.cover}
        style={styles.image}
      />
      <Text style={styles.title}>{name}</Text>
    </TouchableOpacity>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  container: {
    width: 83,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 85,
    borderRadius: 8,
  },
  title: {
    marginTop: 4,
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
});
