import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import Icon_Arrow_Right from '../../../assets/SVG/Icon_Arrow_Right'
import Icon_Handbag from '../../../assets/SVG/Icon_Handbag'
import Icon_Spine from '../../../assets/SVG/Icon_Spine'
import Icon_Wavy from '../../../assets/SVG/Icon_Wavy'
import { COLORS, TYPOGRAPHY } from '../../theme'
import RewardTierLabelValue from './RewardTierLabelValue'

interface RewardTierCardProps {
    tierName: string
    earnedPoints: number
    orders: number
    color: string
    scrollY?: SharedValue<number>
}

const RewardTierCard: React.FC<RewardTierCardProps> = ({
    tierName,
    earnedPoints,
    orders,
    color,
    scrollY,
}) => {
    // Animated style for first right spine - rotate clockwise
    const rightSpine1Style = useAnimatedStyle(() => {
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

    // Animated style for second right spine - rotate counter-clockwise
    const rightSpine2Style = useAnimatedStyle(() => {
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
        <View style={styles.container}>
            {/* absolute spines with rotation animation on the right side */}
            <Animated.View style={[styles.spineRight1Container, rightSpine1Style]}>
                <Icon_Spine width={400} height={400} opacity={1} color={'#EAEAEA'} />
            </Animated.View>
            <Animated.View style={[styles.spineRight2Container, rightSpine2Style]}>
                <Icon_Spine width={400} height={400} opacity={1} color={'#EAEAEA'} />
            </Animated.View>

            <Text style={[styles.tierName, { color }]}>
                {tierName}
            </Text>
            <View style={styles.labelValueContainer}>
                <RewardTierLabelValue label="Earned points" value={earnedPoints.toString()} icon={<Icon_Wavy />} />
                <RewardTierLabelValue label="Orders" value={orders.toString()} icon={<Icon_Handbag />} />
                <Icon_Arrow_Right width={24} height={24} color={COLORS.black} style={{ marginLeft: 'auto' }} />
            </View>
        </View>
    )
}

export default RewardTierCard

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f4f4f4',
        borderRadius: 5,
        padding: 20,
        overflow: 'hidden',
        gap: 10,
        width: 337
    },
    tierName: {
        ...TYPOGRAPHY.LARGE_TITLE,
        fontFamily: 'Poppins-Bold',
        fontWeight: '700',
    },
    labelValueContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    spineRight1Container: {
        position: 'absolute',
        right: -230,
        top: -50,
    },
    spineRight2Container: {
        position: 'absolute',
        right: -300,
        top: -20,
    },
})