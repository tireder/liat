// Course status derived from the course's own date and enrollment.
import type { Course } from './api';
import { parseLocalDate, HEBREW_DAYS, HEBREW_MONTHS } from './format';

export type CourseStatus = 'upcoming' | 'limited' | 'full' | 'past';

export function getCourseStatus(course: Pick<Course, 'date' | 'capacity' | 'enrolled'>, now: Date = new Date()): CourseStatus {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const courseDate = parseLocalDate(course.date);
    if (!Number.isNaN(courseDate.getTime()) && courseDate < today) return 'past';

    const capacity = Number(course.capacity) || 0;
    const enrolled = Number(course.enrolled) || 0;
    if (capacity > 0 && enrolled >= capacity) return 'full';
    if (capacity > 0 && capacity - enrolled <= 2) return 'limited';
    return 'upcoming';
}

export const COURSE_STATUS_LABEL: Record<CourseStatus, string> = {
    upcoming: 'ההרשמה פתוחה',
    limited: 'מקומות אחרונים',
    full: 'הקורס מלא',
    past: 'הסתיים',
};

export function spotsLeft(course: Pick<Course, 'capacity' | 'enrolled'>): number {
    return Math.max(0, (Number(course.capacity) || 0) - (Number(course.enrolled) || 0));
}

/** "יום שלישי, 20 באוקטובר 2026" */
export function formatCourseDate(dateStr: string): string {
    const d = parseLocalDate(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return `יום ${HEBREW_DAYS[d.getDay()]}, ${d.getDate()} ב${HEBREW_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Upcoming first (soonest), then past (most recent first). */
export function splitCourses(courses: Course[], now: Date = new Date()) {
    const withStatus = courses.map((course) => ({ course, status: getCourseStatus(course, now) }));
    const upcoming = withStatus
        .filter((c) => c.status !== 'past')
        .sort((a, b) => a.course.date.localeCompare(b.course.date));
    const past = withStatus
        .filter((c) => c.status === 'past')
        .sort((a, b) => b.course.date.localeCompare(a.course.date));
    return { upcoming, past };
}
