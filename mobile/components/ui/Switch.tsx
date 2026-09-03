// Switch – settings row with an animated toggle (accessible as a switch).
import React, { useEffect } from 'react';
import { I18nManager, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { AppText } from '../AppText';
import { Icon, IconName } from './Icon';
import { haptics } from '../../lib/haptics';
import { colors, radius, spacing } from '../../lib/theme';

export interface SwitchRowProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    icon?: IconName;
    title: string;
    description?: string;
    disabled?: boolean;
}

const TRACK_W = 50;
const THUMB = 24;

export function SwitchRow({ value, onValueChange, icon, title, description, disabled }: SwitchRowProps) {
    const progress = useSharedValue(value ? 1 : 0);

    useEffect(() => {
        progress.value = withSpring(value ? 1 : 0, { damping: 16, stiffness: 200 });
    }, [value, progress]);

    const thumbStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: progress.value * (TRACK_W - THUMB - 4) * (I18nManager.isRTL ? -1 : 1) }],
    }));
    const trackStyle = useAnimatedStyle(() => ({
        backgroundColor: progress.value > 0.5 ? colors.ink : colors.lineStrong,
    }));

    return (
        <Pressable
            style={[styles.row, disabled ? styles.disabled : null]}
            onPress={() => {
                if (disabled) return;
                haptics.selection();
                onValueChange(!value);
            }}
            disabled={disabled}
            accessibilityRole="switch"
            accessibilityLabel={title}
            accessibilityHint={description}
            accessibilityState={{ checked: value, disabled }}
        >
            {icon ? (
                <View style={styles.icon}>
                    <Icon name={icon} size={20} tone="roseDeep" />
                </View>
            ) : null}
            <View style={styles.text}>
                <AppText variant="body" style={styles.title}>{title}</AppText>
                {description ? (
                    <AppText variant="body-sm" tone="muted">{description}</AppText>
                ) : null}
            </View>
            <Animated.View style={[styles.track, trackStyle]}>
                <Animated.View style={[styles.thumb, thumbStyle]} />
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        minHeight: 56,
    },
    disabled: {
        opacity: 0.5,
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: radius.sm,
        backgroundColor: colors.roseMist,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        flex: 1,
        gap: 2,
    },
    title: {
        fontFamily: 'Heebo_500Medium',
    },
    track: {
        width: TRACK_W,
        height: 28,
        borderRadius: radius.full,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    thumb: {
        width: THUMB,
        height: THUMB,
        borderRadius: THUMB / 2,
        backgroundColor: colors.card,
        shadowColor: '#3c2820',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
});

export default SwitchRow;
