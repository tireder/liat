// FloatingTabBar – floating island with real blur, labelled tabs, an animated
// pill and a swipe gesture. Fully accessible (role=tab, selected state).
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { AppText } from './AppText';
import { BlurSurface } from './ui/BlurSurface';
import { Icon, IconName } from './ui/Icon';
import { haptics } from '../lib/haptics';
import { useReducedMotion } from '../lib/motion';
import { colors, radius, shadows, spacing } from '../lib/theme';

export const TAB_BAR_HEIGHT = 72;

const TAB_ITEMS: Record<string, { icon: IconName; iconActive: IconName; label: string }> = {
    index: { icon: 'home-outline', iconActive: 'home', label: 'בית' },
    book: { icon: 'calendar-outline', iconActive: 'calendar', label: 'קביעת תור' },
    courses: { icon: 'school-outline', iconActive: 'school', label: 'קורסים' },
    gallery: { icon: 'images-outline', iconActive: 'images', label: 'גלריה' },
    appointments: { icon: 'list-outline', iconActive: 'list', label: 'התורים שלי' },
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

    const moveTo = useCallback(
        (index: number, animate = true) => {
            const l = layoutsRef.current[index];
            if (!l) return;
            const target = l.x + 4;
            pillW.value = l.width - 8;
            pillX.value = animate && !reduced ? withSpring(target, { damping: 18, stiffness: 180 }) : withTiming(target, { duration: 0 });
        },
        [pillX, pillW, reduced]
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

    return (
        <View pointerEvents="box-none" style={[styles.host, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <GestureDetector gesture={pan}>
                <View style={styles.shadowWrap}>
                    <BlurSurface style={styles.bar} intensity={50}>
                        <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none" />
                        <View style={styles.tabs} accessibilityRole="tablist">
                            {state.routes.map((route, index) => {
                                const item = TAB_ITEMS[route.name] || { icon: 'ellipse-outline' as IconName, iconActive: 'ellipse' as IconName, label: route.name };
                                const focused = index === activeIndex;
                                return (
                                    <Pressable
                                        key={route.key}
                                        onLayout={onTabLayout(index)}
                                        onPress={() => {
                                            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                                            if (!focused && !event.defaultPrevented) navigateTo(index);
                                        }}
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
    label: {
        fontFamily: 'Heebo_500Medium',
        fontSize: 11,
        lineHeight: 14,
    },
});
