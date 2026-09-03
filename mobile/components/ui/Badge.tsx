// Badge – small tinted status label with a leading dot.
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from '../AppText';
import { colors, radius, spacing, typography } from '../../lib/theme';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'rose' | 'ink';

const TONE: Record<BadgeTone, { bg: string; text: string }> = {
    success: { bg: colors.successBg, text: colors.success },
    warning: { bg: colors.warningBg, text: colors.warning },
    danger: { bg: colors.dangerBg, text: colors.danger },
    neutral: { bg: colors.cream, text: colors.inkMuted },
    rose: { bg: colors.roseMist, text: colors.roseDeep },
    ink: { bg: colors.ink, text: colors.inkInverse },
};

export interface BadgeProps {
    label: string;
    tone?: BadgeTone;
    dot?: boolean;
    style?: StyleProp<ViewStyle>;
}

export function Badge({ label, tone = 'neutral', dot = true, style }: BadgeProps) {
    const t = TONE[tone];
    return (
        <View style={[styles.base, { backgroundColor: t.bg }, style]} accessible accessibilityLabel={label}>
            {dot && <View style={[styles.dot, { backgroundColor: t.text }]} />}
            <AppText style={[styles.label, { color: t.text }]}>{label}</AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.md,
        paddingVertical: 5,
        borderRadius: radius.full,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    label: {
        fontFamily: typography.fontFamily.semibold,
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 0.3,
    },
});

export default Badge;
