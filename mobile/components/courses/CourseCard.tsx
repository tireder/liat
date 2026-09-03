// CourseCard – status-aware course card with photo, meta and a single CTA.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../AppText';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { ImageTile } from '../ui/ImageTile';
import { PolishDot } from '../ui/PolishDot';
import { PressableScale } from '../ui/PressableScale';
import type { Course, GalleryImage } from '../../lib/api';
import { COURSE_STATUS_LABEL, CourseStatus, formatCourseDate, spotsLeft } from '../../lib/courses';
import { formatPrice, LRM } from '../../lib/format';
import { colors, radius, spacing, typography } from '../../lib/theme';

export interface CourseCardProps {
    course: Course;
    status: CourseStatus;
    registered?: boolean;
    image?: GalleryImage | null;
    onOpen: () => void;
    onRegister?: () => void;
}

const TONE: Record<CourseStatus, 'success' | 'warning' | 'neutral' | 'danger'> = {
    upcoming: 'success',
    limited: 'warning',
    full: 'neutral',
    past: 'neutral',
};

/** Deterministic decorative photo per course (never invents content). */
export function pickCourseImage(courseId: string, gallery: GalleryImage[]): GalleryImage | null {
    if (gallery.length === 0) return null;
    let h = 0;
    for (let i = 0; i < courseId.length; i++) h = (h * 31 + courseId.charCodeAt(i)) >>> 0;
    return gallery[h % gallery.length];
}

export function CourseCard({ course, status, registered, image, onOpen, onRegister }: CourseCardProps) {
    const isPast = status === 'past';
    const isFull = status === 'full';
    const left = spotsLeft(course);

    return (
        <PressableScale
            onPress={onOpen}
            haptic="selection"
            accessibilityRole="button"
            accessibilityLabel={`${course.name}, ${COURSE_STATUS_LABEL[status]}, ${formatPrice(course.price)}`}
            style={[styles.card, isPast ? styles.cardPast : null]}
        >
            <ImageTile uri={image?.image_url} decorative aspectRatio={16 / 9} borderRadius={radius.md} scrim="bottom" style={styles.image}>
                <View style={styles.imageTop}>
                    <Badge label={registered ? 'נרשמת' : COURSE_STATUS_LABEL[status]} tone={registered ? 'rose' : TONE[status]} />
                    <PolishDot seed={course.id} size={20} />
                </View>
                <AppText variant="display-sm" style={styles.imageTitle} numberOfLines={2}>{course.name}</AppText>
            </ImageTile>

            <View style={styles.body}>
                {course.description ? (
                    <AppText variant="body-sm" tone="muted" numberOfLines={2}>{course.description}</AppText>
                ) : null}

                <View style={styles.meta}>
                    <Meta icon="calendar-outline" text={formatCourseDate(course.date)} />
                    {course.duration ? <Meta icon="time-outline" text={course.duration} /> : null}
                    {!isPast && course.capacity > 0 ? (
                        <Meta icon="people-outline" text={isFull ? 'כל המקומות נתפסו' : `נותרו ${LRM}${left}${LRM} מקומות מתוך ${LRM}${course.capacity}${LRM}`} />
                    ) : null}
                </View>

                <View style={styles.footer}>
                    <View>
                        <AppText variant="caption" tone="soft">עלות הקורס</AppText>
                        <AppText style={styles.price}>{formatPrice(course.price)}</AppText>
                    </View>
                    {registered ? (
                        <Button label="לפרטים" variant="ghost" size="sm" onPress={onOpen} />
                    ) : isPast ? (
                        <AppText variant="caption" tone="soft">המחזור הסתיים</AppText>
                    ) : isFull ? (
                        <Button label="לפרטים" variant="secondary" size="sm" onPress={onOpen} />
                    ) : onRegister ? (
                        <Button label="הרשמה" size="sm" icon="arrow-back-outline" iconPosition="end" onPress={onRegister} />
                    ) : null}
                </View>
            </View>
        </PressableScale>
    );
}

function Meta({ icon, text }: { icon: 'calendar-outline' | 'time-outline' | 'people-outline'; text: string }) {
    return (
        <View style={styles.metaItem}>
            <Icon name={icon} size={14} tone="roseDeep" />
            <AppText variant="body-sm" tone="muted" style={styles.metaText}>{text}</AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.line,
        padding: spacing.sm,
        gap: spacing.md,
    },
    cardPast: {
        opacity: 0.8,
    },
    image: {
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    imageTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    imageTitle: {
        color: colors.white,
    },
    body: {
        paddingHorizontal: spacing.sm,
        paddingBottom: spacing.sm,
        gap: spacing.md,
    },
    meta: {
        gap: spacing.xs,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    metaText: {
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.line,
    },
    price: {
        fontFamily: typography.fontFamily.displayMedium,
        fontSize: 22,
        lineHeight: 26,
        color: colors.ink,
    },
});

export default CourseCard;
