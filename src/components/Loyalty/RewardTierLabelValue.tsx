import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { COLORS, TYPOGRAPHY } from '../../theme'

type Props = {
    label: string
    value: string | string[]
    icon: React.ReactNode
}

const RewardTierLabelValue = ({ label, value, icon }: Props) => {
    const renderValue = () => {
        let parsedValue = value;

        // Handle stringified JSON arrays from the API
        if (typeof parsedValue === 'string') {
            try {
                const parsed = JSON.parse(parsedValue);
                if (Array.isArray(parsed)) {
                    parsedValue = parsed;
                }
            } catch {
                // Not valid JSON, keep as string
            }
        }

        if (Array.isArray(parsedValue)) {
            return (
                <View style={styles.arrayContainer}>
                    {parsedValue.map((item, index) => (
                        <Text key={index} style={[styles.value, styles.bulletPoint]}>
                            • {item}
                        </Text>
                    ))}
                </View>
            )
        }
        return <Text style={styles.value}>{parsedValue}</Text>
    }

    return (
        <View style={styles.container}>
            <View style={{
                marginTop: 2,
            }}>
                {icon}
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.label}>{label}</Text>
                {renderValue()}
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
    arrayContainer: {
        gap: 4,
    },
    bulletPoint: {
        marginTop: 2,
    },
})
