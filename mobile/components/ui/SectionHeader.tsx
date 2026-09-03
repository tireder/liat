// SectionHeader – eyebrow + serif title, optional trailing action.
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from '../AppText';
import { PressableScale } from './PressableScale';
import { Chevron } from './Icon';
import { colors, spacing } from '../../lib/theme';

export interface SectionHeaderProps {
    title: string;
    eyebrow?: string;
    action?: { label: string; onPress: () => void };
    style?: StyleProp<ViewStyle>;
}

export function SectionHeader({ title, eyebrow, action, style }: SectionHeaderProps) {
    return (
        <View style={[styles.row, style]}>
            <View style={styles.text}>
                {eyebrow ? (
                    <AppText variant="eyebrow" tone="roseDeep" style={styles.eyebrow}>
                        {eyebrow}
                    </AppText>
                ) : null}
                <AppText variant="display-sm" accessibilityRole="header">
                    {title}
                </AppText>
            </View>
            {action ? (
                <PressableScale
                    onPress={action.onPress}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                    style={styles.action}
                >
                    <AppText variant="body-sm" tone="roseDeep" style={styles.actionText}>
                        {action.label}
                    </AppText>
                    <Chevron direction="forward" size={14} tone="roseDeep" />
                </PressableScale>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    text: {
        flex: 1,
        gap: 2,
    },
    eyebrow: {
        textTransform: 'uppercase',
        color: colors.roseDeep,
    },
    action: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        minHeight: 44,
        paddingHorizontal: spacing.xs,
    },
    actionText: {
        fontFamily: 'Heebo_500Medium',
    },
});

export default SectionHeader;
