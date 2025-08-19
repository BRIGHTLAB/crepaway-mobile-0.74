import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const WalletScreen = () => {
    return (
        <View style={styles.container}>
            <View style={styles.pointsContainer}>
                <Text>Points:</Text>
                <Text style={styles.pointsAmount}>1250</Text>
            </View>
        </View>
    )
}

export default WalletScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    pointsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pointsAmount: {
        alignSelf: 'flex-end',
        fontWeight: 'bold',
        fontSize: 18,
    },
})