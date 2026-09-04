// StepProgress – "שלב 2 מתוך 4 · תאריך ושעה" with an animated ink bar.
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AppText } from '../AppText';
import { colors, motion, radius, spacing } from '../../lib/theme';
import { LRM } from '../../lib/format';

interface StepProgressProps {
    labels: string[];
    index: number;
}

export function StepProgress({ labels, index }: StepProgressProps) {
    const total = labels.length;
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming((index + 1) / Math.max(total, 1), { duration: motion.base, easing: motion.easing });
    }, [index, total, progress]);

    const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

    return (
        <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={`שלב ${index + 1} מתוך ${total}: ${labels[index]}`}>
            <View style={styles.row}>
                <AppText variant="eyebrow" tone="soft" style={styles.counter}>
                    שלב {LRM}{index + 1}{LRM} מתוך {LRM}{total}{LRM}
                </AppText>
                <AppText variant="body-sm" style={styles.label}>{labels[index]}</AppText>
            </View>
            <View style={styles.track}>
                <Animated.View style={[styles.fill, fill]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    counter: {
        letterSpacing: 0.4,
    },
    label: {
        fontFamily: 'Heebo_600SemiBold',
        color: colors.ink,
    },
    track: {
        height: 3,
        backgroundColor: colors.line,
        borderRadius: radius.full,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    fill: {
        height: '100%',
        backgroundColor: colors.ink,
        borderRadius: radius.full,
    },
});

export default StepProgress;
