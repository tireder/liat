// Root layout – fonts, splash, providers, push notifications & deep linking
import { useCallback, useEffect, useRef } from 'react';
import { I18nManager, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Heebo_400Regular, Heebo_500Medium, Heebo_600SemiBold, Heebo_700Bold } from '@expo-google-fonts/heebo';
import { FrankRuhlLibre_400Regular, FrankRuhlLibre_500Medium } from '@expo-google-fonts/frank-ruhl-libre';
import { AuthProvider, useAuth } from '../lib/auth';
import { AppDataProvider } from '../lib/appData';
import { TextSizeProvider } from '../lib/textSize';
import { ToastProvider } from '../components/feedback/Toast';
import { SheetProvider } from '../components/feedback/ConfirmSheet';
import { colors } from '../lib/theme';
import {
    registerIfPermitted,
    addNotificationReceivedListener,
    addNotificationResponseListener,
    getLastNotificationResponse,
    setBadgeCount,
} from '../lib/notifications';

// Force RTL layout (takes effect on the next launch after first install)
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions?.({ duration: 300, fade: true });

/** Resolves a web/app URL to an in-app route. */
function routeForUrl(url: string): string | null {
    try {
        const parsed = new URL(url);
        const path = parsed.pathname;
        const params = parsed.searchParams;

        if (path.startsWith('/my-bookings') || path.startsWith('/app/booking')) return '/(tabs)/account';
        if (path.startsWith('/review/')) {
            const token = path.split('/review/')[1];
            return token ? `/review/${token}` : null;
        }
        if (path.startsWith('/book') || path.startsWith('/app/book')) {
            const service = params.get('service');
            const reschedule = params.get('reschedule');
            if (service) return `/(tabs)/book?service=${encodeURIComponent(service)}`;
            if (reschedule) return `/(tabs)/book?reschedule=${encodeURIComponent(reschedule)}`;
            return '/(tabs)/book';
        }
        if (path.startsWith('/courses')) {
            const id = path.split('/courses/')[1];
            return id ? `/course/${id}` : '/(tabs)/courses';
        }
        if (path.startsWith('/gallery')) return '/(tabs)/gallery';
        return null;
    } catch {
        return null;
    }
}

function NotificationAndDeepLinkHandler() {
    const { phone, isAuthenticated } = useAuth();
    const router = useRouter();

    const handleDeepLink = useCallback(
        (url: string) => {
            const route = routeForUrl(url);
            if (route) router.push(route as never);
        },
        [router]
    );

    // Register the device only when permission was already granted (no prompt at login)
    useEffect(() => {
        if (!isAuthenticated || !phone) return;
        registerIfPermitted(phone).catch(() => undefined);
    }, [isAuthenticated, phone]);

    useEffect(() => {
        const sub = addNotificationReceivedListener(() => undefined);
        return () => sub.remove();
    }, []);

    useEffect(() => {
        const sub = addNotificationResponseListener((response) => {
            const data = response.notification.request.content.data;
            if (data?.deepLink) handleDeepLink(String(data.deepLink));
            else if (data?.bookingId) router.push('/(tabs)/account');
        });
        return () => sub.remove();
    }, [handleDeepLink, router]);

    useEffect(() => {
        getLastNotificationResponse().then((response) => {
            const data = response?.notification.request.content.data;
            if (data?.deepLink) handleDeepLink(String(data.deepLink));
        });
    }, [handleDeepLink]);

    useEffect(() => {
        const sub = Linking.addEventListener('url', (event) => handleDeepLink(event.url));
        Linking.getInitialURL().then((url) => url && handleDeepLink(url));
        return () => sub.remove();
    }, [handleDeepLink]);

    useEffect(() => {
        setBadgeCount(0).catch(() => undefined);
    }, []);

    return null;
}

/** Hides the native splash once fonts and the session are ready. */
function SplashGate({ fontsReady }: { fontsReady: boolean }) {
    const { isLoading } = useAuth();
    const hidden = useRef(false);
    useEffect(() => {
        if (fontsReady && !isLoading && !hidden.current) {
            hidden.current = true;
            SplashScreen.hideAsync().catch(() => undefined);
        }
    }, [fontsReady, isLoading]);
    return null;
}

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        Heebo_400Regular,
        Heebo_500Medium,
        Heebo_600SemiBold,
        Heebo_700Bold,
        FrankRuhlLibre_400Regular,
        FrankRuhlLibre_500Medium,
    });
    const fontsReady = fontsLoaded || !!fontError;

    if (!fontsReady) return null;

    return (
        <GestureHandlerRootView style={styles.root}>
            <AuthProvider>
                <AppDataProvider>
                    <TextSizeProvider>
                        <ToastProvider>
                            <SheetProvider>
                                <SplashGate fontsReady={fontsReady} />
                                <NotificationAndDeepLinkHandler />
                                <StatusBar style="dark" />
                                <Stack
                                    screenOptions={{
                                        headerShown: false,
                                        contentStyle: { backgroundColor: colors.bg },
                                        animation: 'slide_from_left',
                                    }}
                                >
                                    <Stack.Screen name="(auth)" />
                                    <Stack.Screen name="(tabs)" />
                                    <Stack.Screen name="settings" />
                                    <Stack.Screen name="review/[token]" />
                                    <Stack.Screen name="course/[id]" />
                                    <Stack.Screen name="privacy-policy" />
                                    <Stack.Screen name="terms" />
                                    <Stack.Screen name="help" />
                                </Stack>
                            </SheetProvider>
                        </ToastProvider>
                    </TextSizeProvider>
                </AppDataProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.bg,
    },
});
