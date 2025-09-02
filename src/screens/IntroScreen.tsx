import React, { useEffect, useRef, useState } from "react";
import { View, Text, Dimensions, StyleSheet, Image } from "react-native";
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
    SharedValue,
    withRepeat,
    withTiming,
    Easing,
} from "react-native-reanimated";
import { normalizeFont } from '../utils/normalizeFonts';
import Icon_Spine from "../../assets/SVG/Icon_Spine";
import { COLORS } from "../theme";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon_Arrow_Right from "../../assets/SVG/Icon_Arrow_Right";
import { TYPOGRAPHY } from "../constants/typography";
import FadeOverlay from "../components/FadeOverlay";

const { width, height } = Dimensions.get("window");

const slides = [
    {
        id: "1",
        title: 'Effortless Dining Delight',
        description: 'Indulge in a seamless dining experience, from ordering to paying',
        backgroundColor: COLORS.primaryColor,
    },
    {
        id: "2",
        title: 'Takeaway Fiesta',
        description: 'Celebrate every bite with our quick and lively takeaway deliveries at your fingertips!',
        backgroundColor: COLORS.primaryColor,
    },
    {
        id: "3",
        title: 'Instant Food Joy',
        description: 'Savor joy in every bite with swift and customizable food deliveries at your fingertips.',
        backgroundColor: COLORS.primaryColor,
    },
    {
        id: "4",
        title: 'Rewards Hub',
        description: 'Kick off excitement and earn loyalty points with every purchase, unlocking exclusive rewards.',
        backgroundColor: COLORS.primaryColor,
    },
];

type SlideProps = {
    item: typeof slides[0];
    index: number;
    scrollX: SharedValue<number>;
};

const useRotatingAnimation = (duration = 7000) => {
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration, easing: Easing.linear }), // rotate to 360°
            -1, // infinite repeat
            false // do not reverse
        );
    }, [rotation, duration]);

    const animatedRotationStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    rotate: `${rotation.value}deg`,
                },
            ],
        };
    });

    return animatedRotationStyle;
}

const Slide = ({ item, index, scrollX }: SlideProps) => {
    const animatedTitleStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            scrollX.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [width * 2, 0, -width * 2],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            scrollX.value,
            [(index - 0.5) * width, index * width, (index + 0.5) * width],
            [0, 1, 0],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ translateX }],
            opacity
        };
    });

    const animatedDescStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            scrollX.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [width * 0.5, 0, -width * 0.5],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            scrollX.value,
            [(index - 0.5) * width, index * width, (index + 0.5) * width],
            [0, 1, 0],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ translateX }],
            opacity,
        };
    });

    const renderImage = (top?: boolean) => {
        switch (index) {
            case 0:
                return top
                    ? require('../../assets/images/intro/Image1.png')
                    : require('../../assets/images/intro/Image1_Lower.png');
            case 1:
                return top
                    ? require('../../assets/images/intro/Image3.png')
                    : require('../../assets/images/intro/Image3_Lower.png');
            case 2:
                return top
                    ? require('../../assets/images/intro/Image4.png')
                    : require('../../assets/images/intro/Image4_Lower.png');
            default:
                return top
                    ? require('../../assets/images/intro/Image2.png')
                    : require('../../assets/images/intro/Image2_Lower.png');
        }
    };

    return (
        <View style={[styles.slide, { width, backgroundColor: item.backgroundColor }]}>
            <Animated.View
                style={{
                    height: normalizeFont(340),
                    width: normalizeFont(276),
                    position: 'relative',
                    alignSelf: 'center',
                }}>
                <Image
                    source={renderImage(true)}
                    style={{
                        height: '100%',
                        width: '100%',
                        position: 'absolute',
                        zIndex: 1,
                    }}
                />

                <Image
                    source={renderImage()}
                    style={{
                        height: '100%',
                        width: '100%',
                        position: 'absolute',
                    }}
                />

                <View
                    style={{
                        height: normalizeFont(340),
                        width: normalizeFont(276),
                        justifyContent: 'flex-end',
                    }}>
                    <Animated.View style={[useRotatingAnimation()]}>
                        <Icon_Spine />
                    </Animated.View>
                </View>
            </Animated.View>


            <Animated.Text style={[styles.title, animatedTitleStyle]}>
                {item.title}
            </Animated.Text>
            <Animated.Text style={[styles.description, animatedDescStyle]}>
                {item.description}
            </Animated.Text>

        </View>
    );
};

type IProps = {
    navigation: {
        navigate: (screen: string) => void;
    };
};

const TutorialScreen = ({ navigation }: IProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    return (
        <View style={styles.mainContainer}>
            {/* Header with Skip button */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.skipContainer}
                    onPress={() => navigation.navigate('Login')}>
                    <Text style={[{ color: 'white' }, TYPOGRAPHY.SUB_HEADLINE]}>Skip</Text>
                    <Icon_Arrow_Right />
                </TouchableOpacity>
            </View>

            <Animated.FlatList
                data={slides}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <Slide item={item} index={index} scrollX={scrollX} />
                )}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                snapToInterval={width}
                decelerationRate="fast"
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
            />
            {/* Bottom section with pagination and button */}
            <View style={styles.bottomSection}>
                <View style={styles.paginationContainer}>
                    {slides.map((_, idx) => {
                        const animatedDotStyle = useAnimatedStyle(() => {
                            const inputRange = [(idx - 1) * width, idx * width, (idx + 1) * width];

                            const widthAnim = interpolate(
                                scrollX.value,
                                inputRange,
                                [12, 36, 12], // smaller → active → smaller
                                Extrapolation.CLAMP
                            );

                            const opacity = interpolate(
                                scrollX.value,
                                inputRange,
                                [0.4, 1, 0.4],
                                Extrapolation.CLAMP
                            );

                            return {
                                width: widthAnim,
                                backgroundColor: `rgba(247,247,247,${opacity})`,
                            };
                        });

                        return (
                            <Animated.View
                                key={idx}
                                style={[styles.dot, animatedDotStyle]}
                            />
                        );
                    })}
                </View>
            </View>

            {/* Fade In Overlay */}
            <FadeOverlay
                duration={500}
                color="black"
                onFadeComplete={() => console.log("Fade done")}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: COLORS.primaryColor,
        display: 'flex',
        width,
        height
    },
    header: {
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingTop: 5,
    },
    skipContainer: {
        flexDirection: 'row',
        paddingTop: 70,
        alignItems: 'center',
        gap: 6,
    },
    slide: {
        display: 'flex',
        flex: 1,
        width,
        justifyContent: "center",
        alignItems: "flex-start",
        padding: 20,
    },
    title: {
        paddingTop: 20,
        fontFamily: 'Poppins-Bold',
        color: COLORS.lightColor,
        fontSize: 48,
        lineHeight: 56,
        textAlign: 'left',
    },
    description: {
        color: COLORS.lightColor,
        fontFamily: 'Poppins-Normal',
        fontSize: 20,
        lineHeight: 28,
        opacity: 0.8,
        textAlign: 'left',
    },
    bottomSection: {
        paddingHorizontal: 16,
        paddingBottom: 20,
        alignItems: 'center',
        gap: 20,
    },
    paginationContainer: {
        paddingVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        margin: 5,
        backgroundColor: 'rgba(247,247,247,0.5)',
    },
    activeDot: {
        width: 36,
        backgroundColor: COLORS.lightColor,
    },
    buttonContainer: {
        width: '100%',
    },
});

export default TutorialScreen;
