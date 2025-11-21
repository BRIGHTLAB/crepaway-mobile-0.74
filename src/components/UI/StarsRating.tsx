import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon_Star from '../../../assets/SVG/Icon_Star';
import { COLORS, TYPOGRAPHY } from '../../theme';

type Props = {
    title?: string;
    rating: number;
    onRatingChange?: (rating: number) => void;
}

const StarsRating = ({ title, rating, onRatingChange }: Props) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.starsContainer}>
                {Array.from({ length: 5 }).map((_, index) => (
                    <Icon_Star key={index} color={rating >= index + 1 ? COLORS.yellow : COLORS.yellowLight} onPress={() => onRatingChange?.(index + 1)} />
                ))}
            </View>
        </View>
    )
}

export default StarsRating


const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
    },
    title: {
        ...TYPOGRAPHY.SUB_HEADLINE,
        color: COLORS.black,
        fontFamily: 'Poppins-SemiBold',
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2,
    },
});