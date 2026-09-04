// Toast – non-blocking feedback anchored under the status bar.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../AppText';
import { Icon, IconName } from '../ui/Icon';
import { haptics } from '../../lib/haptics';
import { colors, radius, shadows, spacing } from '../../lib/theme';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
    message: string;
    tone?: ToastTone;
    duration?: number;
    action?: { label: string; onPress: () => void };
}

interface ToastContextValue {
    show: (options: ToastOptions) => void;
    hide: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICON: Record<ToastTone, IconName> = {
    success: 'checkmark-circle',
    error: 'alert-circle',
    info: 'information-circle',
    warning: 'warning',
};

const ACCENT: Record<ToastTone, string> = {
    success: colors.success,
    error: colors.danger,
    info: colors.rose,
    warning: colors.warning,
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const insets = useSafeAreaInsets();

    const hide = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        setToast(null);
    }, []);

    const show = useCallback(
        (options: ToastOptions) => {
            if (timer.current) clearTimeout(timer.current);
            const tone = options.tone || 'info';
            if (tone === 'success') haptics.notify('success');
            else if (tone === 'error') haptics.notify('error');
            else if (tone === 'warning') haptics.notify('warning');
            setToast({ ...options, tone, id: Date.now() });
            timer.current = setTimeout(() => setToast(null), options.duration ?? (options.action ? 5000 : 3200));
        },
        []
    );

    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    const value = useMemo(() => ({ show, hide }), [show, hide]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <View pointerEvents="box-none" style={[styles.host, { top: insets.top + spacing.sm }]}>
                {toast ? (
                    <Animated.View
                        key={toast.id}
                        entering={SlideInUp.duration(260)}
                        exiting={SlideOutUp.duration(200)}
                        style={styles.toast}
                        accessibilityLiveRegion="polite"
                        accessibilityRole="alert"
                    >
                        <Pressable style={styles.inner} onPress={hide} accessibilityLabel={toast.message}>
                            <View style={[styles.accent, { backgroundColor: ACCENT[toast.tone!] }]} />
                            <Icon name={ICON[toast.tone!]} size={20} color={ACCENT[toast.tone!]} />
                            <AppText variant="body-sm" tone="inverse" style={styles.message} numberOfLines={3}>
                                {toast.message}
                            </AppText>
                            {toast.action ? (
                                <Pressable
                                    onPress={() => {
                                        hide();
                                        toast.action?.onPress();
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel={toast.action.label}
                                    style={styles.actionBtn}
                                >
                                    <AppText variant="body-sm" style={styles.actionText}>{toast.action.label}</AppText>
                                </Pressable>
                            ) : null}
                        </Pressable>
                    </Animated.View>
                ) : null}
            </View>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

const styles = StyleSheet.create({
    host: {
        position: 'absolute',
        left: spacing.lg,
        right: spacing.lg,
        zIndex: 1000,
        alignItems: 'center',
    },
    toast: {
        width: '100%',
        maxWidth: 480,
        backgroundColor: colors.ink,
        borderRadius: radius.md,
        overflow: 'hidden',
        ...shadows.lg,
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        minHeight: 56,
    },
    accent: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: 3,
    },
    message: {
        flex: 1,
        lineHeight: 20,
    },
    actionBtn: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        minHeight: 32,
        justifyContent: 'center',
    },
    actionText: {
        color: colors.roseSoft,
        fontFamily: 'Heebo_600SemiBold',
    },
});
