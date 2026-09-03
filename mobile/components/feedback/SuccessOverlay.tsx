// SuccessOverlay – "LacquerSweep": a rose gradient wipes across the screen,
// a cream card rises and a check stroke draws in. Reduced motion → cross-fade.
import React, { useEffect } from 'react';
import { Dimensions, Modal, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../AppText';
import { Button } from '../ui/Button';
import { useReducedMotion } from '../../lib/motion';
import { haptics } from '../../lib/haptics';
import { colors, radius, shadows, spacing } from '../../lib/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK_LENGTH = 60;

export interface SuccessOverlayProps {
    visible: boolean;
    title: string;
    subtitle?: string;
    eyebrow?: string;
    primaryAction: { label: string; onPress: () => void };
    secondaryAction?: { label: string; onPress: () => void };
    children?: React.ReactNode;
}

export function SuccessOverlay({ visible, title, subtitle, eyebrow, primaryAction, secondaryAction, children }: SuccessOverlayProps) {
    const reduced = useReducedMotion();
    const insets = useSafeAreaInsets();
    const { width } = Dimensions.get('window');

    const sweep = useSharedValue(0);
    const card = useSharedValue(0);
    const check = useSharedValue(0);

    useEffect(() => {
        if (!visible) {
            sweep.value = 0;
            card.value = 0;
            check.value = 0;
            return;
        }
        haptics.notify('success');
        if (reduced) {
            sweep.value = withTiming(1, { duration: 200 });
            card.value = withTiming(1, { duration: 200 });
            check.value = withTiming(1, { duration: 200 });
            return;
        }
        sweep.value = withTiming(1, { duration: 700, easing: Easing.bezier(0.22, 1, 0.36, 1) });
        card.value = withDelay(420, withTiming(1, { duration: 420, easing: Easing.bezier(0.22, 1, 0.36, 1) }));
        check.value = withDelay(700, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    }, [visible, reduced, sweep, card, check]);

    const sweepStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: (1 - sweep.value) * width * 1.2 }],
        opacity: sweep.value === 0 ? 0 : 1,
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
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.roseMist }]} />
                <Animated.View style={[StyleSheet.absoluteFill, sweepStyle]}>
                    <LinearGradient
                        colors={[colors.roseSoft, colors.rose, colors.roseDeep]}
                        start={{ x: 0, y: 0.2 }}
                        end={{ x: 1, y: 0.8 }}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>

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
