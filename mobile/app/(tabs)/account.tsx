// Account – the single personal area: identity, settings entry, and the
// bookings list (upcoming / past) with tickets, sort sheet and in-app review entry
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated from 'react-native-reanimated';
import { Screen } from '../../components/ui/Screen';
import { Header } from '../../components/ui/Header';
import { Chip } from '../../components/ui/Chip';
import { EmptyState } from '../../components/ui/EmptyState';
import { PressableScale } from '../../components/ui/PressableScale';
import { Chevron, Icon } from '../../components/ui/Icon';
import { AppText } from '../../components/AppText';
import { AppointmentsSkeleton } from '../../components/SkeletonLoader';
import { AppointmentTicket } from '../../components/booking/AppointmentTicket';
import { useBookingActions } from '../../components/booking/useBookingActions';
import { useSheet } from '../../components/feedback/ConfirmSheet';
import { useAuth } from '../../lib/auth';
import { useAppData } from '../../lib/appData';
import { BookingSort, isUpcoming, sortBookings } from '../../lib/booking';
import { a11yButton } from '../../lib/a11y';
import { formatPhoneDisplay, LRM } from '../../lib/format';
import { enter, useReducedMotion } from '../../lib/motion';
import { colors, radius, spacing, typography } from '../../lib/theme';

type Filter = 'upcoming' | 'past';

const SORT_LABEL: Record<BookingSort, string> = {
    'date-asc': 'תאריך (הקרוב קודם)',
    'date-desc': 'תאריך (הרחוק קודם)',
    service: 'לפי טיפול',
    status: 'לפי סטטוס',
};

export default function AccountScreen() {
    const router = useRouter();
    const reduced = useReducedMotion();
    const { phone, name } = useAuth();
    const { bookings, isBookingsLoading, refreshBookings, invalidateBookings, clientName: appClientName } = useAppData();
    const actions = useBookingActions();
    const { present } = useSheet();

    const clientName = appClientName || name || null;

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filter, setFilter] = useState<Filter>('upcoming');
    const [sortBy, setSortBy] = useState<BookingSort>('date-asc');

    useFocusEffect(
        useCallback(() => {
            if (phone) refreshBookings(phone);
        }, [phone, refreshBookings])
    );

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        invalidateBookings();
        if (phone) await refreshBookings(phone, true);
        setIsRefreshing(false);
    }, [phone, refreshBookings, invalidateBookings]);

    const { upcoming, past } = useMemo(() => {
        const now = new Date();
        const up = bookings.filter((b) => isUpcoming(b, now));
        const pa = bookings.filter((b) => !isUpcoming(b, now));
        return { upcoming: up, past: pa };
    }, [bookings]);

    const list = useMemo(() => {
        const base = filter === 'upcoming' ? upcoming : past;
        const effectiveSort: BookingSort = filter === 'past' && sortBy === 'date-asc' ? 'date-desc' : sortBy;
        return sortBookings(base, effectiveSort);
    }, [filter, upcoming, past, sortBy]);

    const chooseSort = async () => {
        const choice = await present({
            title: 'מיון התורים',
            layout: 'list',
            actions: (Object.keys(SORT_LABEL) as BookingSort[]).map((key) => ({
                id: key,
                label: SORT_LABEL[key],
                icon: key === sortBy ? 'checkmark-circle' : 'ellipse-outline',
            })),
            cancelLabel: 'סגירה',
        });
        if (choice) setSortBy(choice as BookingSort);
    };

    const openSettings = () => router.push('/settings');

    const loading = isBookingsLoading && bookings.length === 0;

    return (
        <Screen
            withTabBar
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            header={
                <View>
                    <Header
                        title="החשבון שלי"
                        showBack={false}
                        large
                        eyebrow="האזור האישי"
                        left={
                            <PressableScale onPress={openSettings} style={styles.iconBtn} {...a11yButton('הגדרות')}>
                                <Icon name="settings-outline" size={18} tone="ink" />
                            </PressableScale>
                        }
                        right={
                            <PressableScale onPress={chooseSort} style={styles.iconBtn} {...a11yButton('מיון התורים')}>
                                <Icon name="swap-vertical-outline" size={18} tone="ink" />
                            </PressableScale>
                        }
                    />

                    <Animated.View entering={enter(0, reduced)} style={styles.identityWrap}>
                        <PressableScale
                            onPress={openSettings}
                            haptic="selection"
                            accessibilityRole="button"
                            accessibilityLabel="הפרטים וההגדרות שלי"
                            style={styles.identity}
                        >
                            <View style={styles.avatar}>
                                <AppText style={styles.avatarText}>{(clientName || 'ל').trim().charAt(0)}</AppText>
                            </View>
                            <View style={styles.identityText}>
                                <AppText variant="heading" numberOfLines={1}>{clientName || 'לקוחה'}</AppText>
                                <AppText variant="body-sm" tone="muted" style={styles.phone}>{LRM}{formatPhoneDisplay(phone)}{LRM}</AppText>
                            </View>
                            <View style={styles.settingsHint}>
                                <AppText variant="caption" tone="soft">הגדרות</AppText>
                                <Chevron direction="forward" size={14} tone="soft" />
                            </View>
                        </PressableScale>
                    </Animated.View>

                    <View style={styles.listHeader}>
                        <AppText variant="eyebrow" tone="roseDeep" style={styles.listEyebrow} accessibilityRole="header">
                            התורים שלי
                        </AppText>
                        <View style={styles.filters} accessibilityRole="tablist">
                            <Chip label={`בקרוב${upcoming.length ? ` · ${upcoming.length}` : ''}`} selected={filter === 'upcoming'} onPress={() => setFilter('upcoming')} size="sm" />
                            <Chip label={`עבר${past.length ? ` · ${past.length}` : ''}`} selected={filter === 'past'} onPress={() => setFilter('past')} size="sm" />
                        </View>
                    </View>
                </View>
            }
        >
            {loading ? (
                <AppointmentsSkeleton />
            ) : list.length === 0 ? (
                filter === 'upcoming' ? (
                    <EmptyState
                        icon="calendar-outline"
                        title="אין תורים קרובים"
                        body="כשתקבעי תור הוא יופיע כאן עם כל האפשרויות: שינוי, ביטול והוספה ליומן."
                        action={{ label: 'לקביעת תור', onPress: () => router.push('/(tabs)/book'), icon: 'calendar-outline' }}
                    />
                ) : (
                    <EmptyState icon="time-outline" title="עוד אין היסטוריה" body="תורים שהסתיימו יופיעו כאן, ותוכלי לדרג אותם." compact />
                )
            ) : (
                <View style={styles.list}>
                    {list.map((b, i) => {
                        const up = filter === 'upcoming';
                        return (
                            <Animated.View key={b.id} entering={enter(i + 1, reduced)}>
                                <AppointmentTicket
                                    booking={b}
                                    upcoming={up}
                                    modifiable={up && actions.canModify(b)}
                                    onChange={up ? () => actions.change(b) : undefined}
                                    onCancel={up ? () => actions.cancel(b) : undefined}
                                    onCalendar={up ? () => actions.addToCalendar(b) : undefined}
                                    onContact={up ? () => actions.contactForChange(b) : undefined}
                                    onReview={b.review_token ? () => actions.review(b) : undefined}
                                />
                            </Animated.View>
                        );
                    })}
                    {filter === 'past' ? (
                        <AppText variant="caption" tone="soft" align="center" style={styles.note}>
                            תורים שהושלמו עם קישור לביקורת מציגים כפתור דירוג
                        </AppText>
                    ) : null}
                </View>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: colors.lineStrong,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    identityWrap: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
    identity: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.card,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.ink,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontFamily: typography.fontFamily.display,
        fontSize: 24,
        lineHeight: 30,
        color: colors.inkInverse,
    },
    identityText: {
        flex: 1,
        gap: 2,
    },
    phone: {
        writingDirection: 'ltr',
        textAlign: 'right',
    },
    settingsHint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    listHeader: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        gap: spacing.sm,
    },
    listEyebrow: {
        textTransform: 'uppercase',
    },
    filters: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    list: {
        gap: spacing.md,
        paddingTop: spacing.xs,
    },
    note: {
        paddingTop: spacing.sm,
    },
});
