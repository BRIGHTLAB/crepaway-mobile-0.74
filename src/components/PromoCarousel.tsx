import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import Icon_Spine from '../../assets/SVG/Icon_Spine';
import { UserPromo } from '../api/homeApi';
import { COLORS, SCREEN_PADDING } from '../theme';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - SCREEN_PADDING.horizontal * 2;
const CARD_MARGIN = 8;
const SNAP_WIDTH = CARD_WIDTH + CARD_MARGIN * 2;
const CARD_HEIGHT = 130;

interface PromoCarouselProps {
    promos: UserPromo[];
    currency: {
        id: number;
        symbol: string;
        name: string;
        exchange: number;
    } | null;
    scrollY?: SharedValue<number>;
}

const PromoCarousel = ({ promos, currency }: PromoCarouselProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList<UserPromo>>(null);

    if (!promos || promos.length === 0) {
        return null;
    }

    const formatDiscount = (promo: UserPromo) => {
        if (promo.discount_type === 'percentage') {
            return `${Math.round(promo.amount)}% OFF`;
        }
        return `${currency?.symbol ?? ''} ${promo.amount} OFF`;
    };

    const formatCap = (promo: UserPromo) => {
        if (promo.discount_type === 'percentage' && promo.max_amount) {
            return `Up to ${currency?.symbol ?? ''} ${promo.max_amount}`;
        }
        return null;
    };

    const formatExpiry = (endDate: string | null) => {
        if (!endDate) return null;
        const date = new Date(endDate);
        return `Expires ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(offsetX / SNAP_WIDTH);
        setActiveIndex(currentIndex);
    };

    const renderItem = ({ item }: { item: UserPromo }) => {
        const cap = formatCap(item);
        const expiry = formatExpiry(item.end_date);

        return (
            <View style={styles.cardWrapper}>
                <LinearGradient
                    colors={[COLORS.primaryColor, '#B6022B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    {/* Rotating spine decorations */}
                    <Animated.View style={[styles.spineLeft]}>
                        <Icon_Spine width={400} height={400} color={COLORS.primaryColor} />
                    </Animated.View>
                    <Animated.View style={[styles.spineRight]}>
                        <Icon_Spine width={400} height={400} color={COLORS.primaryColor} />
                    </Animated.View>

                    {/* Content */}
                    <View style={styles.contentRow}>
                        {/* Left side — Discount info */}
                        <View style={styles.leftContent}>
                            <Text style={styles.promoName} numberOfLines={1}>
                                {item.name}
                            </Text>
                            <Text style={styles.discountText}>{formatDiscount(item)}</Text>
                            {cap && <Text style={styles.capText}>{cap}</Text>}
                        </View>

                        {/* Right side — Code + expiry */}
                        <View style={styles.rightContent}>
                            <View style={styles.codePill}>
                                <Text style={styles.codeLabel}>CODE</Text>
                                <Text style={styles.codeText}>{item.code}</Text>
                            </View>
                            {expiry && <Text style={styles.expiryText}>{expiry}</Text>}
                        </View>
                    </View>

                    {/* Decorative circle cutouts */}
                    <View style={[styles.circleCutout, styles.circleCutoutLeft]} />
                    <View style={[styles.circleCutout, styles.circleCutoutRight]} />
                </LinearGradient>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Your Offers</Text>
            </View>
            <FlatList
                ref={flatListRef}
                data={promos}
                renderItem={renderItem}
                horizontal
                pagingEnabled={false}
                snapToInterval={SNAP_WIDTH}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
            />
            {promos.length > 1 && (
                <View style={styles.pagination}>
                    {promos.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                activeIndex === index && styles.paginationDotActive,
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

export default PromoCarousel;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SCREEN_PADDING.horizontal,
        marginBottom: 10,
    },
    sectionTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 18,
        color: COLORS.darkColor,
    },
    listContent: {
        paddingHorizontal: SCREEN_PADDING.horizontal - CARD_MARGIN,
    },
    cardWrapper: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        marginHorizontal: CARD_MARGIN,
    },
    card: {
        borderRadius: 14,
        height: CARD_HEIGHT,
        overflow: 'hidden',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    spineLeft: {
        position: 'absolute',
        left: -150,
        bottom: -325,
    },
    spineRight: {
        position: 'absolute',
        right: -180,
        top: -325,

    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftContent: {
        flex: 1,
        marginRight: 12,
    },
    promoName: {
        fontFamily: 'Poppins-Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        marginBottom: 2,
    },
    discountText: {
        fontFamily: 'Poppins-Bold',
        fontSize: 24,
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    capText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 1,
    },
    rightContent: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    codePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        borderStyle: 'dashed',
    },
    codeLabel: {
        fontFamily: 'Poppins-Medium',
        fontSize: 9,
        color: 'rgba(255,255,255,0.65)',
        marginRight: 5,
        letterSpacing: 1,
    },
    codeText: {
        fontFamily: 'Poppins-Bold',
        fontSize: 13,
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    expiryText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 6,
    },
    circleCutout: {
        position: 'absolute',
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: COLORS.backgroundColor,
    },
    circleCutoutLeft: {
        left: -9,
        top: '50%',
    },
    circleCutoutRight: {
        right: -9,
        top: '50%',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        gap: 6,
    },
    paginationDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: COLORS.accentColor,
    },
    paginationDotActive: {
        width: 20,
        backgroundColor: COLORS.primaryColor,
    },
});
