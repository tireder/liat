// Push notifications – registration, permissions and listeners.
// The OS permission prompt is only shown from an explicit user action
// (Profile toggle or the post-booking soft-ask card), never at login.

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { notificationsApi } from './api';
import { colors } from './theme';

export const PUSH_TOKEN_KEY = 'liat_push_token';
export const SOFT_ASK_KEY = 'liat_push_soft_ask_done';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export async function getPushPermissionState(): Promise<PermissionState> {
    if (!Device.isDevice) return 'unsupported';
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return 'granted';
    if (status === 'denied' && canAskAgain === false) return 'denied';
    if (status === 'denied') return 'denied';
    return 'undetermined';
}

async function ensureAndroidChannel() {
    if (Platform.OS !== 'android') return;
    await Notifications.setNotificationChannelAsync('default', {
        name: 'תזכורות ועדכונים',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: colors.rose,
        sound: 'default',
    });
}

async function fetchAndRegisterToken(phone: string): Promise<string | null> {
    try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: projectId || undefined });
        const token = tokenData.data;
        const result = await notificationsApi.registerToken(phone, token, Platform.OS);
        if (result.error) console.error('[Notifications] token registration failed:', result.error);
        await ensureAndroidChannel();
        await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token).catch(() => undefined);
        return token;
    } catch (error) {
        console.error('[Notifications] Error registering for push:', error);
        return null;
    }
}

/**
 * Registers the device when permission is *already* granted.
 * Never triggers the OS prompt — safe to call at login.
 */
export async function registerIfPermitted(phone: string): Promise<string | null> {
    if (!Device.isDevice) return null;
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;
    return fetchAndRegisterToken(phone);
}

/**
 * Asks for permission (OS prompt) and registers the device.
 * Call only from an explicit user action.
 */
export async function registerForPushNotifications(phone: string): Promise<{ token: string | null; state: PermissionState }> {
    if (!Device.isDevice) return { token: null, state: 'unsupported' };

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') return { token: null, state: 'denied' };

    const token = await fetchAndRegisterToken(phone);
    return { token, state: 'granted' };
}

export async function unregisterPushNotifications(phone: string, token: string): Promise<void> {
    try {
        await notificationsApi.unregisterToken(phone, token);
        await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY).catch(() => undefined);
    } catch (error) {
        console.error('[Notifications] Error unregistering token:', error);
    }
}

export async function wasSoftAskShown(): Promise<boolean> {
    try {
        return (await SecureStore.getItemAsync(SOFT_ASK_KEY)) === '1';
    } catch {
        return false;
    }
}

export async function markSoftAskShown(): Promise<void> {
    try {
        await SecureStore.setItemAsync(SOFT_ASK_KEY, '1');
    } catch {
        // ignore
    }
}

export function addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
}

export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
    return Notifications.getLastNotificationResponseAsync();
}

export async function setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
}
