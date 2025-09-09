import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';


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
      <LinearGradient colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.7)']} style={styles.titleContainer}>
        <Text style={styles.title}>{name}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  container: {
    width: 83,
    alignItems: 'center',
    position: 'relative',

    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 110,
    borderRadius: 10,
  },
  titleContainer:{
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '60%',
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,

  },
  title: {
    marginTop: 2,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: 'white',
    paddingBottom: 2,
    textAlign: 'center',
  },
});
