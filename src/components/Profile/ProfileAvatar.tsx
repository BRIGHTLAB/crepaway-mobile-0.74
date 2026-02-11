import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import FastImage from 'react-native-fast-image';
import { COLORS, TYPOGRAPHY } from '../../theme';

type ProfileAvatarProps = {
    imageUrl?: string | null;
    name?: string | null;
    size?: number;
    backgroundColor?: string;
    style?: ViewStyle;
};

const ProfileAvatar = ({
    imageUrl,
    name,
    size = 80,
    backgroundColor = COLORS.darkColor,
    style,
}: ProfileAvatarProps) => {
    const borderRadius = size / 2;
    const hasFlexibleSize = style?.width === '100%' || style?.aspectRatio != null;

    return (
        <View
            style={[
                {
                    borderRadius,
                    backgroundColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                },
                !hasFlexibleSize && { width: size, height: size },
                style,
                hasFlexibleSize && { borderRadius: 999 },
            ]}>
            {imageUrl ? (
                <FastImage
                    source={{
                        uri: imageUrl,
                        priority: FastImage.priority.normal,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                    style={hasFlexibleSize ? { width: '100%', height: '100%' } : { width: size, height: size }}
                />
            ) : (
                <Text
                    style={[
                        styles.initials,
                        size <= 50 && !hasFlexibleSize && styles.initialsSmall,
                    ]}>
                    {name?.split(' ').map(str => str.charAt(0)).join('')}
                </Text>
            )}
        </View>
    );
};

export default ProfileAvatar;

const styles = StyleSheet.create({
    initials: {
        ...TYPOGRAPHY.TITLE,
        textTransform: 'uppercase',
        color: COLORS.lightColor,
    },
    initialsSmall: {
        ...TYPOGRAPHY.TAGS,
        fontWeight: '600',
        textTransform: 'uppercase',
        color: COLORS.lightColor,
    },
});
