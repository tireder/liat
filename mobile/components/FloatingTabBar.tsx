// FloatingTabBar – floating island with real blur, labelled tabs, an animated
// pill, a raised home button in the centre and a swipe gesture.
// Fully accessible (role=tab, selected state).
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { AppText } from './AppText';
import { BlurSurface } from './ui/BlurSurface';
import { Icon, IconName } from './ui/Icon';
import { haptics } from '../lib/haptics';
import { useReducedMotion } from '../lib/motion';
import { colors, radius, shadows, spacing } from '../lib/theme';

export const TAB_BAR_HEIGHT = 72;
const HOME_SIZE = 60;
const HOME_RAISE = 18;
const HOME_ROUTE = 'index';

/**
 * Visual order. The row is laid out RTL, so the first entry sits on the right:
 * account · booking · [home] · courses · gallery
 */
const TAB_ORDER = ['account', 'book', HOME_ROUTE, 'courses', 'gallery'];

const TAB_ITEMS: Record<string, { icon: IconName; iconActive: IconName; label: string }> = {
    index: { icon: 'home-outline', iconActive: 'home', label: 'בית' },
    book: { icon: 'calendar-outline', iconActive: 'calendar', label: 'קביעת תור' },
    account: { icon: 'person-outline', iconActive: 'person', label: 'החשבון שלי' },
    courses: { icon: 'school-outline', iconActive: 'school', label: 'קורסים' },
    gallery: { icon: 'images-outline', iconActive: 'images', label: 'גלריה' },
};

interface TabLayout {
    x: number;
    width: number;
}

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const reduced = useReducedMotion();
    const activeIndex = state.index;
    const [layouts, setLayouts] = useState<Record<number, TabLayout>>({});
    const layoutsRef = useRef(layouts);
    layoutsRef.current = layouts;

    const pillX = useSharedValue(0);
    const pillW = useSharedValue(0);
    const dragging = useSharedValue(0);

    // Routes in display order (any route missing from TAB_ORDER is appended)
    const ordered = [
        ...TAB_ORDER.map((name) => state.routes.findIndex((r) => r.name === name)).filter((i) => i >= 0),
        ...state.routes.map((_, i) => i).filter((i) => !TAB_ORDER.includes(state.routes[i].name)),
    ];

    const moveTo = useCallback(
        (index: number, animate = true) => {
            const l = layoutsRef.current[index];
            if (!l) return;
            // The home button has its own active style; the pill hides under it
            if (state.routes[index]?.name === HOME_ROUTE) {
                pillW.value = 0;
                pillX.value = l.x + l.width / 2;
                return;
            }
            const target = l.x + 4;
            pillW.value = l.width - 8;
            pillX.value = animate && !reduced ? withSpring(target, { damping: 18, stiffness: 180 }) : withTiming(target, { duration: 0 });
        },
        [pillX, pillW, reduced, state.routes]
    );

    useEffect(() => {
        moveTo(activeIndex);
    }, [activeIndex, layouts, moveTo]);

    const onTabLayout = (index: number) => (e: LayoutChangeEvent) => {
        const { x, width } = e.nativeEvent.layout;
        setLayouts((prev) => {
            const cur = prev[index];
            if (cur && cur.x === x && cur.width === width) return prev;
            return { ...prev, [index]: { x, width } };
        });
    };

    const navigateTo = useCallback(
        (index: number) => {
            const route = state.routes[index];
            if (!route || index === state.index) return;
            haptics.impact('light');
            navigation.navigate(route.name);
        },
        [navigation, state]
    );

    const settleFromDrag = useCallback(
        (centerX: number) => {
            const entries = Object.entries(layoutsRef.current);
            let best = activeIndex;
            let bestDist = Infinity;
            for (const [i, l] of entries) {
                const c = l.x + l.width / 2;
                const d = Math.abs(c - centerX);
                if (d < bestDist) {
                    bestDist = d;
                    best = Number(i);
                }
            }
            if (best !== activeIndex) navigateTo(best);
            else moveTo(activeIndex);
        },
        [activeIndex, navigateTo, moveTo]
    );

    const pan = Gesture.Pan()
        .activeOffsetX([-12, 12])
        .onStart(() => {
            dragging.value = 1;
        })
        .onUpdate((e) => {
            const base = layoutsRef.current[activeIndex];
            if (!base) return;
            pillX.value = base.x + 4 + e.translationX;
        })
        .onEnd(() => {
            dragging.value = 0;
            const center = pillX.value + pillW.value / 2;
            runOnJS(settleFromDrag)(center);
        });

    const pillStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: pillX.value }],
        width: pillW.value,
        opacity: pillW.value > 0 ? 1 - dragging.value * 0.25 : 0,
    }));

    const onPressTab = (index: number, focused: boolean) => {
        const route = state.routes[index];
        const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
        if (!focused && !event.defaultPrevented) navigateTo(index);
    };

    const homeIndex = state.routes.findIndex((r) => r.name === HOME_ROUTE);
    const homeFocused = homeIndex === activeIndex;
    const homeItem = TAB_ITEMS[HOME_ROUTE];

    return (
        <View pointerEvents="box-none" style={[styles.host, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <GestureDetector gesture={pan}>
                <View style={styles.shadowWrap}>
                    <BlurSurface style={styles.bar} intensity={50}>
                        <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none" />
                        <View style={styles.tabs} accessibilityRole="tablist">
                            {ordered.map((index) => {
                                const route = state.routes[index];
                                const item = TAB_ITEMS[route.name] || { icon: 'ellipse-outline' as IconName, iconActive: 'ellipse' as IconName, label: route.name };
                                const focused = index === activeIndex;
                                if (route.name === HOME_ROUTE) {
                                    // Spacer – the raised button is rendered above the blur surface
                                    return <View key={route.key} onLayout={onTabLayout(index)} style={styles.homeSpacer} accessible={false} />;
                                }
                                return (
                                    <Pressable
                                        key={route.key}
                                        onLayout={onTabLayout(index)}
                                        onPress={() => onPressTab(index, focused)}
                                        style={styles.tab}
                                        accessibilityRole="tab"
                                        accessibilityLabel={item.label}
                                        accessibilityState={{ selected: focused }}
                                        hitSlop={{ top: 6, bottom: 6 }}
                                    >
                                        <Icon name={focused ? item.iconActive : item.icon} size={22} color={focused ? colors.ink : colors.inkMuted} />
                                        <AppText
                                            style={[styles.label, { color: focused ? colors.ink : colors.inkMuted }]}
                                            numberOfLines={1}
                                            maxFontSizeMultiplier={1.15}
                                        >
                                            {item.label}
                                        </AppText>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </BlurSurface>

                    {homeIndex >= 0 ? (
                        <View style={styles.homeWrap} pointerEvents="box-none">
                            <Pressable
                                onPress={() => onPressTab(homeIndex, homeFocused)}
                                style={styles.homeTab}
                                accessibilityRole="tab"
                                accessibilityLabel={homeItem.label}
                                accessibilityState={{ selected: homeFocused }}
                                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            >
                                <View style={[styles.homeButton, homeFocused ? styles.homeButtonActive : null]}>
                                    <Icon name={homeFocused ? homeItem.iconActive : homeItem.icon} size={26} color={homeFocused ? colors.inkInverse : colors.ink} />
                                </View>
                                <AppText
                                    style={[styles.label, styles.homeLabel, { color: homeFocused ? colors.ink : colors.inkMuted }]}
                                    numberOfLines={1}
                                    maxFontSizeMultiplier={1.15}
                                >
                                    {homeItem.label}
                                </AppText>
                            </Pressable>
                        </View>
                    ) : null}
                </View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    host: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    shadowWrap: {
        borderRadius: radius.full,
        ...shadows.lg,
        width: '100%',
        maxWidth: 440,
    },
    bar: {
        height: TAB_BAR_HEIGHT,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.line,
        paddingHorizontal: 6,
        justifyContent: 'center',
    },
    pill: {
        position: 'absolute',
        left: 0,
        top: 8,
        bottom: 8,
        borderRadius: radius.full,
        backgroundColor: colors.roseMist,
        borderWidth: 1,
        borderColor: colors.roseSoft,
    },
    tabs: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tab: {
        flex: 1,
        height: TAB_BAR_HEIGHT - 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
    },
    homeSpacer: {
        flex: 1.15,
        height: TAB_BAR_HEIGHT - 16,
    },
    homeWrap: {
        position: 'absolute',
        top: -HOME_RAISE,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    homeTab: {
        alignItems: 'center',
        gap: 4,
    },
    homeButton: {
        width: HOME_SIZE,
        height: HOME_SIZE,
        borderRadius: HOME_SIZE / 2,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.lineStrong,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
    },
    homeButtonActive: {
        backgroundColor: colors.ink,
        borderWidth: 3,
        borderColor: colors.roseSoft,
    },
    label: {
        fontFamily: 'Heebo_500Medium',
        fontSize: 11,
        lineHeight: 14,
    },
    homeLabel: {
        fontSize: 11,
    },
});
