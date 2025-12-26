"use client";

import { useEffect, useState } from "react";
import { BookIcon, CalendarIcon, ClockIcon, UsersIcon, CheckIcon, CertificateIcon, GiftIcon } from "@/components/icons";
import styles from "./Courses.module.css";

interface Course {
    id: string;
    name: string;
    description: string | null;
    date: string;
    duration: string;
    price: number;
    capacity: number;
    enrolled: number;
}

export default function Courses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourses() {
            try {
                const res = await fetch("/api/courses");
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data);
                }
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
            setLoading(false);
        }
        fetchCourses();
    }, []);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
    };

    if (loading) {
        return (
            <section className={styles.section} id="courses">
                <div className={styles.container}>
                    <div className={styles.loading}>טוען קורסים...</div>
                </div>
            </section>
        );
    }

    if (courses.length === 0) {
        return null; // Hide section if no courses
    }

    return (
        <section className={styles.section} id="courses">
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <span className={styles.badge}>
                        <BookIcon size={14} />
                        קורסים
                    </span>
                    <h2 className={styles.title}>למדי מהמומחים</h2>
                    <p className={styles.subtitle}>
                        קורסים מקצועיים ללמידת אמנות הציפורניים
                    </p>
                    <div className={styles.divider} />
                </header>

                {/* Courses List */}
                <div className={styles.list}>
                    {courses.map((course, index) => (
                        <article
                            key={course.id}
                            className={styles.card}
                            style={{ animationDelay: `${index * 0.12}s` }}
                        >
                            {/* Badge */}
                            {course.enrolled >= course.capacity ? (
                                <span className={styles.statusBadge} data-status="full">
                                    מלא
                                </span>
                            ) : course.capacity - course.enrolled <= 2 ? (
                                <span className={styles.statusBadge} data-status="limited">
                                    מקומות אחרונים
                                </span>
                            ) : null}

                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>{course.name}</h3>
                                <p className={styles.cardDescription}>{course.description}</p>
                            </div>

                            {/* Highlights */}
                            <div className={styles.highlights}>
                                <span className={styles.highlight}>
                                    <CertificateIcon size={14} />
                                    תעודה מוכרת
                                </span>
                                <span className={styles.highlight}>
                                    <GiftIcon size={14} />
                                    ערכה מתנה
                                </span>
                            </div>

                            {/* Meta */}
                            <div className={styles.cardMeta}>
                                <div className={styles.metaRow}>
                                    <div className={styles.metaItem}>
                                        <CalendarIcon size={16} />
                                        <span>{formatDate(course.date)}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <ClockIcon size={16} />
                                        <span>{course.duration}</span>
                                    </div>
                                </div>
                                <div className={styles.metaRow}>
                                    <div className={styles.metaItem}>
                                        <UsersIcon size={16} />
                                        <span>{course.enrolled}/{course.capacity} משתתפות</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className={styles.cardFooter}>
                                <div className={styles.priceContainer}>
                                    <span className={styles.priceLabel}>מחיר</span>
                                    <span className={styles.price}>₪{course.price}</span>
                                </div>
                                <a
                                    href="/courses"
                                    className={`btn ${course.enrolled >= course.capacity ? 'btn-secondary' : 'btn-primary'} ${styles.registerBtn}`}
                                >
                                    {course.enrolled >= course.capacity ? "לרשימת המתנה" : "הרשמה"}
                                </a>
                            </div>

                            {/* Capacity bar */}
                            <div className={styles.capacityBar}>
                                <div
                                    className={styles.capacityFill}
                                    style={{ width: `${(course.enrolled / course.capacity) * 100}%` }}
                                />
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
