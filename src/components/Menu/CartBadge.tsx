import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme';
import { useCartItemCount } from '../../hooks/useCartItemCount';

interface CartBadgeProps {
    itemId: number;
    style?: object;
}

/**
 * A small badge that shows how many of an item are in the cart.
 * Renders nothing if count is 0.
 */
const CartBadge: React.FC<CartBadgeProps> = ({ itemId, style }) => {
    const count = useCartItemCount(itemId);

    if (count === 0) return null;

    return (
        <View style={[styles.badge, style]}>
            <Text style={styles.badgeText}>{count}</Text>
        </View>
    );
};

export default CartBadge;

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: COLORS.primaryColor,
        minWidth: 25,
        height: 25,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        zIndex: 10,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    badgeText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 11,
        color: COLORS.white,
        lineHeight: 15,
    },
});
