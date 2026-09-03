// CoursesRail – horizontal cards for upcoming courses.
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '../AppText';
import { Badge } from '../ui/Badge';
import { PolishDot } from '../ui/PolishDot';
import { PressableScale } from '../ui/PressableScale';
import type { Course } from '../../lib/api';
import { COURSE_STATUS_LABEL, CourseStatus } from '../../lib/courses';
import { dateParts, formatPrice, LRM } from '../../lib/format';
import { colors, radius, spacing, typography } from '../../lib/theme';

interface CoursesRailProps {
    items: { course: Course; status: CourseStatus }[];
    onPress: (course: Course) => void;
}

const TONE: Record<CourseStatus, 'success' | 'warning' | 'neutral' | 'danger'> = {
    upcoming: 'success',
    limited: 'warning',
    full: 'neutral',
    past: 'neutral',
};

export function CoursesRail({ items, onPress }: CoursesRailProps) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} style={styles.scroll}>
            {items.map(({ course, status }) => {
                const parts = dateParts(course.date);
                return (
                    <PressableScale
                        key={course.id}
                        onPress={() => onPress(course)}
                        haptic="selection"
                        accessibilityRole="button"
                        accessibilityLabel={`${course.name}, ${COURSE_STATUS_LABEL[status]}, ${formatPrice(course.price)}`}
                        style={styles.card}
                    >
                        <View style={styles.top}>
                            <PolishDot seed={course.id} size={18} />
                            <View style={styles.date}>
                                <AppText style={styles.dateDay}>{LRM}{parts.day}{LRM}</AppText>
                                <AppText variant="caption" tone="roseDeep">{parts.month}</AppText>
                            </View>
                        </View>
                        <AppText variant="heading" numberOfLines={2} style={styles.name}>{course.name}</AppText>
                        <View style={styles.bottom}>
                            <Badge label={COURSE_STATUS_LABEL[status]} tone={TONE[status]} />
                            <AppText style={styles.price}>{formatPrice(course.price)}</AppText>
                        </View>
                    </PressableScale>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        marginHorizontal: -spacing.lg,
    },
    row: {
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    card: {
        width: 220,
        padding: spacing.lg,
        borderRadius: radius.lg,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.line,
        gap: spacing.md,
    },
    top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    date: {
        alignItems: 'center',
    },
    dateDay: {
        fontFamily: typography.fontFamily.displayMedium,
        fontSize: 24,
        lineHeight: 28,
        color: colors.ink,
    },
    name: {
        minHeight: 48,
    },
    bottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontFamily: typography.fontFamily.displayMedium,
        fontSize: 18,
        lineHeight: 22,
        color: colors.ink,
    },
});

export default CoursesRail;
