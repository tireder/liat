// Button – ink primary, quiet secondary, rose accent, danger and ghost variants.
import React, { ReactNode } from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from '../AppText';
import { PressableScale } from './PressableScale';
import { Icon, IconName } from './Icon';
import { colors, radius, shadows, spacing, typography } from '../../lib/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'rose' | 'danger' | 'light' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
    label: string;
    onPress?: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: IconName;
    iconPosition?: 'start' | 'end';
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    haptic?: 'selection' | 'impact' | 'none';
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    children?: ReactNode;
}

const HEIGHT: Record<ButtonSize, number> = { sm: 40, md: 50, lg: 56 };
const PAD: Record<ButtonSize, number> = { sm: spacing.md, md: spacing.xl, lg: spacing['2xl'] };
const FONT: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 17 };

export function Button({
    label,
    onPress,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'start',
    loading = false,
    disabled = false,
    fullWidth = false,
    haptic = 'impact',
    style,
    accessibilityLabel,
    accessibilityHint,
}: ButtonProps) {
    const isDisabled = disabled || loading;
    const palette = VARIANTS[variant];

    const iconEl = icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} color={palette.text} /> : null;

    return (
        <PressableScale
            onPress={onPress}
            disabled={isDisabled}
            haptic={haptic}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || label}
            accessibilityHint={accessibilityHint}
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            style={[
                styles.base,
                { height: HEIGHT[size], paddingHorizontal: PAD[size], backgroundColor: palette.bg, borderColor: palette.border },
                variant === 'primary' && !isDisabled ? shadows.ink : null,
                variant === 'rose' && !isDisabled ? shadows.rose : null,
                variant === 'text' ? styles.textVariant : null,
                fullWidth ? styles.fullWidth : null,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={palette.text} />
            ) : (
                <View style={styles.content}>
                    {iconPosition === 'start' && iconEl}
                    <AppText
                        style={[styles.label, { color: palette.text, fontSize: FONT[size] }]}
                        numberOfLines={1}
                    >
                        {label}
                    </AppText>
                    {iconPosition === 'end' && iconEl}
                </View>
            )}
        </PressableScale>
    );
}

const VARIANTS: Record<ButtonVariant, { bg: string; text: string; border: string }> = {
    primary: { bg: colors.ink, text: colors.inkInverse, border: colors.ink },
    secondary: { bg: 'transparent', text: colors.ink, border: colors.lineStrong },
    ghost: { bg: colors.roseMist, text: colors.roseDeep, border: colors.roseMist },
    rose: { bg: colors.rose, text: colors.white, border: colors.rose },
    danger: { bg: colors.dangerBg, text: colors.danger, border: colors.dangerBg },
    light: { bg: colors.card, text: colors.ink, border: colors.card },
    text: { bg: 'transparent', text: colors.roseDeep, border: 'transparent' },
};

const styles = StyleSheet.create({
    base: {
        borderRadius: radius.full,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
    },
    fullWidth: {
        alignSelf: 'stretch',
    },
    textVariant: {
        height: undefined,
        minHeight: 44,
        paddingHorizontal: spacing.sm,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    label: {
        fontFamily: typography.fontFamily.medium,
        lineHeight: 22,
    },
});

export default Button;
