import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import React, { forwardRef, JSX, useCallback, useEffect, useState } from 'react';
import {
    NativeSyntheticEvent,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextInputFocusEventData,
    TextInputProps,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Icon_Eye from '../../../assets/SVG/Icon_Eye';
import Icon_Eye_Line from '../../../assets/SVG/Icon_Eye_Line';
import { COLORS, INPUT_HEIGHT, TYPOGRAPHY } from '../../theme';

interface InputProps extends TextInputProps {
    iconLeft?: JSX.Element;
    error?: string;
    required?: boolean;
    iconRight?: JSX.Element;
    disabled?: boolean;
    returnKeyType?: 'done' | 'next';
    onSubmitEditing?: () => void;
    secureTextEntry?: boolean;
}

const Input = forwardRef<TextInput, InputProps>(
    (
        {
            iconLeft,
            iconRight,
            error,
            placeholder,
            onFocus,
            onBlur,
            required,
            disabled,
            secureTextEntry,
            ...rest
        },
        ref,
    ) => {
        // —— bottom-sheet keyboard hook ——
        const { shouldHandleKeyboardEvents } = useBottomSheetInternal();

        const [isFocused, setIsFocused] = useState(false);
        const [isPasswordVisible, setIsPasswordVisible] = useState(false);
        const animation = useSharedValue(rest.value ? 0 : 1);
        const placeholderPosition = useSharedValue(iconLeft ? 38 : 10);

        // reset on unmount
        useEffect(() => {
            return () => {
                shouldHandleKeyboardEvents.value = false;
            };
        }, [shouldHandleKeyboardEvents]);

        // animate placeholder on value changes
        useEffect(() => {
            if (rest.value) {
                animation.value = withTiming(0, { duration: 200 });
                if (iconLeft) placeholderPosition.value = withTiming(10, { duration: 200 });
            }
        }, [rest.value, animation, placeholderPosition, iconLeft]);

        // animated styles…
        const animatedStyle = useAnimatedStyle(() => ({
            top: interpolate(animation.value, [0, 1], [-12, INPUT_HEIGHT / 2 - 12]),
            fontSize: interpolate(animation.value, [0, 1], [12, 16]),
        }));
        const leftIconAnimatedStyle = useAnimatedStyle(() => ({
            opacity: animation.value,
            width: animation.value * 24,
            marginRight: animation.value * 8,
        }));
        const placeholderPositionStyle = useAnimatedStyle(() => ({
            left: placeholderPosition.value,
        }));

        // —— handlers with bottom-sheet integration ——
        const handleFocus = useCallback(
            (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
                // tell bottom-sheet to handle keyboard
                shouldHandleKeyboardEvents.value = true;

                onFocus?.(event);
                setIsFocused(true);
                animation.value = withTiming(0, { duration: 200 });
                if (iconLeft) placeholderPosition.value = withTiming(10, { duration: 200 });
            },
            [onFocus, animation, placeholderPosition, iconLeft, shouldHandleKeyboardEvents],
        );

        const handleBlur = useCallback(
            (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
                // stop bottom-sheet handling
                shouldHandleKeyboardEvents.value = false;

                onBlur?.(event);
                setIsFocused(false);
                if (!rest.value) {
                    animation.value = withTiming(1, { duration: 200 });
                    if (iconLeft) placeholderPosition.value = withTiming(38, { duration: 200 });
                }
            },
            [onBlur, animation, placeholderPosition, iconLeft, rest.value, shouldHandleKeyboardEvents],
        );

        const togglePasswordVisibility = () => setIsPasswordVisible(v => !v);
        const showPasswordToggle = secureTextEntry !== undefined;

        return (
            <View style={styles.container}>
                <View
                    style={[
                        styles.inputContainer,
                        { borderColor: error ? COLORS.errorColor : COLORS.borderColor },
                    ]}>
                    {iconLeft && <Animated.View style={[styles.iconLeft, leftIconAnimatedStyle]}>{iconLeft}</Animated.View>}
                    <View style={{ flex: 1 }}>
                        <TextInput
                            ref={ref}
                            style={[styles.input, iconLeft && { paddingLeft: 0 }]}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            blurOnSubmit={false}
                            editable={!disabled}
                            secureTextEntry={secureTextEntry && !isPasswordVisible}
                            {...rest}
                        />
                    </View>
                    {showPasswordToggle && (
                        <TouchableOpacity style={styles.passwordToggle} onPress={togglePasswordVisibility} activeOpacity={0.7}>
                            {isPasswordVisible ? <Icon_Eye_Line /> : <Icon_Eye />}
                        </TouchableOpacity>
                    )}
                    {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
                    {placeholder && (
                        <Animated.View style={[styles.placeholderContainer, placeholderPositionStyle, animatedStyle]}>
                            <View
                                style={[
                                    styles.placeholderBackground,
                                    { backgroundColor: isFocused || rest.value ? 'white' : 'transparent' },
                                ]}
                            />
                            <Animated.Text
                                style={[
                                    styles.placeholder,
                                    {
                                        color:
                                            error && (isFocused || rest.value)
                                                ? COLORS.errorColor
                                                : COLORS.placeholderColor,
                                    },
                                ]}>
                                {placeholder}
                                {required && <Text style={styles.requiredStar}>*</Text>}
                            </Animated.Text>
                        </Animated.View>
                    )}
                </View>
                {error && <Text style={styles.error}>{error}</Text>}
            </View>
        );
    },
);

const styles = StyleSheet.create({
    container: { width: '100%', gap: 4 },
    iconLeft: { marginRight: 8, justifyContent: 'center', height: 24, overflow: 'hidden' },
    iconRight: { justifyContent: 'center', height: 24, overflow: 'hidden' },
    inputContainer: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        width: '100%',
        height: INPUT_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: COLORS.lightColor,
    },
    input: { borderWidth: 0, width: '100%', flex: 1, paddingVertical: 6, ...TYPOGRAPHY.BODY },
    placeholderContainer: { position: 'absolute', pointerEvents: 'none', paddingHorizontal: 5 },
    placeholderBackground: { position: 'absolute', top: Platform.OS === 'ios' ? 3 : 0, left: 0, right: 0, height: '60%', zIndex: -1 },
    placeholder: { ...TYPOGRAPHY.BODY },
    requiredStar: { color: '#DB0032' },
    error: { ...TYPOGRAPHY.TAGS, color: COLORS.errorColor },
    passwordToggle: { padding: 8, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
});

export default Input;
