// Home – photo hero, next appointment ticket, shortcuts, gallery peek, courses
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated from 'react-native-reanimated';
import { Screen } from '../../components/ui/Screen';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { EmptyState } from '../../components/ui/EmptyState';
import { AppText } from '../../components/AppText';
import { HomeScreenSkeleton } from '../../components/SkeletonLoader';
import { HeroCard } from '../../components/home/HeroCard';
import { QuickActions } from '../../components/home/QuickActions';
import { GalleryStrip } from '../../components/home/GalleryStrip';
import { CoursesRail } from '../../components/home/CoursesRail';
import { NotificationsSoftAsk } from '../../components/home/NotificationsSoftAsk';
import { AppointmentTicket } from '../../components/booking/AppointmentTicket';
import { useBookingActions } from '../../components/booking/useBookingActions';
import { StarRating } from '../../components/StarRating';
import { useAuth } from '../../lib/auth';
import { useAppData } from '../../lib/appData';
import { getLastCompleted, getNextBooking } from '../../lib/booking';
import { splitCourses } from '../../lib/courses';
import { enter, useReducedMotion } from '../../lib/motion';
import { LRM } from '../../lib/format';
import { colors, spacing } from '../../lib/theme';

export default function HomeScreen() {
    const router = useRouter();
    const reduced = useReducedMotion();
    const { phone, name } = useAuth();
    const {
        settings,
        courses,
        bookings,
        gallery,
        reviewSummary,
        businessName,
        isBootstrapLoading,
        refreshBootstrap,
        refreshBookings,
        refreshGallery,
        refreshReviews,
        invalidateBookings,
        clientName: appClientName,
    } = useAppData();
    const actions = useBookingActions();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const clientName = appClientName || name || null;

    // Refetch (cache-aware) every time the tab gains focus
    useFocusEffect(
        useCallback(() => {
            if (phone) refreshBookings(phone);
        }, [phone, refreshBookings])
    );

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        invalidateBookings();
        await Promise.all([
            refreshBootstrap(true),
            refreshGallery(true),
            refreshReviews(),
            phone ? refreshBookings(phone, true) : Promise.resolve(),
        ]);
        setIsRefreshing(false);
    }, [phone, refreshBootstrap, refreshGallery, refreshReviews, refreshBookings, invalidateBookings]);

    const nextBooking = useMemo(() => getNextBooking(bookings), [bookings]);
    const lastCompleted = useMemo(() => getLastCompleted(bookings), [bookings]);
    const upcomingCourses = useMemo(() => splitCourses(courses).upcoming.slice(0, 5), [courses]);
    const galleryPeek = gallery.slice(0, 6);
    const hasRating = !!reviewSummary && reviewSummary.totalReviews > 0 && reviewSummary.averageRating > 0;

    if (isBootstrapLoading && bookings.length === 0 && gallery.length === 0) {
        return (
            <Screen scroll={false} padded={false}>
                <HomeScreenSkeleton />
            </Screen>
        );
    }

    return (
        <Screen withTabBar padded={false} refreshing={isRefreshing} onRefresh={onRefresh} edges={['top']}>
            <View style={styles.heroWrap}>
                <Animated.View entering={enter(0, reduced)}>
                    <HeroCard
                        name={clientName}
                        image={gallery[0] || null}
                        businessName={businessName}
                        operatingHours={settings.operatingHours}
                        onProfile={() => router.push('/profile')}
                    />
                </Animated.View>

                <Animated.View entering={enter(1, reduced)} style={styles.ticketWrap}>
                    {nextBooking ? (
                        <AppointmentTicket
                            booking={nextBooking}
                            variant="hero"
                            upcoming
                            modifiable={actions.canModify(nextBooking)}
                            onChange={() => actions.change(nextBooking)}
                            onCancel={() => actions.cancel(nextBooking)}
                            onCalendar={() => actions.addToCalendar(nextBooking)}
                            onContact={() => actions.contactForChange(nextBooking)}
                        />
                    ) : lastCompleted ? (
                        <Card tone="card" style={styles.rebook} elevated>
                            <View style={styles.rebookText}>
                                <AppText variant="eyebrow" tone="roseDeep">הפעם הבאה</AppText>
                                <AppText variant="heading">לקבוע שוב {lastCompleted.service?.name || 'טיפול'}?</AppText>
                                <AppText variant="body-sm" tone="muted">בחירת מועד לוקחת פחות מדקה.</AppText>
                            </View>
                            <Button
                                label="לקביעת תור"
                                icon="calendar-outline"
                                onPress={() => router.push(lastCompleted.service_id ? `/(tabs)/book?service=${lastCompleted.service_id}` : '/(tabs)/book')}
                            />
                        </Card>
                    ) : (
                        <Card tone="card" style={styles.rebook} elevated>
                            <View style={styles.rebookText}>
                                <AppText variant="eyebrow" tone="roseDeep">ברוכה הבאה</AppText>
                                <AppText variant="heading">התור הראשון שלך מחכה</AppText>
                                <AppText variant="body-sm" tone="muted">בחרי טיפול, תאריך ושעה ונשלח לך אישור ב-SMS.</AppText>
                            </View>
                            <Button label="לקביעת תור" icon="calendar-outline" onPress={() => router.push('/(tabs)/book')} />
                        </Card>
                    )}
                </Animated.View>
            </View>

            <View style={styles.body}>
                <Animated.View entering={enter(2, reduced)}>
                    <QuickActions
                        actions={[
                            { icon: 'calendar-outline', label: 'קביעת תור', onPress: () => router.push('/(tabs)/book'), primary: true },
                            { icon: 'images-outline', label: 'גלריה', onPress: () => router.push('/(tabs)/gallery') },
                            { icon: 'school-outline', label: 'קורסים', onPress: () => router.push('/(tabs)/courses') },
                        ]}
                    />
                </Animated.View>

                <NotificationsSoftAsk eligible={bookings.length > 0} />

                {hasRating ? (
                    <Animated.View entering={enter(3, reduced)} style={styles.proof}>
                        <StarRating rating={reviewSummary!.averageRating} size={14} />
                        <AppText variant="body-sm" tone="muted">
                            {LRM}{reviewSummary!.averageRating.toFixed(1)}{LRM} · {LRM}{reviewSummary!.totalReviews}{LRM} ביקורות של לקוחות
                        </AppText>
                    </Animated.View>
                ) : null}

                {galleryPeek.length > 0 ? (
                    <Animated.View entering={enter(4, reduced)} style={styles.section}>
                        <SectionHeader eyebrow="מהסטודיו" title="עבודות אחרונות" action={{ label: 'לגלריה', onPress: () => router.push('/(tabs)/gallery') }} />
                        <GalleryStrip images={galleryPeek} onPress={() => router.push('/(tabs)/gallery')} />
                    </Animated.View>
                ) : null}

                {upcomingCourses.length > 0 ? (
                    <Animated.View entering={enter(5, reduced)} style={styles.section}>
                        <SectionHeader eyebrow="האקדמיה" title="קורסים קרובים" action={{ label: 'לכל הקורסים', onPress: () => router.push('/(tabs)/courses') }} />
                        <CoursesRail items={upcomingCourses} onPress={(c) => router.push(`/course/${c.id}`)} />
                    </Animated.View>
                ) : null}

                {bookings.length === 0 && galleryPeek.length === 0 && upcomingCourses.length === 0 ? (
                    <EmptyState
                        icon="sparkles-outline"
                        title="נעים שהגעת"
                        body="עדיין אין כאן תורים. כשתקבעי, נציג כאן את התור הקרוב, הגלריה והקורסים."
                        action={{ label: 'לקביעת תור', onPress: () => router.push('/(tabs)/book'), icon: 'calendar-outline' }}
                        compact
                    />
                ) : null}

                <View style={styles.footerNote}>
                    <Icon name="location-outline" size={14} tone="soft" />
                    <AppText variant="caption" tone="soft">
                        {settings.address ? settings.address : businessName}
                    </AppText>
                </View>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    heroWrap: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
    },
    ticketWrap: {
        marginTop: -spacing['2xl'] - spacing.sm,
        paddingHorizontal: spacing.sm,
    },
    rebook: {
        gap: spacing.md,
        backgroundColor: colors.card,
    },
    rebookText: {
        gap: 2,
    },
    body: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        gap: spacing.xl,
    },
    proof: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        alignSelf: 'flex-start',
    },
    section: {
        gap: spacing.xs,
    },
    footerNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        justifyContent: 'center',
        paddingTop: spacing.md,
    },
});
