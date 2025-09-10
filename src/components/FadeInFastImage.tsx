// FadeInFastImage.tsx
import React, { useMemo } from "react"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  cancelAnimation,
  runOnJS,
} from "react-native-reanimated"
import FastImage, { FastImageProps } from "react-native-fast-image"
import { View, StyleProp, ViewStyle } from "react-native"

type Props = FastImageProps & {
  /** Fade duration in ms */
  duration?: number
  /** Optional wrapper style (size, borderRadius, etc.) */
  containerStyle?: StyleProp<ViewStyle>
  /** Optional solid placeholder color while loading */
  placeholderColor?: string
}

export const FadeInFastImage: React.FC<Props> = ({
  duration = 400,
  containerStyle,
  placeholderColor = "transparent",
  style,
  onLoad,
  onLoadStart,
  onLoadEnd,
  source,
  ...rest
}) => {
  const opacity = useSharedValue(0)

  // Reset opacity whenever the image source changes
  useMemo(() => {
    cancelAnimation(opacity)
    opacity.value = 0
  }, [source, opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const handleLoad: NonNullable<FastImageProps["onLoad"]> = (e) => {
    // start fade when the image has decoded
    opacity.value = withTiming(1, { duration })
    onLoad?.(e)
  }

  const handleLoadStart: NonNullable<FastImageProps["onLoadStart"]> = () => {
    // keep hidden if something re-triggers loading
    opacity.value = 0
    if(onLoadStart) onLoadStart();
  }

  return (
    <View style={containerStyle}>
      {/* simple placeholder (optional) */}
      {placeholderColor !== "transparent" && (
        <View
          pointerEvents="none"
          style={[
            // @ts-ignore RN style merging
            style,
            { backgroundColor: placeholderColor, position: "absolute" },
          ]}
        />
      )}

      <Animated.View style={[animatedStyle, { overflow: "hidden" }]}>
        <FastImage
          {...rest}
          source={source}
          style={style}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onLoadEnd={onLoadEnd}
        />
      </Animated.View>
    </View>
  )
}
