import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { COLORS, TYPOGRAPHY } from '../../theme'

type Props = {
    label: string
    value: string
    icon: React.ReactNode
}

const RewardTierLabelValue = ({ label, value, icon }: Props) => {
    return (
        <View style={styles.container}>
            <View style={{
                marginTop: 2,
            }}>
                {icon}
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
        </View>
    )
}

export default RewardTierLabelValue

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 5,

    },
    textContainer: {
    },
    label: {
        ...TYPOGRAPHY.BODY,

        color: COLORS.black,
        fontFamily: 'Poppins-Bold',


    },
    value: {
        ...TYPOGRAPHY.BODY,
        color: COLORS.black,
    },
})
