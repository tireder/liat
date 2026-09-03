// Haptics wrapped so calls are safe on web / unsupported devices.
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

export function selection(): void {
    if (!enabled) return;
    Haptics.selectionAsync().catch(() => undefined);
}

export function impact(style: 'light' | 'medium' | 'heavy' = 'light'): void {
    if (!enabled) return;
    const map = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
    } as const;
    Haptics.impactAsync(map[style]).catch(() => undefined);
}

export function notify(type: 'success' | 'warning' | 'error'): void {
    if (!enabled) return;
    const map = {
        success: Haptics.NotificationFeedbackType.Success,
        warning: Haptics.NotificationFeedbackType.Warning,
        error: Haptics.NotificationFeedbackType.Error,
    } as const;
    Haptics.notificationAsync(map[type]).catch(() => undefined);
}

export const haptics = { selection, impact, notify };
