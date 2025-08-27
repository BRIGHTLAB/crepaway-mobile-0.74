import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS
} from "react-native-reanimated";

type FadeOverlayProps = {
  duration?: number; // fade-out duration in ms
  color?: string;    // overlay color
  onFadeComplete?: () => void; // optional callback when fade finishes
};

const FadeOverlay: React.FC<FadeOverlayProps> = ({
  duration = 1000,
  color = "black",
  onFadeComplete,
}) => {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withTiming(0, { duration, easing: Easing.out(Easing.ease) }, () => {
      if (onFadeComplete) {
        // run callback on JS thread
        runOnJS(onFadeComplete)();
      }
    });
  }, []);

  return <Animated.View style={[styles.overlay, { backgroundColor: color }, animatedStyle]} pointerEvents="none" />;
};

export default FadeOverlay;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
