"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from "@/components/icons";
import SectionHeader from "./SectionHeader";
import Reveal from "@/components/ui/Reveal";
import type { CourseItem, CourseStatus } from "@/lib/landing";
import { getCourseStatus, COURSE_STATUS_LABEL, formatCourseDate, formatPrice } from "@/lib/landing";
import styles from "./Courses.module.css";

interface CoursesProps {
    initialCourses?: CourseItem[];
}

function dateParts(dateStr: string) {
    const d = new Date(dateStr + (dateStr.length === 10 ? "T00:00:00" : ""));
    if (Number.isNaN(d.getTime())) return { day: "", month: "" };
    return {
        day: d.toLocaleDateString("he-IL", { day: "numeric" }),
        month: d.toLocaleDateString("he-IL", { month: "short" }),
    };
}

export default function Courses({ initialCourses }: CoursesProps) {
    const [courses, setCourses] = useState<CourseItem[]>(initialCourses || []);
    const [loading, setLoading] = useState(!initialCourses);

    useEffect(() => {
        if (initialCourses) return;
        async function fetchCourses() {
            try {
                const res = await fetch("/api/courses");
                if (res.ok) setCourses(await res.json());
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
            setLoading(false);
        }
        fetchCourses();
    }, [initialCourses]);

    if (loading || courses.length === 0) return null;

    const withStatus = courses.map((course) => ({ course, status: getCourseStatus(course) as CourseStatus }));
    const upcoming = withStatus
        .filter((c) => c.status !== "past")
        .sort((a, b) => a.course.date.localeCompare(b.course.date))
        .slice(0, 3);
    const hasOnlyPast = upcoming.length === 0;

    return (
        <section className={`section ${styles.section}`} id="courses" aria-labelledby="courses-title">
            <div className="container">
                <Reveal>
                    <SectionHeader
                        id="courses-title"
                        eyebrow="קורסים והכשרה"
                        title="ללמוד את המקצוע מקרוב"
                        subtitle="הכשרה מקצועית בקבוצות קטנות, עם ליווי אישי לאורך כל הדרך."
                        action={
                            !hasOnlyPast ? (
                                <Link href="/courses" className="btn btn-secondary">
                                    לכל הקורסים
                                    <ArrowLeftIcon size={16} />
                                </Link>
                            ) : undefined
                        }
                    />
                </Reveal>

                {hasOnlyPast ? (
                    <Reveal className={styles.emptyState}>
                        <span className="eyebrow">המועד הבא בקרוב</span>
                        <h3 className={`display ${styles.emptyTitle}`}>כרגע אין מועד פתוח להרשמה</h3>
                        <p className={styles.emptyText}>
                            המחזור הקודם הסתיים. פרטי המחזור הבא יפורסמו כאן. רוצה לשמור מקום? שלחי הודעה ואעדכן אותך ראשונה.
                        </p>
                        <a href="#contact" className="btn btn-primary">
                            עדכנו אותי על המועד הבא
                        </a>
                    </Reveal>
                ) : (
                    <div className={styles.list}>
                        {upcoming.map(({ course, status }, index) => {
                            const { day, month } = dateParts(course.date);
                            const remaining = Math.max(0, (Number(course.capacity) || 0) - (Number(course.enrolled) || 0));
                            const isFull = status === "full";

                            return (
                                <Reveal key={course.id} as="article" className={styles.card} delay={index * 80}>
                                    <div className={styles.dateBlock} aria-hidden="true">
                                        <span className={`display tabular ${styles.dateDay}`}>{day}</span>
                                        <span className={styles.dateMonth}>{month}</span>
                                    </div>

                                    <div className={styles.body}>
                                        <span className={`${styles.status} ${styles[status]}`}>
                                            {COURSE_STATUS_LABEL[status]}
                                        </span>
                                        <h3 className={`display ${styles.name}`}>{course.name}</h3>
                                        {course.description && (
                                            <p className={styles.description}>{course.description}</p>
                                        )}

                                        <ul className={styles.meta}>
                                            <li>
                                                <CalendarIcon size={15} />
                                                <span>{formatCourseDate(course.date)}</span>
                                            </li>
                                            {course.duration && (
                                                <li>
                                                    <ClockIcon size={15} />
                                                    <span>{course.duration}</span>
                                                </li>
                                            )}
                                            {course.location && (
                                                <li>
                                                    <MapPinIcon size={15} />
                                                    <span>{course.location}</span>
                                                </li>
                                            )}
                                            {course.capacity > 0 && (
                                                <li>
                                                    <UsersIcon size={15} />
                                                    <span className="tabular">
                                                        {isFull ? "כל המקומות נתפסו" : `נותרו ${remaining} מקומות מתוך ${course.capacity}`}
                                                    </span>
                                                </li>
                                            )}
                                        </ul>
                                        {course.schedule_info && (
                                            <p className={styles.schedule}>{course.schedule_info}</p>
                                        )}
                                    </div>

                                    <div className={styles.footer}>
                                        <div className={styles.priceBox}>
                                            <span className={styles.priceLabel}>עלות הקורס</span>
                                            <span className={`display tabular ${styles.price}`}>{formatPrice(course.price)}</span>
                                        </div>
                                        {isFull ? (
                                            <Link href="/courses" className="btn btn-secondary">
                                                לפרטים נוספים
                                            </Link>
                                        ) : (
                                            <Link href={`/courses#course-${course.id}`} className="btn btn-primary">
                                                הרשמה לקורס
                                                <ArrowLeftIcon size={16} />
                                            </Link>
                                        )}
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
