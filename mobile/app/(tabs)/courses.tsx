// Courses – upcoming cohorts first, past cohorts collapsed, registration via sheet
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated from 'react-native-reanimated';
import { Screen } from '../../components/ui/Screen';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { AppText } from '../../components/AppText';
import { CoursesSkeleton } from '../../components/SkeletonLoader';
import { CourseCard, pickCourseImage } from '../../components/courses/CourseCard';
import { useCourseRegistration } from '../../components/courses/useCourseRegistration';
import { useContactSheet } from '../../components/feedback/ContactSheet';
import { useAuth } from '../../lib/auth';
import { useAppData } from '../../lib/appData';
import { splitCourses } from '../../lib/courses';
import { enter, useReducedMotion } from '../../lib/motion';
import { spacing } from '../../lib/theme';

export default function CoursesScreen() {
    const router = useRouter();
    const reduced = useReducedMotion();
    const { phone } = useAuth();
    const { courses, gallery, isBootstrapLoading, refreshBootstrap, refreshBookings, myCourseIds } = useAppData();
    const { register } = useCourseRegistration();
    const contactSheet = useContactSheet();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showPast, setShowPast] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (phone) refreshBookings(phone);
        }, [phone, refreshBookings])
    );

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await Promise.all([refreshBootstrap(true), phone ? refreshBookings(phone, true) : Promise.resolve()]);
        setIsRefreshing(false);
    }, [refreshBootstrap, refreshBookings, phone]);

    const { upcoming, past } = useMemo(() => splitCourses(courses), [courses]);
    const loading = isBootstrapLoading && courses.length === 0;

    return (
        <Screen withTabBar refreshing={isRefreshing} onRefresh={onRefresh} header={<Header title="קורסים" showBack={false} large eyebrow="האקדמיה" />}>
            {loading ? (
                <CoursesSkeleton />
            ) : courses.length === 0 ? (
                <EmptyState
                    icon="school-outline"
                    title="אין קורסים פתוחים כרגע"
                    body="המועד הבא יפורסם כאן. רוצה שנעדכן אותך ראשונה?"
                    action={{ label: 'עדכנו אותי על המועד הבא', onPress: () => contactSheet({ title: 'עדכון על הקורס הבא', whatsappText: 'היי, אשמח לקבל עדכון כשייפתח הקורס הבא' }), icon: 'chatbubble-ellipses-outline' }}
                />
            ) : (
                <View style={styles.list}>
                    {upcoming.length === 0 ? (
                        <EmptyState
                            icon="hourglass-outline"
                            title="כרגע אין מועד פתוח להרשמה"
                            body="המחזור הקודם הסתיים. פרטי המחזור הבא יפורסמו כאן."
                            action={{ label: 'עדכנו אותי על המועד הבא', onPress: () => contactSheet({ title: 'עדכון על הקורס הבא', whatsappText: 'היי, אשמח לקבל עדכון כשייפתח הקורס הבא' }), icon: 'chatbubble-ellipses-outline' }}
                            compact
                        />
                    ) : (
                        <AppText variant="body" tone="muted" style={styles.intro}>
                            הכשרה מקצועית בקבוצות קטנות עם ליווי אישי. ההרשמה מאושרת אחרי שיחה קצרה.
                        </AppText>
                    )}

                    {upcoming.map(({ course, status }, i) => (
                        <Animated.View key={course.id} entering={enter(i, reduced)}>
                            <CourseCard
                                course={course}
                                status={status}
                                registered={myCourseIds.includes(course.id)}
                                image={pickCourseImage(course.id, gallery)}
                                onOpen={() => router.push(`/course/${course.id}`)}
                                onRegister={() => register(course)}
                            />
                        </Animated.View>
                    ))}

                    {past.length > 0 ? (
                        <View style={styles.pastSection}>
                            <Button
                                label={showPast ? 'הסתירי מחזורים קודמים' : `מחזורים קודמים (${past.length})`}
                                variant="text"
                                icon={showPast ? 'chevron-up' : 'chevron-down'}
                                iconPosition="end"
                                onPress={() => setShowPast((v) => !v)}
                                haptic="selection"
                            />
                            {showPast
                                ? past.map(({ course, status }) => (
                                      <CourseCard
                                          key={course.id}
                                          course={course}
                                          status={status}
                                          registered={myCourseIds.includes(course.id)}
                                          image={pickCourseImage(course.id, gallery)}
                                          onOpen={() => router.push(`/course/${course.id}`)}
                                      />
                                  ))
                                : null}
                        </View>
                    ) : null}
                </View>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    list: {
        gap: spacing.lg,
    },
    intro: {
        marginBottom: spacing.xs,
    },
    pastSection: {
        gap: spacing.lg,
        paddingTop: spacing.md,
        alignItems: 'stretch',
    },
});
