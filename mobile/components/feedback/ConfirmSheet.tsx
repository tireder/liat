// Sheet – branded bottom sheet used for confirmations and action lists.
// `useSheet().confirm(...)` resolves true/false; `present(...)` resolves an action id.
import React, { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown, useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../AppText';
import { Button, ButtonVariant } from '../ui/Button';
import { Icon, IconName } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { haptics } from '../../lib/haptics';
import { colors, radius, shadows, spacing } from '../../lib/theme';

export interface SheetAction {
    id: string;
    label: string;
    icon?: IconName;
    tone?: 'default' | 'danger' | 'primary';
    description?: string;
}

export interface SheetOptions {
    title: string;
    message?: string;
    icon?: IconName;
    actions: SheetAction[];
    cancelLabel?: string | null;
    layout?: 'buttons' | 'list';
}

export interface ConfirmOptions {
    title: string;
    message?: string;
    icon?: IconName;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
}

interface SheetContextValue {
    present: (options: SheetOptions) => Promise<string | null>;
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const SheetContext = createContext<SheetContextValue | null>(null);

interface ActiveSheet extends SheetOptions {
    id: number;
    resolve: (value: string | null) => void;
}

export function SheetProvider({ children }: { children: ReactNode }) {
    const [sheet, setSheet] = useState<ActiveSheet | null>(null);
    const resolverRef = useRef<((v: string | null) => void) | null>(null);

    const close = useCallback((value: string | null) => {
        resolverRef.current?.(value);
        resolverRef.current = null;
        setSheet(null);
    }, []);

    const present = useCallback((options: SheetOptions) => {
        return new Promise<string | null>((resolve) => {
            resolverRef.current?.(null);
            resolverRef.current = resolve;
            haptics.impact('light');
            setSheet({ ...options, id: Date.now(), resolve });
        });
    }, []);

    const confirm = useCallback(
        async (options: ConfirmOptions) => {
            const result = await present({
                title: options.title,
                message: options.message,
                icon: options.icon,
                cancelLabel: options.cancelLabel ?? 'ביטול',
                layout: 'buttons',
                actions: [
                    {
                        id: 'confirm',
                        label: options.confirmLabel ?? 'אישור',
                        tone: options.destructive ? 'danger' : 'primary',
                    },
                ],
            });
            return result === 'confirm';
        },
        [present]
    );

    const value = useMemo(() => ({ present, confirm }), [present, confirm]);

    return (
        <SheetContext.Provider value={value}>
            {children}
            {sheet ? <SheetView key={sheet.id} sheet={sheet} onClose={close} /> : null}
        </SheetContext.Provider>
    );
}

function SheetView({ sheet, onClose }: { sheet: ActiveSheet; onClose: (v: string | null) => void }) {
    const insets = useSafeAreaInsets();
    const translateY = useSharedValue(0);

    const pan = Gesture.Pan()
        .onUpdate((e) => {
            translateY.value = Math.max(0, e.translationY);
        })
        .onEnd((e) => {
            if (e.translationY > 90 || e.velocityY > 800) {
                translateY.value = withTiming(400, { duration: 200 }, () => runOnJS(onClose)(null));
            } else {
                translateY.value = withTiming(0, { duration: 180 });
            }
        });

    const dragStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
    const isList = sheet.layout === 'list';

    return (
        <Modal transparent visible animationType="none" onRequestClose={() => onClose(null)} statusBarTranslucent>
            <View style={styles.root}>
                <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(160)} style={StyleSheet.absoluteFill}>
                    <Pressable style={styles.backdrop} onPress={() => onClose(null)} accessibilityLabel="סגירה" accessibilityRole="button" />
                </Animated.View>
                <GestureDetector gesture={pan}>
                    <Animated.View
                        entering={SlideInDown.duration(280)}
                        exiting={SlideOutDown.duration(200)}
                        style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }, dragStyle]}
                        accessibilityViewIsModal
                    >
                        <View style={styles.handle} />
                        {sheet.icon ? (
                            <View style={styles.iconWrap}>
                                <Icon name={sheet.icon} size={24} tone="roseDeep" />
                            </View>
                        ) : null}
                        <AppText variant="display-sm" align="center" accessibilityRole="header" style={styles.title}>
                            {sheet.title}
                        </AppText>
                        {sheet.message ? (
                            <AppText variant="body" tone="muted" align="center" style={styles.message}>
                                {sheet.message}
                            </AppText>
                        ) : null}

                        {isList ? (
                            <View style={styles.list}>
                                {sheet.actions.map((action) => (
                                    <PressableScale
                                        key={action.id}
                                        onPress={() => onClose(action.id)}
                                        haptic="selection"
                                        style={styles.listRow}
                                        accessibilityRole="button"
                                        accessibilityLabel={action.label}
                                        accessibilityHint={action.description}
                                    >
                                        <View style={[styles.listIcon, action.tone === 'danger' ? styles.listIconDanger : null]}>
                                            {action.icon ? <Icon name={action.icon} size={20} tone={action.tone === 'danger' ? 'danger' : 'roseDeep'} /> : null}
                                        </View>
                                        <View style={styles.listText}>
                                            <AppText variant="body" style={styles.listLabel} tone={action.tone === 'danger' ? 'danger' : 'ink'}>
                                                {action.label}
                                            </AppText>
                                            {action.description ? (
                                                <AppText variant="body-sm" tone="muted">{action.description}</AppText>
                                            ) : null}
                                        </View>
                                    </PressableScale>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.buttons}>
                                {sheet.actions.map((action) => (
                                    <Button
                                        key={action.id}
                                        label={action.label}
                                        icon={action.icon}
                                        variant={toButtonVariant(action.tone)}
                                        size="lg"
                                        fullWidth
                                        onPress={() => onClose(action.id)}
                                    />
                                ))}
                            </View>
                        )}

                        {sheet.cancelLabel !== null ? (
                            <Button label={sheet.cancelLabel ?? 'סגירה'} variant="text" fullWidth onPress={() => onClose(null)} haptic="none" />
                        ) : null}
                    </Animated.View>
                </GestureDetector>
            </View>
        </Modal>
    );
}

function toButtonVariant(tone?: SheetAction['tone']): ButtonVariant {
    if (tone === 'danger') return 'danger';
    if (tone === 'primary') return 'primary';
    return 'secondary';
}

export function useSheet(): SheetContextValue {
    const ctx = useContext(SheetContext);
    if (!ctx) throw new Error('useSheet must be used within SheetProvider');
    return ctx;
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(28, 22, 20, 0.45)',
    },
    sheet: {
        backgroundColor: colors.bg,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.sm,
        ...shadows.lg,
    },
    handle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.lineStrong,
        marginBottom: spacing.lg,
    },
    iconWrap: {
        alignSelf: 'center',
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.roseMist,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    title: {
        marginBottom: spacing.xs,
    },
    message: {
        marginBottom: spacing.lg,
    },
    buttons: {
        gap: spacing.sm,
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
    },
    list: {
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
    },
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        minHeight: 60,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    listIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.roseMist,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listIconDanger: {
        backgroundColor: colors.dangerBg,
    },
    listText: {
        flex: 1,
        gap: 2,
    },
    listLabel: {
        fontFamily: 'Heebo_500Medium',
    },
});
