// QuickActions – three primary shortcuts.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../AppText';
import { PressableScale } from '../ui/PressableScale';
import { Icon, IconName } from '../ui/Icon';
import { colors, radius, spacing, typography } from '../../lib/theme';

interface Action {
    icon: IconName;
    label: string;
    onPress: () => void;
    primary?: boolean;
}

export function QuickActions({ actions }: { actions: Action[] }) {
    return (
        <View style={styles.row}>
            {actions.map((a) => (
                <PressableScale
                    key={a.label}
                    onPress={a.onPress}
                    haptic="impact"
                    accessibilityRole="button"
                    accessibilityLabel={a.label}
                    style={[styles.item, a.primary ? styles.itemPrimary : null]}
                >
                    <View style={[styles.iconWrap, a.primary ? styles.iconWrapPrimary : null]}>
                        <Icon name={a.icon} size={22} color={a.primary ? colors.inkInverse : colors.roseDeep} />
                    </View>
                    <AppText style={[styles.label, a.primary ? styles.labelPrimary : null]} numberOfLines={1}>{a.label}</AppText>
                </PressableScale>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.lg,
        borderRadius: radius.lg,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.line,
    },
    itemPrimary: {
        backgroundColor: colors.ink,
        borderColor: colors.ink,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.roseMist,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapPrimary: {
        backgroundColor: 'rgba(251,248,245,0.14)',
    },
    label: {
        fontFamily: typography.fontFamily.medium,
        fontSize: 13,
        lineHeight: 18,
        color: colors.ink,
    },
    labelPrimary: {
        color: colors.inkInverse,
    },
});

export default QuickActions;
