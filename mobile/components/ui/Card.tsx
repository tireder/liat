// Card – cream/card surface with hairline border. Optional press behaviour.
import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { PressableScale } from './PressableScale';
import { colors, radius, shadows, spacing } from '../../lib/theme';

export type CardTone = 'card' | 'cream' | 'blush' | 'ink' | 'transparent';

export interface CardProps {
    children?: ReactNode;
    tone?: CardTone;
    padding?: number;
    elevated?: boolean;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    haptic?: 'selection' | 'impact' | 'none';
}

const TONE: Record<CardTone, { bg: string; border: string }> = {
    card: { bg: colors.card, border: colors.line },
    cream: { bg: colors.cream, border: colors.cream },
    blush: { bg: colors.blush, border: colors.roseMist },
    ink: { bg: colors.ink, border: colors.ink },
    transparent: { bg: 'transparent', border: 'transparent' },
};

export function Card({
    children,
    tone = 'card',
    padding = spacing.lg,
    elevated = false,
    onPress,
    style,
    accessibilityLabel,
    accessibilityHint,
    haptic = 'selection',
}: CardProps) {
    const t = TONE[tone];
    const base = [
        styles.base,
        { backgroundColor: t.bg, borderColor: t.border, padding },
        elevated ? shadows.md : shadows.xs,
        style,
    ];

    if (onPress) {
        return (
            <PressableScale
                onPress={onPress}
                haptic={haptic}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                accessibilityHint={accessibilityHint}
                style={base}
            >
                {children}
            </PressableScale>
        );
    }

    return <View style={base}>{children}</View>;
}

const styles = StyleSheet.create({
    base: {
        borderRadius: radius.lg,
        borderWidth: 1,
    },
});

export default Card;
