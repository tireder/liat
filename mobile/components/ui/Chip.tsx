// Chip – selectable pill (filters, days, time slots).
import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from '../AppText';
import { PressableScale } from './PressableScale';
import { colors, radius, spacing, typography } from '../../lib/theme';

export interface ChipProps {
    label: string;
    selected?: boolean;
    disabled?: boolean;
    onPress?: () => void;
    leading?: ReactNode;
    size?: 'sm' | 'md';
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
    ltr?: boolean;
}

export function Chip({ label, selected = false, disabled = false, onPress, leading, size = 'md', style, accessibilityLabel, ltr }: ChipProps) {
    return (
        <PressableScale
            onPress={onPress}
            disabled={disabled}
            haptic="selection"
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || label}
            accessibilityState={{ selected, disabled }}
            style={[
                styles.base,
                size === 'sm' ? styles.sm : styles.md,
                selected ? styles.selected : null,
                style,
            ]}
        >
            <View style={styles.inner}>
                {leading}
                <AppText
                    style={[
                        styles.label,
                        size === 'sm' ? styles.labelSm : null,
                        { color: selected ? colors.inkInverse : colors.ink },
                        ltr ? { writingDirection: 'ltr' } : null,
                    ]}
                >
                    {label}
                </AppText>
            </View>
        </PressableScale>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: radius.full,
        borderWidth: 1.5,
        borderColor: colors.lineStrong,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    md: {
        minHeight: 44,
        paddingHorizontal: spacing.lg,
    },
    sm: {
        minHeight: 36,
        paddingHorizontal: spacing.md,
    },
    selected: {
        backgroundColor: colors.ink,
        borderColor: colors.ink,
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    label: {
        fontFamily: typography.fontFamily.medium,
        fontSize: 15,
        lineHeight: 20,
    },
    labelSm: {
        fontSize: 13,
        lineHeight: 18,
    },
});

export default Chip;
