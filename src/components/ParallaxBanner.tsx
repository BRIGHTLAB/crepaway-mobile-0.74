// ParallaxBanner.tsx
import React, { useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../theme";
import { normalizeFont } from "../utils/normalizeFonts";
import FastImage from "react-native-fast-image";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface BannerData {
    id: string;
    image: string;
    title: string;
}

type SlideProps = {
    item: BannerData;
    index: number;
    scrollX: SharedValue<number>;
    slideWidth: number;
};

const Slide = ({ item, index, scrollX, slideWidth }: SlideProps) => {
    // Title animation (kept in case you re-enable the title/description later)
    const animatedTitleStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            scrollX.value,
            [(index - 1) * slideWidth, index * slideWidth, (index + 1) * slideWidth],
            [slideWidth * 2, 0, -slideWidth * 2],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            scrollX.value,
            [(index - 0.5) * slideWidth, index * slideWidth, (index + 0.5) * slideWidth],
            [0, 1, 0],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ translateX }],
            opacity,
        };
    });

    const animatedDescStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            scrollX.value,
            [(index - 1) * slideWidth, index * slideWidth, (index + 1) * slideWidth],
            [slideWidth * 0.5, 0, -slideWidth * 0.5],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            scrollX.value,
            [(index - 0.5) * slideWidth, index * slideWidth, (index + 0.5) * slideWidth],
            [0, 1, 0],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ translateX }],
            opacity,
        };
    });

    return (
        <View style={[styles.slide, { width: slideWidth }]}>
            <Animated.View
                style={{
                    height: normalizeFont(250),
                    width: '100%',
                    position: "relative",
                    alignSelf: "center",
                    paddingHorizontal: 10,
                    paddingVertical: 40
                }}
            >
                <FastImage
                    source={{ uri: item.image }}
                    style={{
                        width: '100%',
                        height: 200,
                        borderRadius: 10,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                    accessibilityLabel={item.title}
                />
            </Animated.View>


            {/* <Animated.Text style={[styles.title, animatedTitleStyle]}>
        {item.title}
      </Animated.Text> */}

        </View>
    );
};

function Dot({
    idx,
    scrollX,
    slideWidth,
}: {
    idx: number;
    scrollX: SharedValue<number>;
    slideWidth: number;
}) {
    // ✅ Hook lives inside a component, not inside a loop in the parent render
    const animatedDotStyle = useAnimatedStyle(() => {
        const inputRange = [(idx - 1) * slideWidth, idx * slideWidth, (idx + 1) * slideWidth];

        const w = interpolate(scrollX.value, inputRange, [12, 36, 12], Extrapolation.CLAMP);
        const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], Extrapolation.CLAMP);

        return {
            width: w,
            backgroundColor: `rgba(50,50,50,${opacity})`,
        };
    });

    return <Animated.View style={[styles.dot, animatedDotStyle]} />;
}

type Props = {
    data: BannerData[];
    width?: number; // allow overriding width (e.g., if used inside a modal/layout)
};

const ParallaxBanner = ({ data, width = SCREEN_WIDTH }: Props) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);
    const insets = useSafeAreaInsets();

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    return (
        <View style={[styles.mainContainer, { width }]}>
            <Animated.FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <Slide item={item} index={index} scrollX={scrollX} slideWidth={width} />
                )}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                snapToInterval={width}
                decelerationRate="fast"
                getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
            />

            {/* Bottom section with pagination */}
            <View style={[styles.bottomSection]}>
                <View style={styles.paginationContainer} accessible accessibilityRole="adjustable">
                    {data.map((_, idx) => (
                        <Dot key={idx} idx={idx} scrollX={scrollX} slideWidth={width} />
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
    },
    slide: {
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        maxHeight: 200,
    },
    title: {
        paddingTop: 20,
        fontFamily: "Poppins-Bold",
        color: COLORS.lightColor,
        fontSize: 20,
        lineHeight: 20,
        textAlign: "left",
    },
    description: {
        color: COLORS.lightColor,
        fontFamily: "Poppins-Normal",
        fontSize: 20,
        lineHeight: 28,
        opacity: 0.8,
        textAlign: "left",
    },
    bottomSection: {
        alignItems: "center",
    },
    paginationContainer: {
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        margin: 5,
        backgroundColor: "rgba(247,247,247,0.5)",
    },
});

export default ParallaxBanner;
