'use client';
import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import {
  Camera,
  Code,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import { TYPOGRAPHY } from '../constants/typography';
import { COLORS } from '../theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type Props = {
  text?: string;
  onScan: (code: Code) => void;
};

const QrCodeCamera = ({ text, onScan }: Props) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

  // Reanimated shared value for animation
  const scale = useSharedValue(1);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => onScan(codes[0]),
  });

  useEffect(() => {
    const checkPermissions = async () => {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          console.error('Camera permission not granted');
        }
      }
    };
    checkPermissions();
  }, [hasPermission, requestPermission]);

  // Setup animation when component mounts
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.03, {
        duration: 800,
        easing: Easing.inOut(Easing.quad),
      }),
      -1, // Infinite repeats
      true, // Reverse on each repeat
    );
  }, []);

  // Create animated style for scan area
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  if (!hasPermission) return null;
  if (device == null) return null;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFillObject}
        codeScanner={codeScanner}
        device={device}
        isActive={true}
      />
      {/* Overlay with corner markers */}
      <View style={styles.overlay}>
        {text && <Text style={styles.text}>{text}</Text>}
        <Animated.View style={[styles.scanArea, animatedStyle]}>
          {/* Top Left Corner */}
          <View style={[styles.corner, styles.topLeft]} />

          {/* Top Right Corner */}
          <View style={[styles.corner, styles.topRight]} />

          {/* Bottom Left Corner */}
          <View style={[styles.corner, styles.bottomLeft]} />

          {/* Bottom Right Corner */}
          <View style={[styles.corner, styles.bottomRight]} />
        </Animated.View>
      </View>
    </View>
  );
};

export default QrCodeCamera;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    gap: 20,
    flex: 1,
    top: 70,
    bottom: 100,
    right: 30,
    left: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  corner: {
    position: 'absolute',
    width: 35,
    height: 35,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopStartRadius: 10,
    borderColor: COLORS.white,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopEndRadius: 10,
    borderColor: COLORS.white,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: COLORS.white,
    borderBottomStartRadius: 10,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomEndRadius: 10,
    borderColor: COLORS.white,
  },
  text: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.white,
    marginBottom: 20,
  },
});
