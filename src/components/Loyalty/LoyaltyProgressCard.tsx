import React from 'react'
import { Pressable, PressableProps, StyleSheet, Text, View } from 'react-native'
import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import Icon_Arrow_Right from '../../../assets/SVG/Icon_Arrow_Right'
import Icon_Spine from '../../../assets/SVG/Icon_Spine'
import { COLORS, TYPOGRAPHY } from '../../theme'
import { normalizeFont } from '../../utils/normalizeFonts'
import DashedProgressBar from '../UI/DashedProgressBar'

interface LoyaltyProgressCardProps extends Omit<PressableProps, 'style'> {
    tierName: string
    totalDashes: number
    filledDashes: number
    progressColor: string
    description: string
    pointsCount: string
    pointsUnit?: string
    onPress?: () => void
    scrollY?: SharedValue<number>
    hideBackground?: boolean
    disabled?: boolean
}

const LoyaltyProgressCard: React.FC<LoyaltyProgressCardProps> = ({
    tierName,
    totalDashes,
    filledDashes,
    progressColor,
    description,
    pointsCount,
    pointsUnit = 'Pts',
    onPress,
    scrollY,
    hideBackground = false,
    disabled = false,
    ...pressableProps
}) => {
    // Animated style for left spine - rotate clockwise
    const leftSpineStyle = useAnimatedStyle(() => {
        if (!scrollY) return {}

        const rotation = interpolate(
            scrollY.value,
            [0, 5000],
            [0, 360],
            'clamp'
        )

        return {
            transform: [{ rotate: `${rotation}deg` }],
        }
    })

    // Animated style for right spine - rotate counter-clockwise
    const rightSpineStyle = useAnimatedStyle(() => {
        if (!scrollY) return {}

        const rotation = interpolate(
            scrollY.value,
            [0, 8000],
            [0, 360],
            'clamp'
        )

        return {
            transform: [{ rotate: `${rotation}deg` }],
        }
    })

    return (
        <Pressable
            style={[
                styles.container,
                hideBackground && styles.containerNoBackground
            ]}
            onPress={onPress}
            disabled={disabled}
            {...pressableProps}
        >
            <View style={styles.leftContentContainer}>
                <Text style={[styles.tierNameText, { color: progressColor }]}>
                    {tierName}
                </Text>
                <DashedProgressBar
                    totalDashes={totalDashes}
                    filledDashes={filledDashes}
                    color={progressColor}
                />
                <Text style={styles.descriptionText}>
                    {description}
                </Text>
            </View>
            <View style={styles.rightContentContainer}>
                <Text style={styles.pointsCountText}>
                    {pointsCount}
                </Text>
                <View style={styles.pointsUnitContainer}>
                    <Text style={styles.pointsUnitText}>
                        {pointsUnit}
                    </Text>
                    {!disabled && (
                        <Icon_Arrow_Right width={24} height={24} color={COLORS.white} />
                    )}
                </View>
            </View>

            {/* absolute spines with rotation animation */}
            {!hideBackground && (
                <>
                    <Animated.View style={[styles.spineLeftContainer, leftSpineStyle]}>
                        <Icon_Spine width={400} height={400} opacity={0.1} />
                    </Animated.View>
                    <Animated.View style={[styles.spineRightContainer, rightSpineStyle]}>
                        <Icon_Spine width={400} height={400} opacity={0.1} />
                    </Animated.View>
                </>
            )}
        </Pressable>
    )
}

export default LoyaltyProgressCard

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.secondaryColor,
        borderRadius: 8,
        padding: 16,
        overflow: 'hidden',
        gap: 15,
        flexDirection: 'row',
    },
    leftContentContainer: {
        flex: 1,
        gap: 5,
    },
    rightContentContainer: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
    },
    tierNameText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: normalizeFont(16),
    },
    descriptionText: {
        fontFamily: 'Poppins-Regular',
        fontSize: normalizeFont(10),
        color: '#bdbdbd',
    },
    pointsUnitContainer: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
    },
    spineLeftContainer: {
        position: 'absolute',
        left: -150,
        bottom: -325,
    },
    spineRightContainer: {
        position: 'absolute',
        right: -180,
        top: -325,

    },
    pointsCountText: {
        ...TYPOGRAPHY.HEADLINE,
        fontFamily: 'Poppins-Regular',

        fontWeight: 'bold',
        color: COLORS.white,
    },
    pointsUnitText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: COLORS.white,
    },
    containerNoBackground: {
        backgroundColor: 'transparent',
    },
})