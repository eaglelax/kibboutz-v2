import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (isDisabled) return COLORS.gray[300];
    switch (variant) {
      case 'primary':
        return COLORS.primary[500];
      case 'secondary':
        return COLORS.secondary[500];
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return COLORS.primary[500];
    }
  };

  const getTextColor = () => {
    if (isDisabled) return COLORS.gray[500];
    switch (variant) {
      case 'primary':
      case 'secondary':
        return COLORS.white;
      case 'outline':
        return COLORS.primary[500];
      case 'ghost':
        return COLORS.gray[700];
      default:
        return COLORS.white;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md };
      case 'lg':
        return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl };
      default:
        return { paddingVertical: SPACING.sm + 4, paddingHorizontal: SPACING.lg };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return 14;
      case 'lg':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: variant === 'outline' ? COLORS.primary[500] : undefined,
          ...getPadding(),
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? COLORS.primary[500] : COLORS.white}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getFontSize(),
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
  },
});
