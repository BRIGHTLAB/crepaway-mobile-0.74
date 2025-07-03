import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Icon_Pin from '../../../assets/SVG/Icon_Pin';
import Icon_Logo_Spine from '../../../assets/SVG/Icon_Logo_Spine';

const Marker = () => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    const animate = () => {
      rotation.value = withTiming(
        rotation.value + 360,
        {
          duration: 5000,
          easing: Easing.linear,
        },
        () => {
          // Use runOnJS to call animate() on the JS thread
          runOnJS(animate)();
        },
      );
    };

    animate();
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        // Modulo ensures the rendered angle stays within 0-360 deg
        rotate: `${rotation.value % 360}deg`,
      },
    ],
  }));

  return (
    <View style={styles.markerContainer}>
      <Icon_Pin />
      <Animated.View style={[styles.logo, animatedStyle]}>
        <Icon_Logo_Spine />
      </Animated.View>
    </View>
  );
};

export default Marker;

const styles = StyleSheet.create({
  markerContainer: {
    position: 'relative',
  },
  logo: {
    position: 'absolute',
    marginLeft: 7,
    marginTop: 7,
  },
});
