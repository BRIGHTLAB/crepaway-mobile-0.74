import React, { forwardRef, JSX, useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
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
  multiline?: boolean;
  lines?: number;
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
      multiline,
      lines,
      secureTextEntry,
      ...rest
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    // animation value: 1 means unfocused (or empty), 0 means focused or has a value
    const animation = useSharedValue(rest.value ? 0 : 1);

    // Shared value for placeholder position animation
    const placeholderPosition = useSharedValue(iconLeft ? 38 : 10);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        top: interpolate(animation.value, [0, 1], [-13, INPUT_HEIGHT / 2 - 12]),
        fontSize: interpolate(animation.value, [0, 1], [12, 16]),
      };
    });

    useEffect(() => {
      if (rest.value) {
        animation.value = withTiming(0, { duration: 200 });
        if (iconLeft) {
          placeholderPosition.value = withTiming(10, { duration: 200 });
        }
      } else {
        if (!isFocused) {
          animation.value = withTiming(1, { duration: 200 });
          if (iconLeft) {
            placeholderPosition.value = withTiming(38, { duration: 200 });
          }
        }
      }
    }, [rest.value, animation, placeholderPosition, iconLeft, isFocused]);

    const leftIconAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: animation.value,
        width: animation.value * 24,
        marginRight: animation.value * 8,
      };
    });

    const placeholderPositionStyle = useAnimatedStyle(() => {
      return {
        left: placeholderPosition.value,
      };
    });

    const handleFocus = (event: any) => {
      onFocus && onFocus(event);
      setIsFocused(true);
      animation.value = withTiming(0, { duration: 200 });

      if (iconLeft) {
        placeholderPosition.value = withTiming(10, { duration: 200 });
      }
    };

    const handleBlur = (event: any) => {
      onBlur && onBlur(event);
      setIsFocused(false);

      if (!rest.value) {
        animation.value = withTiming(1, { duration: 200 });
        if (iconLeft) {
          placeholderPosition.value = withTiming(38, { duration: 200 });
        }
      }
    };

    // Update animation when value changes
    React.useEffect(() => {
      if (rest.value) {
        animation.value = withTiming(0, { duration: 200 });
        if (iconLeft) {
          placeholderPosition.value = withTiming(10, { duration: 200 });
        }
      }
    }, [rest.value]);

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(prev => !prev);
    };

    const showPasswordToggle = secureTextEntry !== undefined;

    return (
      <View style={styles.container}>
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: error ? COLORS.errorColor : COLORS.borderColor,
            },
          ]}>
          {iconLeft && (
            <Animated.View style={[styles.iconLeft, leftIconAnimatedStyle]}>
              {iconLeft}
            </Animated.View>
          )}
          <View style={{ flex: 1 }}>
            <TextInput
              ref={ref}
              style={[styles.input, iconLeft && { paddingLeft: 0 }]}
              onFocus={handleFocus}
              onBlur={handleBlur}
              blurOnSubmit={false}
              editable={!disabled}
              secureTextEntry={secureTextEntry && !isPasswordVisible}
              multiline={multiline}
              numberOfLines={lines}
              {...rest}
            />
          </View>
          {showPasswordToggle && (
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={togglePasswordVisibility}
              activeOpacity={0.7}>
              {isPasswordVisible ? <Icon_Eye_Line /> : <Icon_Eye />}
            </TouchableOpacity>
          )}
          {iconRight && <View style={[styles.iconRight]}>{iconRight}</View>}
          {placeholder && (
            <Animated.View
              style={[
                styles.placeholderContainer,
                placeholderPositionStyle,
                animatedStyle,
              ]}>
              {/* New background view covering top half */}
              <View
                style={[
                  styles.placeholderBackground,
                  {
                    backgroundColor:
                      isFocused || rest.value ? 'white' : 'transparent',
                  },
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
  container: {
    width: '100%',
    gap: 4,
  },
  iconLeft: {
    marginRight: 8,
    justifyContent: 'center',
    height: 24,
    overflow: 'hidden',
  },
  iconRight: {
    justifyContent: 'center',
    height: 24,
    overflow: 'hidden',
  },
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
  input: {
    borderWidth: 0,
    width: '100%',
    flex: 1,
    paddingVertical: 6,
    ...TYPOGRAPHY.BODY,
  },
  placeholderContainer: {
    position: 'absolute',
    pointerEvents: 'none',
    paddingHorizontal: 5,
  },
  placeholderBackground: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 3 : 0,
    left: 0,
    right: 0,
    height: '60%',
    zIndex: -1,
  },
  placeholder: {
    ...TYPOGRAPHY.BODY,
    // transform: [{translateY: 10}],
  },
  requiredStar: {
    color: '#DB0032',
  },
  error: {
    ...TYPOGRAPHY.TAGS,
    color: COLORS.errorColor,
  },
  passwordToggle: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
});

export default Input;