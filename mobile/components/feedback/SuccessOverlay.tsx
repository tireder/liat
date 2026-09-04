// SuccessOverlay – "LacquerSweep": a rose lacquer stroke with a curved, glossy
// tip sweeps across the screen, lacquer droplets drift up behind it, a cream
// card springs in with the booked date in serif, and the check draws in with
// a pulse. Reduced motion → cross-fade to the finished state.
import React, { useEffect } from 'react';
import { Modal, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
    type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../AppText';
import { Button } from '../ui/Button';
import { useReducedMotion } from '../../lib/motion';
import { haptics } from '../../lib/haptics';
import { alpha, colors, radius, shadows, spacing, typography } from '../../lib/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK_LENGTH = 60;
const SWEEP_MS = 760;
const DRIFT_MS = 1900;
const DRIFT_START = 380;
const CARD_DELAY = 360;

export interface SuccessHighlight {
    label: string;
    value: string;
    caption?: string;
}

export interface SuccessOverlayProps {
    visible: boolean;
    title: string;
    subtitle?: string;
    eyebrow?: string;
    /** Big serif line on the card, e.g. the booked date */
    highlight?: SuccessHighlight;
    primaryAction: { label: string; onPress: () => void };
    secondaryAction?: { label: string; onPress: () => void };
    children?: React.ReactNode;
}

interface Droplet {
    x: number; // fraction of width
    y: number; // fraction of height
    size: number;
    color: string;
    start: number; // fraction of the drift timeline at which it appears
    rise: number;
    drift: number; // horizontal wobble in px
}

// Deterministic so the choreography is identical every time
const DROPLETS: Droplet[] = [
    { x: 0.14, y: 0.34, size: 16, color: colors.roseSoft, start: 0.0, rise: 150, drift: -10 },
    { x: 0.26, y: 0.2, size: 9, color: colors.peach, start: 0.12, rise: 120, drift: 8 },
    { x: 0.4, y: 0.42, size: 22, color: colors.nude, start: 0.05, rise: 180, drift: 6 },
    { x: 0.55, y: 0.16, size: 11, color: colors.roseMist, start: 0.22, rise: 130, drift: -12 },
    { x: 0.66, y: 0.36, size: 14, color: colors.peach, start: 0.08, rise: 160, drift: 10 },
    { x: 0.8, y: 0.24, size: 8, color: colors.beige, start: 0.3, rise: 110, drift: -6 },
    { x: 0.9, y: 0.44, size: 18, color: colors.roseSoft, start: 0.16, rise: 170, drift: -14 },
    { x: 0.2, y: 0.52, size: 7, color: colors.roseMist, start: 0.34, rise: 120, drift: 12 },
    { x: 0.48, y: 0.56, size: 12, color: colors.beige, start: 0.26, rise: 140, drift: -8 },
    { x: 0.74, y: 0.54, size: 10, color: colors.nude, start: 0.38, rise: 150, drift: 6 },
    { x: 0.34, y: 0.1, size: 6, color: colors.roseSoft, start: 0.42, rise: 100, drift: 4 },
    { x: 0.6, y: 0.06, size: 9, color: colors.peach, start: 0.2, rise: 90, drift: -5 },
];

function DropletView({ d, progress, width, height }: { d: Droplet; progress: SharedValue<number>; width: number; height: number }) {
    const style = useAnimatedStyle(() => {
        const p = interpolate(progress.value, [d.start, 1], [0, 1], Extrapolation.CLAMP);
        const eased = 1 - (1 - p) * (1 - p);
        return {
            opacity: interpolate(p, [0, 0.12, 0.7, 1], [0, 1, 0.85, 0], Extrapolation.CLAMP),
            transform: [
                { translateY: -d.rise * eased },
                { translateX: d.drift * Math.sin(p * Math.PI) },
                { scale: interpolate(p, [0, 0.18, 1], [0.3, 1, 0.8], Extrapolation.CLAMP) },
            ],
        };
    });
    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.droplet,
                { left: d.x * width - d.size / 2, top: d.y * height, width: d.size, height: d.size, borderRadius: d.size / 2, backgroundColor: d.color },
                style,
            ]}
        >
            <View style={[styles.dropletGloss, { width: d.size * 0.35, height: d.size * 0.35, borderRadius: d.size }]} />
        </Animated.View>
    );
}

export function SuccessOverlay({ visible, title, subtitle, eyebrow, highlight, primaryAction, secondaryAction, children }: SuccessOverlayProps) {
    const reduced = useReducedMotion();
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const tipRadius = Math.min(width * 0.55, height * 0.28);

    const sweep = useSharedValue(0);
    const drift = useSharedValue(0);
    const card = useSharedValue(0);
    const badge = useSharedValue(0);
    const check = useSharedValue(0);
    const pulse = useSharedValue(0);

    useEffect(() => {
        if (!visible) {
            sweep.value = 0;
            drift.value = 0;
            card.value = 0;
            badge.value = 0;
            check.value = 0;
            pulse.value = 0;
            return;
        }
        if (reduced) {
            sweep.value = withTiming(1, { duration: 200 });
            drift.value = 1;
            card.value = withTiming(1, { duration: 200 });
            badge.value = withTiming(1, { duration: 200 });
            check.value = withTiming(1, { duration: 200 });
            pulse.value = 1;
            haptics.notify('success');
            return;
        }
        haptics.impact('light');
        sweep.value = withTiming(1, { duration: SWEEP_MS, easing: Easing.bezier(0.2, 0.9, 0.3, 1) });
        drift.value = withDelay(DRIFT_START, withTiming(1, { duration: DRIFT_MS, easing: Easing.linear }));
        card.value = withDelay(CARD_DELAY, withSpring(1, { damping: 17, stiffness: 150, mass: 0.9 }));
        badge.value = withDelay(CARD_DELAY + 260, withSpring(1, { damping: 12, stiffness: 220 }));
        check.value = withDelay(CARD_DELAY + 420, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
        pulse.value = withDelay(CARD_DELAY + 520, withTiming(1, { duration: 720, easing: Easing.out(Easing.quad) }));
        const t = setTimeout(() => haptics.notify('success'), CARD_DELAY + 480);
        return () => clearTimeout(t);
    }, [visible, reduced, sweep, drift, card, badge, check, pulse]);

    const sweepStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: (1 - sweep.value) * width * 1.7 }],
        opacity: sweep.value === 0 ? 0 : 1,
    }));
    const glossStyle = useAnimatedStyle(() => ({
        opacity: interpolate(sweep.value, [0, 0.1, 0.85, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
    }));
    const cardStyle = useAnimatedStyle(() => ({
        opacity: interpolate(card.value, [0, 0.4, 1], [0, 1, 1], Extrapolation.CLAMP),
        transform: [{ translateY: (1 - card.value) * 48 }, { scale: 0.94 + card.value * 0.06 }],
    }));
    const badgeStyle = useAnimatedStyle(() => ({
        transform: [{ scale: interpolate(badge.value, [0, 1], [0.5, 1], Extrapolation.CLAMP) }],
        opacity: interpolate(badge.value, [0, 0.3, 1], [0, 1, 1], Extrapolation.CLAMP),
    }));
    const pulseStyle = useAnimatedStyle(() => ({
        opacity: interpolate(pulse.value, [0, 0.1, 1], [0, 0.55, 0], Extrapolation.CLAMP),
        transform: [{ scale: 1 + pulse.value * 1.1 }],
    }));
    const checkProps = useAnimatedProps(() => ({
        strokeDashoffset: CHECK_LENGTH * (1 - check.value),
    }));

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={primaryAction.onPress}>
            <View style={styles.root} accessibilityViewIsModal>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.roseMist }]} />

                {/* Lacquer stroke with a curved tip and a wet highlight on its leading edge */}
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.stroke,
                        { top: -height * 0.3, bottom: -height * 0.3, right: -width * 0.6, borderTopLeftRadius: tipRadius, borderBottomLeftRadius: tipRadius },
                        sweepStyle,
                    ]}
                >
                    <LinearGradient
                        colors={[colors.roseSoft, colors.rose, colors.roseDeep]}
                        start={{ x: 0, y: 0.15 }}
                        end={{ x: 1, y: 0.85 }}
                        style={StyleSheet.absoluteFill}
                    />
                    <Animated.View style={[styles.gloss, glossStyle]}>
                        <LinearGradient
                            colors={[alpha(colors.white, 0.55), alpha(colors.white, 0.18), alpha(colors.white, 0)]}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                    <LinearGradient
                        colors={[alpha(colors.white, 0.22), alpha(colors.white, 0)]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 0.5 }}
                        style={StyleSheet.absoluteFill}
                        pointerEvents="none"
                    />
                </Animated.View>

                {!reduced ? DROPLETS.map((d, i) => <DropletView key={i} d={d} progress={drift} width={width} height={height} />) : null}

                <Animated.View style={[styles.card, { marginBottom: insets.bottom + spacing.xl }, cardStyle]}>
                    <View style={styles.badgeWrap}>
                        <Animated.View style={[styles.pulse, pulseStyle]} pointerEvents="none" />
                        <Animated.View style={[styles.checkWrap, badgeStyle]}>
                            <Svg width={40} height={40} viewBox="0 0 40 40">
                                <AnimatedPath
                                    d="M9 21 L17 29 L31 12"
                                    stroke={colors.inkInverse}
                                    strokeWidth={3.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                    strokeDasharray={CHECK_LENGTH}
                                    animatedProps={checkProps}
                                />
                            </Svg>
                        </Animated.View>
                    </View>
                    {eyebrow ? (
                        <AppText variant="eyebrow" tone="roseDeep" align="center" style={styles.eyebrow}>
                            {eyebrow}
                        </AppText>
                    ) : null}
                    <AppText variant="display" align="center" accessibilityRole="header" accessibilityLiveRegion="polite">
                        {title}
                    </AppText>
                    {subtitle ? (
                        <AppText variant="body" tone="muted" align="center" style={styles.subtitle}>
                            {subtitle}
                        </AppText>
                    ) : null}
                    {highlight ? (
                        <View style={styles.highlight}>
                            <AppText variant="eyebrow" tone="soft" align="center" style={styles.highlightLabel}>
                                {highlight.label}
                            </AppText>
                            <AppText style={styles.highlightValue} align="center" maxFontSizeMultiplier={1.15}>
                                {highlight.value}
                            </AppText>
                            {highlight.caption ? (
                                <AppText variant="body-sm" tone="muted" align="center">
                                    {highlight.caption}
                                </AppText>
                            ) : null}
                        </View>
                    ) : null}
                    {children}
                    <View style={styles.actions}>
                        <Button label={primaryAction.label} size="lg" fullWidth onPress={primaryAction.onPress} />
                        {secondaryAction ? (
                            <Button label={secondaryAction.label} variant="secondary" fullWidth onPress={secondaryAction.onPress} />
                        ) : null}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: spacing.lg,
    },
    stroke: {
        position: 'absolute',
        left: 0,
        overflow: 'hidden',
        ...shadows.lg,
    },
    gloss: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: 72,
    },
    droplet: {
        position: 'absolute',
        ...shadows.xs,
    },
    dropletGloss: {
        position: 'absolute',
        top: '18%',
        left: '18%',
        backgroundColor: alpha(colors.white, 0.75),
    },
    card: {
        backgroundColor: colors.bg,
        borderRadius: radius.xl,
        padding: spacing.xl,
        paddingTop: spacing['2xl'],
        alignItems: 'center',
        ...shadows.lg,
    },
    badgeWrap: {
        width: 72,
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    pulse: {
        position: 'absolute',
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 2,
        borderColor: colors.rose,
    },
    checkWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.ink,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: colors.roseSoft,
    },
    eyebrow: {
        textTransform: 'uppercase',
        marginBottom: spacing.xs,
    },
    subtitle: {
        marginTop: spacing.sm,
    },
    highlight: {
        alignSelf: 'stretch',
        alignItems: 'center',
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.lineStrong,
        borderStyle: 'dashed',
        gap: 2,
    },
    highlightLabel: {
        textTransform: 'uppercase',
    },
    highlightValue: {
        fontFamily: typography.fontFamily.display,
        fontSize: 28,
        lineHeight: 34,
        color: colors.ink,
    },
    actions: {
        alignSelf: 'stretch',
        gap: spacing.sm,
        marginTop: spacing.xl,
    },
});

export default SuccessOverlay;
