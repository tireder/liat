// Course detail – photo hero, facts, registered-only info, registration CTA
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../components/ui/Screen';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Icon, IconName } from '../../components/ui/Icon';
import { ImageTile } from '../../components/ui/ImageTile';
import { EmptyState } from '../../components/ui/EmptyState';
import { AppText } from '../../components/AppText';
import { CourseDetailSkeleton } from '../../components/SkeletonLoader';
import { pickCourseImage } from '../../components/courses/CourseCard';
import { useCourseRegistration } from '../../components/courses/useCourseRegistration';
import { useToast } from '../../components/feedback/Toast';
import { useAppData } from '../../lib/appData';
import { coursesApi, Course } from '../../lib/api';
import { COURSE_STATUS_LABEL, formatCourseDate, getCourseStatus, spotsLeft } from '../../lib/courses';
import { openMaps, openUrl } from '../../lib/contact';
import { formatPrice, LRM } from '../../lib/format';
import { enter, useReducedMotion } from '../../lib/motion';
import { brandNailImage } from '../../lib/brand';
import { colors, radius, spacing, typography } from '../../lib/theme';

export default function CourseDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const reduced = useReducedMotion();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { courses, gallery, isBootstrapLoading, myCourseIds, businessAddress } = useAppData();
    const { register, busyId } = useCourseRegistration();
    const { show } = useToast();

    const cached = courses.find((c) => c.id === id) || null;
    const [fetched, setFetched] = useState<Course | null>(null);
    const [fetching, setFetching] = useState(false);
    const [fetchFailed, setFetchFailed] = useState(false);

    // Cold deep link: the course may not be in the bootstrap cache yet
    useEffect(() => {
        if (cached || isBootstrapLoading || fetched || fetching || !id) return;
        setFetching(true);
        coursesApi.list().then((result) => {
            const found = result.data?.find((c) => c.id === id) || null;
            setFetched(found);
            setFetchFailed(!found);
            setFetching(false);
        });
    }, [cached, isBootstrapLoading, fetched, fetching, id]);

    const course = cached || fetched;
    const status = useMemo(() => (course ? getCourseStatus(course) : null), [course]);
    const registered = !!course && myCourseIds.includes(course.id);
    const image = course ? pickCourseImage(course.id, gallery) : null;

    const handleRegister = useCallback(async () => {
        if (!course) return;
        const ok = await register(course);
        if (ok) router.replace('/(tabs)/courses');
    }, [course, register, router]);

    if (!course) {
        return (
            <Screen scroll={false} header={<Header title="פרטי קורס" />}>
                {isBootstrapLoading || fetching ? (
                    <CourseDetailSkeleton />
                ) : (
                    <EmptyState
                        icon="school-outline"
                        title="הקורס לא נמצא"
                        body={fetchFailed ? 'ייתכן שהקורס הוסר או שהקישור אינו תקף.' : 'לא הצלחנו לטעון את פרטי הקורס.'}
                        action={{ label: 'לכל הקורסים', onPress: () => router.replace('/(tabs)/courses') }}
                        secondaryAction={fetchFailed ? undefined : { label: 'נסי שוב', onPress: () => { setFetched(null); setFetchFailed(false); } }}
                    />
                )}
            </Screen>
        );
    }

    const isPast = status === 'past';
    const isFull = status === 'full';
    const canRegister = !isPast && !isFull && !registered;

    return (
        <Screen
            padded={false}
            edges={['top']}
            header={<Header title="" tone="light" />}
            footer={
                <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
                    <View>
                        <AppText variant="caption" tone="soft">עלות הקורס</AppText>
                        <AppText style={styles.price}>{formatPrice(course.price)}</AppText>
                    </View>
                    {registered ? (
                        <Badge label="נרשמת לקורס" tone="rose" />
                    ) : canRegister ? (
                        <Button label="הרשמה לקורס" size="lg" onPress={handleRegister} loading={busyId === course.id} style={styles.cta} />
                    ) : (
                        <AppText variant="body-sm" tone="muted">{isPast ? 'המחזור הסתיים' : 'אין מקומות פנויים'}</AppText>
                    )}
                </View>
            }
        >
            <Animated.View entering={enter(0, reduced)} style={styles.heroWrap}>
                <ImageTile uri={image?.image_url} source={brandNailImage(course.id)} decorative aspectRatio={4 / 3} borderRadius={radius.xl} scrim="full" style={styles.hero}>
                    <View style={styles.heroTop}>
                        <Badge label={registered ? 'נרשמת' : COURSE_STATUS_LABEL[status!]} tone={registered ? 'rose' : status === 'upcoming' ? 'success' : status === 'limited' ? 'warning' : 'neutral'} />
                    </View>
                    <View style={styles.heroCopy}>
                        <AppText variant="eyebrow" style={styles.heroEyebrow}>קורס</AppText>
                        <AppText variant="display" style={styles.heroTitle} accessibilityRole="header">{course.name}</AppText>
                    </View>
                </ImageTile>
            </Animated.View>

            <View style={styles.body}>
                <Animated.View entering={enter(1, reduced)}>
                    <Card>
                        <AppText variant="eyebrow" tone="roseDeep" style={styles.cardEyebrow}>פרטי הקורס</AppText>
                        <Fact icon="calendar-outline" label="תאריך" value={formatCourseDate(course.date)} />
                        {course.duration ? <Fact icon="time-outline" label="משך" value={course.duration} /> : null}
                        {course.capacity > 0 && !isPast ? (
                            <Fact icon="people-outline" label="מקומות" value={isFull ? 'כל המקומות נתפסו' : `נותרו ${LRM}${spotsLeft(course)}${LRM} מתוך ${LRM}${course.capacity}${LRM}`} last />
                        ) : null}
                    </Card>
                </Animated.View>

                {course.description ? (
                    <Animated.View entering={enter(2, reduced)}>
                        <Card>
                            <AppText variant="eyebrow" tone="roseDeep" style={styles.cardEyebrow}>על הקורס</AppText>
                            <AppText variant="body">{course.description}</AppText>
                        </Card>
                    </Animated.View>
                ) : null}

                {registered && (course.location || course.schedule_info || course.whatsapp_group_link) ? (
                    <Animated.View entering={enter(3, reduced)}>
                        <Card tone="blush">
                            <AppText variant="eyebrow" tone="roseDeep" style={styles.cardEyebrow}>מידע לנרשמות</AppText>
                            {course.location ? (
                                <Fact icon="location-outline" label="מיקום" value={course.location} onPress={() => openMaps(course.location).then((ok) => !ok && show({ message: 'לא הצלחנו לפתוח ניווט', tone: 'error' }))} />
                            ) : null}
                            {course.schedule_info ? <Fact icon="list-outline" label="לו״ז מתוכנן" value={course.schedule_info} /> : null}
                            {course.whatsapp_group_link ? (
                                <Button
                                    label="הצטרפי לקבוצת הוואטסאפ"
                                    icon="logo-whatsapp"
                                    variant="rose"
                                    fullWidth
                                    onPress={() => openUrl(course.whatsapp_group_link)}
                                    style={styles.groupBtn}
                                />
                            ) : null}
                        </Card>
                    </Animated.View>
                ) : null}

                {businessAddress && !registered ? (
                    <Animated.View entering={enter(3, reduced)}>
                        <AppText variant="caption" tone="soft" align="center">
                            מיקום הקורס ופרטי ההגעה נשלחים לנרשמות · {businessAddress}
                        </AppText>
                    </Animated.View>
                ) : null}
            </View>
        </Screen>
    );
}

function Fact({ icon, label, value, last, onPress }: { icon: IconName; label: string; value: string; last?: boolean; onPress?: () => void }) {
    const content = (
        <View style={[styles.fact, last ? styles.factLast : null]}>
            <View style={styles.factIcon}>
                <Icon name={icon} size={18} tone="roseDeep" />
            </View>
            <View style={styles.factText}>
                <AppText variant="caption" tone="soft">{label}</AppText>
                <AppText variant="body">{value}</AppText>
            </View>
            {onPress ? <Icon name="navigate-outline" size={16} tone="soft" /> : null}
        </View>
    );
    if (!onPress) return content;
    return (
        <Card tone="transparent" padding={0} onPress={onPress} accessibilityLabel={`${label}: ${value}, ניווט`} style={styles.factPress}>
            {content}
        </Card>
    );
}

const styles = StyleSheet.create({
    heroWrap: {
        paddingHorizontal: spacing.lg,
    },
    hero: {
        justifyContent: 'space-between',
        padding: spacing.lg,
    },
    heroTop: {
        flexDirection: 'row',
    },
    heroCopy: {
        gap: spacing.xs,
    },
    heroEyebrow: {
        color: colors.roseSoft,
        textTransform: 'uppercase',
    },
    heroTitle: {
        color: colors.white,
    },
    body: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    cardEyebrow: {
        textTransform: 'uppercase',
        marginBottom: spacing.md,
    },
    fact: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    factLast: {
        borderBottomWidth: 0,
    },
    factPress: {
        borderWidth: 0,
    },
    factIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.roseMist,
        alignItems: 'center',
        justifyContent: 'center',
    },
    factText: {
        flex: 1,
    },
    groupBtn: {
        marginTop: spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        backgroundColor: colors.bg,
        borderTopWidth: 1,
        borderTopColor: colors.line,
    },
    price: {
        fontFamily: typography.fontFamily.displayMedium,
        fontSize: 26,
        lineHeight: 30,
        color: colors.ink,
    },
    cta: {
        flex: 1,
        maxWidth: 220,
    },
});

