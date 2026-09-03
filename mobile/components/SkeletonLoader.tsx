// Skeleton loaders – content-shaped placeholders in the cream palette.
import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { colors, spacing, radius, layout } from '../lib/theme';
import { useReducedMotion } from '../lib/motion';

interface SkeletonBlockProps {
    width: DimensionValue;
    height: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function SkeletonBlock({ width, height, borderRadius = radius.sm, style }: SkeletonBlockProps) {
    const reduced = useReducedMotion();
    const opacity = useSharedValue(0.55);

    useEffect(() => {
        if (reduced) {
            opacity.value = 0.6;
            return;
        }
        opacity.value = withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0.55, { duration: 700 })), -1, true);
    }, [reduced, opacity]);

    const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return (
        <Animated.View
            style={[{ width, height, borderRadius, backgroundColor: colors.cream }, animated, style]}
            accessible={false}
            importantForAccessibility="no"
        />
    );
}

function CardShell({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
    return <View style={[s.card, style]}>{children}</View>;
}

export function HomeScreenSkeleton() {
    return (
        <View style={s.container} accessibilityLabel="טוען" accessible>
            <SkeletonBlock width="100%" height={240} borderRadius={radius.lg} />
            <CardShell style={{ marginTop: -40, marginHorizontal: spacing.md }}>
                <SkeletonBlock width="55%" height={22} />
                <SkeletonBlock width="35%" height={16} style={{ marginTop: spacing.sm }} />
                <View style={s.row}>
                    <SkeletonBlock width="30%" height={40} borderRadius={radius.full} />
                    <SkeletonBlock width="30%" height={40} borderRadius={radius.full} />
                </View>
            </CardShell>
            <View style={[s.row, { marginTop: spacing.xl }]}>
                <SkeletonBlock width="31%" height={84} borderRadius={radius.md} />
                <SkeletonBlock width="31%" height={84} borderRadius={radius.md} />
                <SkeletonBlock width="31%" height={84} borderRadius={radius.md} />
            </View>
            <SkeletonBlock width="45%" height={24} style={{ marginTop: spacing.xl }} />
            <View style={s.row}>
                <SkeletonBlock width={120} height={150} borderRadius={radius.md} />
                <SkeletonBlock width={120} height={150} borderRadius={radius.md} />
                <SkeletonBlock width={120} height={150} borderRadius={radius.md} />
            </View>
        </View>
    );
}

export function AppointmentsSkeleton() {
    return (
        <View style={s.container} accessibilityLabel="טוען" accessible>
            {[0, 1, 2].map((i) => (
                <CardShell key={i}>
                    <View style={[s.row, { justifyContent: 'space-between' }]}>
                        <SkeletonBlock width="50%" height={22} />
                        <SkeletonBlock width={72} height={24} borderRadius={radius.full} />
                    </View>
                    <SkeletonBlock width="70%" height={16} style={{ marginTop: spacing.md }} />
                    <SkeletonBlock width="40%" height={16} style={{ marginTop: spacing.xs }} />
                </CardShell>
            ))}
        </View>
    );
}

export function BookingSkeleton() {
    return (
        <View style={s.container} accessibilityLabel="טוען" accessible>
            <SkeletonBlock width="100%" height={4} borderRadius={2} />
            <SkeletonBlock width="50%" height={28} style={{ marginTop: spacing.xl }} />
            {[0, 1, 2].map((i) => (
                <CardShell key={i}>
                    <View style={[s.row, { alignItems: 'center' }]}>
                        <SkeletonBlock width={22} height={22} borderRadius={11} />
                        <View style={{ flex: 1, gap: spacing.sm }}>
                            <SkeletonBlock width="60%" height={20} />
                            <SkeletonBlock width="90%" height={14} />
                        </View>
                    </View>
                </CardShell>
            ))}
        </View>
    );
}

export function GallerySkeleton() {
    return (
        <View style={[s.container, s.grid]} accessibilityLabel="טוען" accessible>
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <SkeletonBlock key={i} width="48%" height={i % 3 === 0 ? 210 : 170} borderRadius={radius.md} />
            ))}
        </View>
    );
}

export function CoursesSkeleton() {
    return (
        <View style={s.container} accessibilityLabel="טוען" accessible>
            {[0, 1].map((i) => (
                <CardShell key={i}>
                    <SkeletonBlock width="100%" height={140} borderRadius={radius.md} />
                    <SkeletonBlock width="60%" height={24} style={{ marginTop: spacing.md }} />
                    <SkeletonBlock width="90%" height={16} style={{ marginTop: spacing.sm }} />
                    <View style={[s.row, { marginTop: spacing.md }]}>
                        <SkeletonBlock width={90} height={18} />
                        <SkeletonBlock width={90} height={18} />
                    </View>
                </CardShell>
            ))}
        </View>
    );
}

export function CourseDetailSkeleton() {
    return (
        <View style={s.container} accessibilityLabel="טוען" accessible>
            <SkeletonBlock width="100%" height={260} borderRadius={radius.lg} />
            <CardShell>
                <SkeletonBlock width="40%" height={16} />
                <SkeletonBlock width="80%" height={20} style={{ marginTop: spacing.sm }} />
                <SkeletonBlock width="60%" height={20} style={{ marginTop: spacing.sm }} />
            </CardShell>
            <CardShell>
                <SkeletonBlock width="100%" height={16} />
                <SkeletonBlock width="95%" height={16} style={{ marginTop: spacing.xs }} />
                <SkeletonBlock width="70%" height={16} style={{ marginTop: spacing.xs }} />
            </CardShell>
        </View>
    );
}

export function ProfileSkeleton() {
    return (
        <View style={s.container} accessibilityLabel="טוען" accessible>
            {[0, 1, 2].map((i) => (
                <CardShell key={i}>
                    <SkeletonBlock width="35%" height={16} />
                    <View style={[s.row, { alignItems: 'center', marginTop: spacing.md }]}>
                        <SkeletonBlock width={40} height={40} borderRadius={radius.sm} />
                        <SkeletonBlock width="50%" height={18} />
                        <View style={{ flex: 1 }} />
                        <SkeletonBlock width={50} height={28} borderRadius={radius.full} />
                    </View>
                </CardShell>
            ))}
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        padding: spacing.lg,
        paddingBottom: layout.tabBarSpace,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: spacing.md,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.line,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },
});
