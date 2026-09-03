// SuccessOverlay – "PaintReveal": a wide lacquer brush stroke snakes across the
// screen and paints it row by row (a wet-gloss highlight trails behind it),
// then a cream card rises and a check stroke draws in.
// Reduced motion → plain cross-fade.
import React, { useEffect, useMemo } from 'react';
import { Modal, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
    Easing,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../AppText';
import { Button } from '../ui/Button';
import { useReducedMotion } from '../../lib/motion';
import { haptics } from '../../lib/haptics';
import { alpha, colors, radius, shadows, spacing } from '../../lib/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK_LENGTH = 60;
const PAINT_MS = 1500;
const CARD_DELAY = 1150;

export interface SuccessOverlayProps {
    visible: boolean;
    title: string;
    subtitle?: string;
    eyebrow?: string;
    primaryAction: { label: string; onPress: () => void };
    secondaryAction?: { label: string; onPress: () => void };
    children?: React.ReactNode;
}

/**
 * A snake path of horizontal brush strokes. Turns happen off-screen so every
 * visible stroke is one straight painted band. Starts on the right (RTL).
 */
function brushPath(width: number, height: number) {
    const stroke = height / 5.2;
    const pitch = stroke * 0.85;
    const rows = Math.max(2, Math.ceil((height - stroke * 0.8) / pitch) + 1);
    const left = -stroke;
    const right = width + stroke;
    let d = '';
    let length = 0;
    for (let i = 0; i < rows; i++) {
        const y = stroke * 0.4 + i * pitch;
        const from = i % 2 === 0 ? right : left;
        const to = i % 2 === 0 ? left : right;
        if (i === 0) d += `M${from} ${y} `;
        else {
            d += `L${from} ${y} `;
            length += pitch;
        }
        d += `L${to} ${y} `;
        length += right - left;
    }
    return { d, length, stroke };
}

export function SuccessOverlay({ visible, title, subtitle, eyebrow, primaryAction, secondaryAction, children }: SuccessOverlayProps) {
    const reduced = useReducedMotion();
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const brush = useMemo(() => brushPath(width, height), [width, height]);

    const paint = useSharedValue(0);
    const gloss = useSharedValue(0);
    const card = useSharedValue(0);
    const check = useSharedValue(0);

    useEffect(() => {
        if (!visible) {
            paint.value = 0;
            gloss.value = 0;
            card.value = 0;
            check.value = 0;
            return;
        }
        if (reduced) {
            paint.value = withTiming(1, { duration: 200 });
            gloss.value = withTiming(1, { duration: 200 });
            card.value = withTiming(1, { duration: 200 });
            check.value = withTiming(1, { duration: 200 });
            haptics.notify('success');
            return;
        }
        haptics.impact('light');
        paint.value = withTiming(1, { duration: PAINT_MS, easing: Easing.bezier(0.45, 0.05, 0.3, 1) });
        gloss.value = withDelay(110, withTiming(1, { duration: PAINT_MS, easing: Easing.bezier(0.45, 0.05, 0.3, 1) }));
        card.value = withDelay(CARD_DELAY, withTiming(1, { duration: 460, easing: Easing.bezier(0.22, 1, 0.36, 1) }));
        check.value = withDelay(CARD_DELAY + 320, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
        const t = setTimeout(() => haptics.notify('success'), CARD_DELAY + 200);
        return () => clearTimeout(t);
    }, [visible, reduced, paint, gloss, card, check]);

    const paintProps = useAnimatedProps(() => ({
        strokeDashoffset: brush.length * (1 - paint.value),
    }));
    const glossProps = useAnimatedProps(() => ({
        strokeDashoffset: brush.length * (1 - gloss.value),
    }));
    const cardStyle = useAnimatedStyle(() => ({
        opacity: card.value,
        transform: [{ translateY: (1 - card.value) * 28 }],
    }));
    const checkProps = useAnimatedProps(() => ({
        strokeDashoffset: CHECK_LENGTH * (1 - check.value),
    }));

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={primaryAction.onPress}>
            <View style={styles.root} accessibilityViewIsModal>
                <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
                    <Defs>
                        <LinearGradient id="lacquer" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
                            <Stop offset="0" stopColor={colors.roseSoft} />
                            <Stop offset="0.45" stopColor={colors.rose} />
                            <Stop offset="1" stopColor={colors.roseDeep} />
                        </LinearGradient>
                    </Defs>
                    <AnimatedPath
                        d={brush.d}
                        stroke="url(#lacquer)"
                        strokeWidth={brush.stroke}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        strokeDasharray={`${brush.length} ${brush.length}`}
                        animatedProps={paintProps}
                    />
                    <AnimatedPath
                        d={brush.d}
                        stroke={alpha(colors.white, 0.16)}
                        strokeWidth={brush.stroke * 0.3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        strokeDasharray={`${brush.length} ${brush.length}`}
                        animatedProps={glossProps}
                        transform={`translate(0 ${-brush.stroke * 0.22})`}
                    />
                </Svg>

                <Animated.View style={[styles.card, { marginBottom: insets.bottom + spacing.xl }, cardStyle]}>
                    <View style={styles.checkWrap}>
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
    card: {
        backgroundColor: colors.bg,
        borderRadius: radius.xl,
        padding: spacing.xl,
        paddingTop: spacing['2xl'],
        alignItems: 'center',
        ...shadows.lg,
    },
    checkWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.ink,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    eyebrow: {
        textTransform: 'uppercase',
        marginBottom: spacing.xs,
    },
    subtitle: {
        marginTop: spacing.sm,
    },
    actions: {
        alignSelf: 'stretch',
        gap: spacing.sm,
        marginTop: spacing.xl,
    },
});

export default SuccessOverlay;
