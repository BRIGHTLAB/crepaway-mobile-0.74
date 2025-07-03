import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS } from '../../theme';
import LinearGradient from 'react-native-linear-gradient';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'accent';
type ButtonSize = 'small' | 'medium' | 'large';
type IconPosition = 'left' | 'right';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  size?: ButtonSize;
  textSize?: 'small' | 'medium' | 'large';
  backgroundColor?: string;
  textColor?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  icon,
  iconPosition = 'left',
  size = 'medium',
  textColor,
  textSize = 'medium',
  style,
  disabled,
  ...props
}) => {
  // Determine style for non-primary variants
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'accent':
        return styles.accent;
      default:
        return {};
    }
  };

  // Determine size-based wrapper style
  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  // Determine text color
  const getTextColor = (): TextStyle => {
    if (textColor) return { color: textColor };
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      case 'secondary':
        return styles.secondaryText;
      default:
        return styles.primaryText;
    }
  };

  // Render either the spinner or content
  const renderContent = () =>
    isLoading ? (
      <ActivityIndicator
        color={getTextColor().color || '#fff'}
        size={size === 'large' ? 24 : 20}
      />
    ) : (
      <>
        {icon && iconPosition === 'left' && icon}
        <Text style={[styles.text, getTextColor(), !icon && { width: '100%' }]}>
          {children}
        </Text>
        {icon && iconPosition === 'right' && icon}
      </>
    );

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || isLoading}
      style={[styles.buttonContainer, style]}
      {...props}
    >
      {variant === 'primary' ? (
        <View
          style={[
            getSizeStyle(),
            styles.button,
            (disabled || isLoading) && styles.disabled,
          ]}
        >
          {/* Gradient background absolutely positioned */}
          <LinearGradient
            colors={COLORS.primaryGradient}
            style={StyleSheet.absoluteFill}
          />
          {renderContent()}
        </View>
      ) : (
        <View
          style={[
            getSizeStyle(),
            styles.button,
            getVariantStyle(),
            (disabled || isLoading) && styles.disabled,
          ]}
        >
          {renderContent()}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
  },
  button: {
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 8,
  },
  // Explicit heights ensure the gradient doesn't collapse on iOS
  small: {
    height: 32,
    paddingHorizontal: 16,
  },
  medium: {
    height: 48,
    paddingHorizontal: 24,
  },
  large: {
    height: 56,
    paddingHorizontal: 32,
  },
  // Non-primary variants
  secondary: {
    backgroundColor: COLORS.secondaryColor,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primaryColor,
  },
  accent: {
    backgroundColor: COLORS.accentColor,
  },
  // Text
  text: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#fff',
  },
  outlineText: {
    color: COLORS.primaryColor,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Button;
