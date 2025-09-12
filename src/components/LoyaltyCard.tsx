import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { COLORS } from '../theme';


type Props = {
};

const LoyaltyCard = ({ }: Props) => {

    const onPress = () => {

    }

    return (
        <View style={styles.mainContainer}>
            <TouchableOpacity
                style={[styles.container]}
                onPress={onPress}
            >
                <Text>HERE</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LoyaltyCard;

const styles = StyleSheet.create({
    mainContainer: {
        padding: 10,
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        gap: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primaryColor,
        borderRadius: 10,
        borderStyle: 'dashed'
    },

});
