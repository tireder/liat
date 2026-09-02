"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { ArrowLeftIcon, CalendarIcon, ClockIcon, UsersIcon, CheckIcon, CertificateIcon, GiftIcon, MapPinIcon, MessageIcon } from "@/components/icons";
import type { CourseItem, CourseStatus } from "@/lib/landing";
import { getCourseStatus, COURSE_STATUS_LABEL, formatCourseDate, formatPrice, toWhatsAppNumber } from "@/lib/landing";
import styles from "./page.module.css";

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

const iconMap = {
    certificate: CertificateIcon,
    gift: GiftIcon,
    check: CheckIcon,
};

interface Course extends CourseItem {
    active?: boolean;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [whatsapp, setWhatsapp] = useState("");
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [showRegistration, setShowRegistration] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "" });
    const [agreed, setAgreed] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const [coursesRes, settingsRes] = await Promise.all([fetch("/api/courses"), fetch("/api/settings")]);
                if (!coursesRes.ok) throw new Error("courses");
                const data = await coursesRes.json();
                setCourses(Array.isArray(data) ? data : []);
                if (settingsRes.ok) {
                    const s = await settingsRes.json();
                    setWhatsapp(toWhatsAppNumber(s.whatsapp || s.phone));
                }
            } catch (err) {
                console.error("Error fetching courses:", err);
                setLoadError(true);
            }
            setLoading(false);
        }
        load();
    }, []);

    // Deep link from the landing page: /courses#course-<id>
    useEffect(() => {
        if (loading || typeof window === "undefined") return;
        const hash = window.location.hash;
        if (hash.startsWith("#course-")) {
            const el = document.getElementById(hash.slice(1));
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [loading]);

    const handleRegister = (course: Course) => {
        setSelectedCourse(course);
        setShowRegistration(true);
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleConfirmRegistration = async () => {
        if (!selectedCourse) return;
        if (!formData.name.trim() || !formData.phone.trim()) {
            setError("נא למלא שם וטלפון");
            return;
        }
        if (!agreed) {
            setError("יש לאשר את תנאי ההרשמה");
            return;
        }

        setRegistering(true);
        setError("");
        try {
            const res = await fetch(`/api/courses/${selectedCourse.id}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: formData.name, phone: formData.phone }),
            });

            if (res.ok) {
                setRegistrationComplete(true);
                setCourses(prev => prev.map(c => c.id === selectedCourse.id ? { ...c, enrolled: c.enrolled + 1 } : c));
            } else {
                const data = await res.json().catch(() => null);
                setError(data?.error || "שגיאה בהרשמה");
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

    // Registration success
    if (registrationComplete && selectedCourse) {
        return (
            <div className={styles.page}>
                <PageHeader title="הרשמה לקורס" />
                <main id="main" className={`container ${styles.narrow}`}>
                    <div className={styles.success}>
                        <span className={styles.successIcon}><CheckIcon size={36} /></span>
                        <h2 className={`display ${styles.successTitle}`}>נרשמת בהצלחה</h2>
                        <p className={styles.successText}>ניצור איתך קשר לאישור סופי ולפרטי התשלום.</p>
                        <dl className={styles.summary}>
                            <div className={styles.summaryRow}><dt>קורס</dt><dd>{selectedCourse.name}</dd></div>
                            <div className={styles.summaryRow}><dt>תאריך</dt><dd>{formatCourseDate(selectedCourse.date)}</dd></div>
                            <div className={styles.summaryRow}><dt>מחיר</dt><dd className="tabular">{formatPrice(selectedCourse.price)}</dd></div>
                        </dl>
                        <div className={styles.successActions}>
                            <button type="button" className="btn btn-secondary" onClick={handleBack}>לכל הקורסים</button>
                            <Link href="/" className="btn btn-primary">חזרה לדף הבית</Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Registration form
    if (showRegistration && selectedCourse) {
        const remaining = Math.max(0, selectedCourse.capacity - selectedCourse.enrolled);
        return (
            <div className={styles.page}>
                <PageHeader title="הרשמה לקורס" backHref="/courses" backLabel="חזרה לקורסים" />
                <main id="main" className={`container ${styles.narrow}`}>
                    <form
                        className={styles.form}
                        onSubmit={(e) => { e.preventDefault(); handleConfirmRegistration(); }}
                    >
                        <div className={styles.formHead}>
                            <span className="eyebrow">הרשמה</span>
                            <h2 className={`display ${styles.formTitle}`}>{selectedCourse.name}</h2>
                            <p className={styles.formSubtitle}>
                                {formatCourseDate(selectedCourse.date)} · {selectedCourse.duration}
                            </p>
                        </div>

                        <div className={styles.fields}>
                            <div className="field">
                                <label htmlFor="reg-name" className="field-label">שם מלא</label>
                                <input
                                    id="reg-name"
                                    type="text"
                                    autoComplete="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="השם שלך"
                                    className="input"
                                    required
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="reg-phone" className="field-label">טלפון נייד</label>
                                <input
                                    id="reg-phone"
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="050-0000000"
                                    className={`input ${styles.ltr}`}
                                    dir="ltr"
                                    required
                                />
                            </div>
                        </div>

                        {error && <p className="field-error" role="alert">{error}</p>}

                        <dl className={styles.summary}>
                            <div className={styles.summaryRow}>
                                <dt><CalendarIcon size={16} /> תאריך</dt>
                                <dd>{formatCourseDate(selectedCourse.date)}</dd>
                            </div>
                            <div className={styles.summaryRow}>
                                <dt><ClockIcon size={16} /> משך</dt>
                                <dd>{selectedCourse.duration}</dd>
                            </div>
                            {selectedCourse.location && (
                                <div className={styles.summaryRow}>
                                    <dt><MapPinIcon size={16} /> מיקום</dt>
                                    <dd>{selectedCourse.location}</dd>
                                </div>
                            )}
                            {selectedCourse.capacity > 0 && (
                                <div className={styles.summaryRow}>
                                    <dt><UsersIcon size={16} /> מקומות</dt>
                                    <dd className="tabular">נותרו {remaining} מתוך {selectedCourse.capacity}</dd>
                                </div>
                            )}
                            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                                <dt>עלות הקורס</dt>
                                <dd className={`display tabular ${styles.summaryPrice}`}>{formatPrice(selectedCourse.price)}</dd>
                            </div>
                        </dl>

                        <div className={styles.policy}>
                            <h4>מדיניות ביטולים</h4>
                            <p>ביטול עד 48 שעות לפני הקורס - החזר מלא.<br />ביטול בתוך 48 שעות - ללא החזר.</p>
                        </div>

                        <label className={styles.checkbox}>
                            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className={styles.checkboxInput} />
                            <span className={styles.checkmark} aria-hidden="true"><CheckIcon size={13} /></span>
                            <span>קראתי ומסכימה לתנאי ההרשמה</span>
                        </label>

                        <div className={styles.formActions}>
                            <button type="button" className="btn btn-secondary" onClick={handleBack} disabled={registering}>
                                חזרה
                            </button>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={registering} aria-busy={registering}>
                                {registering ? "שולחת..." : "אישור הרשמה"}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        );
    }

    // Course list
    const withStatus = courses.map((course) => ({ course, status: getCourseStatus(course) as CourseStatus }));
    const upcoming = withStatus.filter((c) => c.status !== "past").sort((a, b) => a.course.date.localeCompare(b.course.date));
    const past = withStatus.filter((c) => c.status === "past").sort((a, b) => b.course.date.localeCompare(a.course.date));

    return (
        <div className={styles.page}>
            <PageHeader title="קורסים" />

            <main id="main" className={`container ${styles.content}`}>
                <div className={styles.intro}>
                    <span className="eyebrow">האקדמיה</span>
                    <h2 className={`display ${styles.introTitle}`}>ללמוד את המקצוע מקרוב</h2>
                    <p className={styles.introText}>
                        הכשרה מקצועית בקבוצות קטנות עם ליווי אישי. כל הפרטים, המועדים והמחירים מתעדכנים כאן.
                    </p>
                </div>

                {loading ? (
                    <div className={styles.list} aria-busy="true">
                        {[0, 1].map((i) => <div key={i} className={styles.skeleton} />)}
                    </div>
                ) : loadError ? (
                    <div className={styles.empty} role="alert">
                        <p>לא הצלחנו לטעון את הקורסים. נסי לרענן את העמוד.</p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className={styles.empty}>
                        <p className={`display ${styles.emptyTitle}`}>אין קורסים פתוחים כרגע</p>
                        <p>המועד הבא יפורסם כאן. רוצה שאעדכן אותך? שלחי הודעה.</p>
                        {whatsapp && (
                            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                <MessageIcon size={16} />
                                עדכנו אותי על המועד הבא
                            </a>
                        )}
                    </div>
                ) : (
                    <>
                        {upcoming.length === 0 && (
                            <div className={styles.empty}>
                                <p className={`display ${styles.emptyTitle}`}>כרגע אין מועד פתוח להרשמה</p>
                                <p>המחזור הקודם הסתיים. פרטי המחזור הבא יפורסמו כאן.</p>
                                {whatsapp && (
                                    <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                        <MessageIcon size={16} />
                                        עדכנו אותי על המועד הבא
                                    </a>
                                )}
                            </div>
                        )}

                        {upcoming.length > 0 && (
                            <div className={styles.list}>
                                {upcoming.map(({ course, status }) => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        status={status}
                                        onRegister={() => handleRegister(course)}
                                    />
                                ))}
                            </div>
                        )}

                        {past.length > 0 && (
                            <details className={styles.pastGroup}>
                                <summary className={styles.pastSummary}>
                                    מחזורים קודמים ({past.length})
                                </summary>
                                <div className={styles.list}>
                                    {past.map(({ course, status }) => (
                                        <CourseCard key={course.id} course={course} status={status} />
                                    ))}
                                </div>
                            </details>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

function CourseCard({ course, status, onRegister }: { course: Course; status: CourseStatus; onRegister?: () => void }) {
    const extras = courseExtras[course.name];
    const isFull = status === "full";
    const isPast = status === "past";
    const remaining = Math.max(0, (Number(course.capacity) || 0) - (Number(course.enrolled) || 0));

    return (
        <article id={`course-${course.id}`} className={`${styles.card} ${isPast ? styles.cardPast : ""}`}>
            <div className={styles.cardHead}>
                <span className={`${styles.status} ${styles[status]}`}>{COURSE_STATUS_LABEL[status]}</span>
                <h3 className={`display ${styles.cardTitle}`}>{course.name}</h3>
                <p className={styles.cardDesc}>{course.description || extras?.longDescription}</p>
            </div>

            {extras && extras.highlights.length > 0 && (
                <ul className={styles.highlights}>
                    {extras.highlights.map((h, i) => {
                        const Icon = iconMap[h.icon];
                        return (
                            <li key={i} className={styles.highlight}>
                                <Icon size={14} />
                                {h.text}
                            </li>
                        );
                    })}
                </ul>
            )}

            <ul className={styles.meta}>
                <li><CalendarIcon size={15} /><span>{formatCourseDate(course.date)}</span></li>
                {course.duration && <li><ClockIcon size={15} /><span>{course.duration}</span></li>}
                {course.location && <li><MapPinIcon size={15} /><span>{course.location}</span></li>}
                {course.capacity > 0 && !isPast && (
                    <li>
                        <UsersIcon size={15} />
                        <span className="tabular">{isFull ? "כל המקומות נתפסו" : `נותרו ${remaining} מקומות מתוך ${course.capacity}`}</span>
                    </li>
                )}
            </ul>
            {course.schedule_info && <p className={styles.schedule}>{course.schedule_info}</p>}

            {extras && extras.syllabus.length > 0 && (
                <details className={styles.syllabus}>
                    <summary>תכנית הקורס</summary>
                    <ol>
                        {extras.syllabus.map((item, i) => <li key={i}>{item}</li>)}
                    </ol>
                </details>
            )}

            <div className={styles.cardFooter}>
                <div className={styles.priceBox}>
                    <span className={styles.priceLabel}>עלות הקורס</span>
                    <span className={`display tabular ${styles.price}`}>{formatPrice(course.price)}</span>
                </div>
                {isPast ? (
                    <span className={styles.pastNote}>המחזור הסתיים</span>
                ) : isFull ? (
                    <span className={styles.pastNote}>אין מקומות פנויים</span>
                ) : (
                    <button type="button" className="btn btn-primary" onClick={onRegister}>
                        הרשמה לקורס
                        <ArrowLeftIcon size={16} />
                    </button>
                )}
            </div>
        </article>
    );
}
