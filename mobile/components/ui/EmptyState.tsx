// EmptyState – composed "nothing here yet" view with an optional action.
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from '../AppText';
import { Button } from './Button';
import { Icon, IconName } from './Icon';
import { colors, spacing } from '../../lib/theme';

export interface EmptyStateProps {
    icon?: IconName;
    title: string;
    body?: string;
    action?: { label: string; onPress: () => void; icon?: IconName };
    secondaryAction?: { label: string; onPress: () => void };
    style?: StyleProp<ViewStyle>;
    compact?: boolean;
}

export function EmptyState({ icon = 'sparkles-outline', title, body, action, secondaryAction, style, compact }: EmptyStateProps) {
    return (
        <View style={[styles.container, compact ? styles.compact : null, style]}>
            <View style={styles.iconWrap}>
                <View style={styles.iconHalo} />
                <Icon name={icon} size={28} tone="roseDeep" />
            </View>
            <AppText variant="display-sm" align="center" style={styles.title} accessibilityRole="header">
                {title}
            </AppText>
            {body ? (
                <AppText variant="body" tone="muted" align="center" style={styles.body}>
                    {body}
                </AppText>
            ) : null}
            {action ? (
                <Button label={action.label} icon={action.icon} onPress={action.onPress} style={styles.action} />
            ) : null}
            {secondaryAction ? (
                <Button label={secondaryAction.label} variant="text" onPress={secondaryAction.onPress} />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: spacing['3xl'],
        paddingHorizontal: spacing.xl,
    },
    compact: {
        paddingVertical: spacing.xl,
    },
    iconWrap: {
        width: 72,
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    iconHalo: {
        position: 'absolute',
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.roseMist,
    },
    title: {
        color: colors.ink,
        marginBottom: spacing.sm,
    },
    body: {
        maxWidth: 300,
        marginBottom: spacing.xl,
    },
    action: {
        marginBottom: spacing.sm,
    },
});

export default EmptyState;
