// NotificationsSoftAsk – one-time in-app card before the OS push prompt.
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { AppText } from '../AppText';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { useToast } from '../feedback/Toast';
import { useAuth } from '../../lib/auth';
import { getPushPermissionState, markSoftAskShown, registerForPushNotifications, wasSoftAskShown } from '../../lib/notifications';
import { notificationsApi } from '../../lib/api';
import { colors, radius, spacing } from '../../lib/theme';

interface Props {
    eligible: boolean;
}

export function NotificationsSoftAsk({ eligible }: Props) {
    const { phone } = useAuth();
    const { show } = useToast();
    const [visible, setVisible] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function check() {
            if (!eligible) return setVisible(false);
            const [shown, state] = await Promise.all([wasSoftAskShown(), getPushPermissionState()]);
            if (cancelled) return;
            setVisible(!shown && state === 'undetermined');
        }
        check();
        return () => {
            cancelled = true;
        };
    }, [eligible]);

    if (!visible) return null;

    const dismiss = async () => {
        await markSoftAskShown();
        setVisible(false);
    };

    const enable = async () => {
        if (!phone) return;
        setBusy(true);
        const { state } = await registerForPushNotifications(phone);
        await markSoftAskShown();
        if (state === 'granted') {
            await notificationsApi.updatePreferences(phone, { app_notifications_enabled: true });
            show({ message: 'תזכורות הופעלו. נזכיר לך לפני כל תור.', tone: 'success' });
        } else {
            show({ message: 'אפשר להפעיל תזכורות בכל שלב מהפרופיל', tone: 'info' });
        }
        setBusy(false);
        setVisible(false);
    };

    return (
        <Animated.View entering={FadeIn.duration(260)} exiting={FadeOut.duration(160)} style={styles.card}>
            <View style={styles.iconWrap}>
                <Icon name="notifications-outline" size={22} tone="roseDeep" />
            </View>
            <View style={styles.text}>
                <AppText variant="heading">לקבל תזכורת לפני התור?</AppText>
                <AppText variant="body-sm" tone="muted">נשלח לך התראה יום לפני ובבוקר התור, ועדכון אם משהו משתנה.</AppText>
                <View style={styles.actions}>
                    <Button label="הפעילי תזכורות" size="sm" onPress={enable} loading={busy} />
                    <Button label="לא עכשיו" size="sm" variant="text" onPress={dismiss} haptic="none" />
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.lg,
        backgroundColor: colors.blush,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.roseMist,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        flex: 1,
        gap: spacing.xs,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.sm,
        flexWrap: 'wrap',
    },
});

export default NotificationsSoftAsk;
