"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, BookIcon, CalendarIcon, ClockIcon, UsersIcon, CheckIcon, CertificateIcon, GiftIcon, PhoneIcon, UserIcon } from "@/components/icons";
import styles from "./page.module.css";

interface Course {
    id: string;
    name: string;
    description: string | null;
    date: string;
    duration: string;
    price: number;
    capacity: number;
    enrolled: number;
    active: boolean;
}

// Course detail enhancements (static for now, could be moved to DB later)
const courseExtras: Record<string, {
    longDescription: string;
    highlights: { text: string; icon: "certificate" | "gift" | "check" }[];
    syllabus: string[];
}> = {
    "קורס מניקוריסטיות למתחילות": {
        longDescription: "קורס מקיף ומעשי שמכשיר אותך לעבודה כמניקוריסטית מקצועית. תלמדי את כל הטכניקות הבסיסיות והמתקדמות, עבודה עם חומרים שונים, ואיך לבנות בסיס לקוחות.",
        highlights: [
            { text: "תעודה מוכרת", icon: "certificate" },
            { text: "ערכה מתנה", icon: "gift" },
            { text: "ליווי אישי", icon: "check" },
        ],
        syllabus: [
            "היכרות עם כלי עבודה וחומרים",
            "היגיינה ובטיחות בעבודה",
            "טכניקות מניקור בסיסיות",
            "עבודה עם לכות ג׳ל",
            "עיצוב ודחיפת עור",
            "תרגול מעשי על מודלים",
            "טיפים לבניית עסק",
        ],
    },
    "סדנת נייל ארט מתקדם": {
        longDescription: "סדנה אינטנסיבית לשכלול מיומנויות הציור והעיצוב על ציפורניים. נלמד טכניקות מתקדמות, שימוש בחומרים מיוחדים, ויצירת עיצובים ייחודיים.",
        highlights: [
            { text: "טכניקות ייחודיות", icon: "check" },
            { text: "חומרים איכותיים", icon: "check" },
        ],
        syllabus: [
            "ציור פרחים ועלים",
            "עיצובים גיאומטריים",
            "עבודה עם פויל וגליטר",
            "טכניקת מרבלינג",
            "שימוש באבנים ותוספות",
        ],
    },
    "קורס בניית ציפורניים": {
        longDescription: "קורס מקצועי ומעמיק לבניית ציפורניים. תלמדי לעבוד עם אקריל וג׳ל בילדר, טכניקות עיצוב שונות, ואיך ליצור ציפורניים מושלמות.",
        highlights: [
            { text: "תעודה מוכרת", icon: "certificate" },
            { text: "ערכת בנייה מתנה", icon: "gift" },
            { text: "תמיכה לאחר הקורס", icon: "check" },
        ],
        syllabus: [
            "הכרת חומרי הבנייה",
            "הכנת הציפורן הטבעית",
            "בניית ציפורן באקריל",
            "בניית ציפורן בג׳ל בילדר",
            "עיצוב ופיילינג",
            "תיקונים ומילויים",
            "פתרון בעיות נפוצות",
        ],
    },
};

const defaultExtras = {
    longDescription: "",
    highlights: [{ text: "קורס מקצועי", icon: "check" as const }],
    syllabus: ["פרטים נוספים בקרוב"],
};

const iconMap = {
    certificate: CertificateIcon,
    gift: GiftIcon,
    check: CheckIcon,
};

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("he-IL", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [showRegistration, setShowRegistration] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "" });
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchCourses() {
            try {
                const res = await fetch("/api/courses");
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data);
                }
            } catch (err) {
                console.error("Error fetching courses:", err);
            }
            setLoading(false);
        }
        fetchCourses();
    }, []);

    const handleRegister = (course: Course) => {
        setSelectedCourse(course);
        setShowRegistration(true);
        setError("");
    };

    const handleConfirmRegistration = async () => {
        if (!selectedCourse) return;
        if (!formData.name.trim() || !formData.phone.trim()) {
            setError("נא למלא שם וטלפון");
            return;
        }

        setRegistering(true);
        setError("");

        try {
            const res = await fetch(`/api/courses/${selectedCourse.id}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                }),
            });

            if (res.ok) {
                setRegistrationComplete(true);
                // Update local course data
                setCourses(prev => prev.map(c =>
                    c.id === selectedCourse.id
                        ? { ...c, enrolled: c.enrolled + 1 }
                        : c
                ));
            } else {
                const data = await res.json();
                setError(data.error || "שגיאה בהרשמה");
            }
        } catch (err) {
            console.error("Registration error:", err);
            setError("שגיאה בהרשמה, נסי שוב");
        }
        setRegistering(false);
    };

    const handleBack = () => {
        if (registrationComplete) {
            setRegistrationComplete(false);
            setShowRegistration(false);
            setSelectedCourse(null);
            setFormData({ name: "", phone: "" });
        } else if (showRegistration) {
            setShowRegistration(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className={styles.page}>
                <header className={styles.header}>
                    <Link href="/" className={styles.backBtn}>
                        <ArrowLeftIcon size={20} />
                    </Link>
                    <h1 className={styles.headerTitle}>קורסים</h1>
                    <div style={{ width: 44 }} />
                </header>
                <div className={styles.content}>
                    <div className={styles.loading}>טוען קורסים...</div>
                </div>
            </div>
        );
    }

    // Registration Success View
    if (registrationComplete && selectedCourse) {
        return (
            <div className={styles.page}>
                <header className={styles.header}>
                    <div style={{ width: 44 }} />
                    <h1 className={styles.headerTitle}>הרשמה לקורס</h1>
                    <Link href="/" className={styles.closeBtn}>
                        <ArrowLeftIcon size={20} />
                    </Link>
                </header>
                <div className={styles.successContainer}>
                    <div className={styles.successIcon}>
                        <CheckIcon size={40} />
                    </div>
                    <h2 className={styles.successTitle}>נרשמת בהצלחה!</h2>
                    <p className={styles.successText}>
                        ניצור איתך קשר לאישור סופי ופרטי תשלום
                    </p>
                    <div className={styles.successCard}>
                        <div className={styles.successRow}>
                            <span>קורס</span>
                            <span>{selectedCourse.name}</span>
                        </div>
                        <div className={styles.successRow}>
                            <span>תאריך</span>
                            <span>{formatDate(selectedCourse.date)}</span>
                        </div>
                        <div className={styles.successRow}>
                            <span>מחיר</span>
                            <span>₪{selectedCourse.price}</span>
                        </div>
                    </div>
                    <Link href="/" className="btn btn-primary" style={{ width: "100%", maxWidth: 320 }}>
                        חזרה לדף הבית
                    </Link>
                </div>
            </div>
        );
    }

    // Registration Form View
    if (showRegistration && selectedCourse) {
        const extras = courseExtras[selectedCourse.name] || defaultExtras;
        return (
            <div className={styles.page}>
                <header className={styles.header}>
                    <button className={styles.backBtn} onClick={handleBack}>
                        <ArrowLeftIcon size={20} />
                    </button>
                    <h1 className={styles.headerTitle}>הרשמה לקורס</h1>
                    <div style={{ width: 44 }} />
                </header>
                <main className={styles.content}>
                    <div className={styles.regHeader}>
                        <h2 className={styles.regTitle}>{selectedCourse.name}</h2>
                        <p className={styles.regSubtitle}>{formatDate(selectedCourse.date)} • {selectedCourse.duration}</p>
                    </div>

                    <div className={styles.regForm}>
                        <div className={styles.formField}>
                            <label>
                                <UserIcon size={16} />
                                שם מלא
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="הכניסי את שמך"
                                className={styles.textInput}
                            />
                        </div>
                        <div className={styles.formField}>
                            <label>
                                <PhoneIcon size={16} />
                                טלפון
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="050-000-0000"
                                className={styles.textInput}
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.regCard}>
                        <div className={styles.regRow}>
                            <CalendarIcon size={18} />
                            <span>תאריך</span>
                            <span className={styles.regValue}>{formatDate(selectedCourse.date)}</span>
                        </div>
                        <div className={styles.regRow}>
                            <ClockIcon size={18} />
                            <span>משך</span>
                            <span className={styles.regValue}>{selectedCourse.duration}</span>
                        </div>
                        <div className={styles.regRow}>
                            <UsersIcon size={18} />
                            <span>משתתפות</span>
                            <span className={styles.regValue}>{selectedCourse.enrolled + 1}/{selectedCourse.capacity}</span>
                        </div>
                        <div className={styles.regDivider} />
                        <div className={styles.regPriceRow}>
                            <span>מחיר</span>
                            <span className={styles.regPrice}>₪{selectedCourse.price}</span>
                        </div>
                    </div>

                    <div className={styles.regPolicy}>
                        <h4>מדיניות ביטולים</h4>
                        <p>ביטול עד 48 שעות לפני הקורס - החזר מלא.<br />ביטול בתוך 48 שעות - ללא החזר.</p>
                    </div>

                    <label className={styles.regCheckbox}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.regCheckmark}><CheckIcon size={14} /></span>
                        <span>קראתי ומסכימה לתנאי ההרשמה</span>
                    </label>

                    <button
                        className="btn btn-primary"
                        onClick={handleConfirmRegistration}
                        disabled={registering}
                        style={{ width: "100%" }}
                    >
                        {registering ? "שולח..." : "אישור הרשמה"}
                    </button>
                </main>
            </div>
        );
    }

    // Course List View
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/" className={styles.backBtn}>
                    <ArrowLeftIcon size={20} />
                </Link>
                <h1 className={styles.headerTitle}>קורסים</h1>
                <div style={{ width: 44 }} />
            </header>

            <main className={styles.content}>
                <div className={styles.intro}>
                    <BookIcon size={32} color="var(--color-primary)" />
                    <h2 className={styles.introTitle}>הקורסים שלי</h2>
                    <p className={styles.introText}>קורסים מקצועיים ללמידת אמנות הציפורניים</p>
                </div>

                {courses.length === 0 ? (
                    <p className={styles.emptyState}>אין קורסים זמינים כרגע</p>
                ) : (
                    <div className={styles.courseList}>
                        {courses.map((course) => {
                            const extras = courseExtras[course.name] || defaultExtras;
                            const isFull = course.enrolled >= course.capacity;
                            const isLimited = !isFull && course.capacity - course.enrolled <= 2;

                            return (
                                <article key={course.id} className={styles.courseCard}>
                                    {isFull && <span className={styles.badge} data-status="full">מלא</span>}
                                    {isLimited && <span className={styles.badge} data-status="limited">מקומות אחרונים</span>}

                                    <h3 className={styles.courseName}>{course.name}</h3>
                                    <p className={styles.courseDesc}>{course.description || extras.longDescription}</p>

                                    <div className={styles.highlights}>
                                        {extras.highlights.map((h, i) => {
                                            const Icon = iconMap[h.icon];
                                            return (
                                                <span key={i} className={styles.highlight}>
                                                    <Icon size={14} />
                                                    {h.text}
                                                </span>
                                            );
                                        })}
                                    </div>

                                    <div className={styles.courseMeta}>
                                        <div className={styles.metaItem}>
                                            <CalendarIcon size={16} />
                                            <span>{formatDate(course.date)}</span>
                                        </div>
                                        <div className={styles.metaItem}>
                                            <ClockIcon size={16} />
                                            <span>{course.duration}</span>
                                        </div>
                                        <div className={styles.metaItem}>
                                            <UsersIcon size={16} />
                                            <span>{course.enrolled}/{course.capacity}</span>
                                        </div>
                                    </div>

                                    <details className={styles.syllabus}>
                                        <summary>תכנית הקורס</summary>
                                        <ul>
                                            {extras.syllabus.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </details>

                                    <div className={styles.courseFooter}>
                                        <div className={styles.priceBox}>
                                            <span className={styles.priceLabel}>מחיר</span>
                                            <span className={styles.price}>₪{course.price}</span>
                                        </div>
                                        <button
                                            className={`btn ${isFull ? "btn-secondary" : "btn-primary"}`}
                                            onClick={() => !isFull && handleRegister(course)}
                                            disabled={isFull}
                                        >
                                            {isFull ? "רשימת המתנה" : "הרשמה"}
                                        </button>
                                    </div>

                                    <div className={styles.capacityBar}>
                                        <div
                                            className={styles.capacityFill}
                                            style={{ width: `${(course.enrolled / course.capacity) * 100}%` }}
                                        />
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
