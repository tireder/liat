// Settings – notifications, SMS preferences, text size, links, logout (reached from the account tab)
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';
import { Screen } from '../components/ui/Screen';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { Button } from '../components/ui/Button';
import { SwitchRow } from '../components/ui/Switch';
import { Chevron, Icon, IconName } from '../components/ui/Icon';
import { PressableScale } from '../components/ui/PressableScale';
import { AppText } from '../components/AppText';
import { ProfileSkeleton } from '../components/SkeletonLoader';
import { useSheet } from '../components/feedback/ConfirmSheet';
import { useToast } from '../components/feedback/Toast';
import { useAuth } from '../lib/auth';
import { useAppData } from '../lib/appData';
import { notificationsApi } from '../lib/api';
import { useTextSize, TextSizeLevel, TEXT_SIZE_LABEL } from '../lib/textSize';
import { registerForPushNotifications, unregisterPushNotifications, getPushPermissionState, PUSH_TOKEN_KEY } from '../lib/notifications';
import { openAppSettings } from '../lib/contact';
import { APP_VERSION } from '../lib/config';
import { LRM } from '../lib/format';
import { enter, useReducedMotion } from '../lib/motion';
import { colors, radius, spacing, typography } from '../lib/theme';

export default function SettingsScreen() {
    const router = useRouter();
    const reduced = useReducedMotion();
    const { phone, logout } = useAuth();
    const { invalidateBookings } = useAppData();
    const { confirm } = useSheet();
    const { show } = useToast();
    const { textSize, setTextSize } = useTextSize();

    const [pushEnabled, setPushEnabled] = useState(false);
    const [smsMarketing, setSmsMarketing] = useState(true);
    const [smsReviews, setSmsReviews] = useState(true);
    const [smsReturnReminders, setSmsReturnReminders] = useState(true);
    const [loadingPrefs, setLoadingPrefs] = useState(true);
    const [togglingPush, setTogglingPush] = useState(false);

    useEffect(() => {
        if (!phone) return;
        let cancelled = false;
        Promise.all([notificationsApi.getPreferences(phone), getPushPermissionState()]).then(([result, permission]) => {
            if (cancelled) return;
            if (result.data) {
                setPushEnabled(result.data.app_notifications_enabled && permission === 'granted');
                setSmsMarketing(result.data.sms_marketing);
                setSmsReviews(result.data.sms_reviews);
                setSmsReturnReminders(result.data.sms_return_reminders);
            }
            setLoadingPrefs(false);
        });
        return () => {
            cancelled = true;
        };
    }, [phone]);

    const handleTogglePush = useCallback(
        async (value: boolean) => {
            if (!phone || togglingPush) return;
            setTogglingPush(true);
            setPushEnabled(value);
            try {
                if (value) {
                    const { token, state } = await registerForPushNotifications(phone);
                    if (!token) {
                        setPushEnabled(false);
                        if (state === 'denied') {
                            const open = await confirm({
                                title: 'ההתראות כבויות בהגדרות המכשיר',
                                message: 'כדי לקבל תזכורות לתורים, הפעילי התראות לאפליקציה בהגדרות.',
                                icon: 'notifications-off-outline',
                                confirmLabel: 'פתחי הגדרות',
                                cancelLabel: 'לא עכשיו',
                            });
                            if (open) openAppSettings();
                        } else {
                            show({ message: 'לא ניתן להפעיל התראות במכשיר זה', tone: 'info' });
                        }
                        return;
                    }
                    await notificationsApi.updatePreferences(phone, { app_notifications_enabled: true });
                    show({ message: 'תזכורות הופעלו', tone: 'success' });
                } else {
                    const savedToken = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
                    if (savedToken) await unregisterPushNotifications(phone, savedToken);
                    await notificationsApi.updatePreferences(phone, { app_notifications_enabled: false });
                }
            } catch {
                setPushEnabled(!value);
                show({ message: 'לא הצלחנו לעדכן את ההעדפה', tone: 'error' });
            } finally {
                setTogglingPush(false);
            }
        },
        [phone, togglingPush, confirm, show]
    );

    const handleToggleSms = useCallback(
        async (field: 'sms_marketing' | 'sms_reviews' | 'sms_return_reminders', value: boolean) => {
            if (!phone) return;
            const setters = { sms_marketing: setSmsMarketing, sms_reviews: setSmsReviews, sms_return_reminders: setSmsReturnReminders };
            setters[field](value);
            const result = await notificationsApi.updatePreferences(phone, { [field]: value });
            if (result.error) {
                setters[field](!value);
                show({ message: 'לא הצלחנו לעדכן את ההעדפה', tone: 'error' });
            }
        },
        [phone, show]
    );

    const handleLogout = async () => {
        const ok = await confirm({
            title: 'להתנתק?',
            message: 'תוכלי להתחבר שוב בכל רגע עם קוד SMS.',
            icon: 'log-out-outline',
            confirmLabel: 'התנתקי',
            cancelLabel: 'הישארי',
            destructive: true,
        });
        if (!ok) return;
        invalidateBookings();
        await logout();
        router.replace('/(auth)/login');
    };

    return (
        <Screen header={<Header title="הגדרות" />}>
            {loadingPrefs ? (
                <ProfileSkeleton />
            ) : (
                <>
                    <Animated.View entering={enter(0, reduced)}>
                        <Card>
                            <SectionLabel>התראות</SectionLabel>
                            <SwitchRow
                                icon="notifications-outline"
                                title="תזכורות באפליקציה"
                                description="תזכורת לפני התור ועדכונים על שינויים"
                                value={pushEnabled}
                                onValueChange={handleTogglePush}
                                disabled={togglingPush}
                            />
                        </Card>
                    </Animated.View>

                    <Animated.View entering={enter(1, reduced)}>
                        <Card>
                            <SectionLabel>הודעות SMS</SectionLabel>
                            <SwitchRow icon="megaphone-outline" title="עדכונים ומבצעים" description="הודעות שיווקיות מדי פעם" value={smsMarketing} onValueChange={(v) => handleToggleSms('sms_marketing', v)} />
                            <Divider />
                            <SwitchRow icon="star-outline" title="בקשת דירוג" description="אחרי טיפול, כדי שנשתפר" value={smsReviews} onValueChange={(v) => handleToggleSms('sms_reviews', v)} />
                            <Divider />
                            <SwitchRow icon="refresh-outline" title="תזכורת לתור הבא" description="כשמגיע הזמן לחידוש" value={smsReturnReminders} onValueChange={(v) => handleToggleSms('sms_return_reminders', v)} />
                        </Card>
                    </Animated.View>
                </>
            )}

            <Animated.View entering={enter(2, reduced)}>
                <Card>
                    <SectionLabel>גודל טקסט</SectionLabel>
                    <View style={styles.sizes} accessibilityRole="radiogroup">
                        {(['small', 'medium', 'large'] as TextSizeLevel[]).map((size) => (
                            <Chip
                                key={size}
                                label={TEXT_SIZE_LABEL[size]}
                                selected={textSize === size}
                                onPress={() => setTextSize(size)}
                                style={styles.sizeChip}
                                accessibilityLabel={`גודל טקסט ${TEXT_SIZE_LABEL[size]}`}
                            />
                        ))}
                    </View>
                    <AppText variant="caption" tone="soft" style={styles.sizeHint}>הגודל חל על כל האפליקציה</AppText>
                </Card>
            </Animated.View>

            <Animated.View entering={enter(3, reduced)}>
                <Card padding={spacing.sm}>
                    <LinkRow icon="help-circle-outline" label="עזרה ויצירת קשר" onPress={() => router.push('/help')} />
                    <LinkRow icon="document-text-outline" label="תנאי שימוש" onPress={() => router.push('/terms')} />
                    <LinkRow icon="shield-checkmark-outline" label="מדיניות פרטיות" onPress={() => router.push('/privacy-policy')} last />
                </Card>
            </Animated.View>

            <Animated.View entering={enter(4, reduced)} style={styles.logout}>
                <Button label="התנתקות" variant="danger" icon="log-out-outline" fullWidth onPress={handleLogout} haptic="selection" />
                <AppText variant="caption" tone="soft" align="center">גרסה {LRM}{APP_VERSION}{LRM}</AppText>
            </Animated.View>
        </Screen>
    );
}

function SectionLabel({ children }: { children: string }) {
    return (
        <AppText variant="eyebrow" tone="roseDeep" style={styles.sectionLabel} accessibilityRole="header">
            {children}
        </AppText>
    );
}

function Divider() {
    return <View style={styles.divider} />;
}

function LinkRow({ icon, label, onPress, last }: { icon: IconName; label: string; onPress: () => void; last?: boolean }) {
    return (
        <PressableScale onPress={onPress} haptic="selection" accessibilityRole="button" accessibilityLabel={label} style={[styles.linkRow, last ? styles.linkRowLast : null]}>
            <View style={styles.linkIcon}>
                <Icon name={icon} size={18} tone="roseDeep" />
            </View>
            <AppText variant="body" style={styles.linkText}>{label}</AppText>
            <Chevron direction="forward" size={16} tone="soft" />
        </PressableScale>
    );
}

const styles = StyleSheet.create({
    sectionLabel: {
        textTransform: 'uppercase',
        marginBottom: spacing.xs,
    },
    divider: {
        height: 1,
        backgroundColor: colors.line,
    },
    sizes: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    sizeChip: {
        flex: 1,
    },
    sizeHint: {
        marginTop: spacing.sm,
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
        minHeight: 56,
    },
    linkRowLast: {
        borderBottomWidth: 0,
    },
    linkIcon: {
        width: 36,
        height: 36,
        borderRadius: radius.sm,
        backgroundColor: colors.roseMist,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkText: {
        flex: 1,
        fontFamily: typography.fontFamily.medium,
    },
    logout: {
        gap: spacing.md,
        marginTop: spacing.md,
    },
});
