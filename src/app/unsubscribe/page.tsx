"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const phoneParam = searchParams.get("phone") || "";

    const [phone, setPhone] = useState(phoneParam);
    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState<{
        sms_marketing: boolean;
        sms_reviews: boolean;
        sms_return_reminders: boolean;
    } | null>(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function loadPreferences() {
        if (!phone.trim()) {
            setError("נא להזין מספר טלפון");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch(`/api/sms/preferences?phone=${encodeURIComponent(phone)}`);
            const data = await res.json();

            if (res.ok) {
                setPreferences(data);
            } else {
                setError(data.error || "שגיאה בטעינת ההעדפות");
            }
        } catch {
            setError("שגיאה בטעינת ההעדפות");
        }
        setLoading(false);
    }

    async function savePreferences() {
        if (!preferences) return;

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/sms/preferences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, ...preferences }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("ההעדפות נשמרו בהצלחה ✓");
            } else {
                setError(data.error || "שגיאה בשמירת ההעדפות");
            }
        } catch {
            setError("שגיאה בשמירת ההעדפות");
        }
        setLoading(false);
    }

    function togglePreference(key: "sms_marketing" | "sms_reviews" | "sms_return_reminders") {
        if (!preferences) return;
        setPreferences({ ...preferences, [key]: !preferences[key] });
    }

    function unsubscribeAll() {
        setPreferences({
            sms_marketing: false,
            sms_reviews: false,
            sms_return_reminders: false,
        });
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1>הגדרות הודעות SMS 📱</h1>
                <p className={styles.subtitle}>בחרי אילו הודעות לקבל</p>

                {!preferences ? (
                    <div className={styles.phoneSection}>
                        <label>מספר טלפון</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="05X-XXXXXXX"
                            className={styles.input}
                            dir="ltr"
                        />
                        <button
                            className={styles.btn}
                            onClick={loadPreferences}
                            disabled={loading}
                        >
                            {loading ? "טוען..." : "המשך"}
                        </button>
                    </div>
                ) : (
                    <div className={styles.preferences}>
                        <p className={styles.note}>
                            <strong>הודעות תור</strong> (אישור, תזכורת יום לפני, שינוי, ביטול) ישלחו תמיד.
                        </p>

                        <div className={styles.option}>
                            <div className={styles.optionInfo}>
                                <span className={styles.optionTitle}>בקשות לביקורת</span>
                                <span className={styles.optionDesc}>הודעה לאחר הביקור לדרג את השירות</span>
                            </div>
                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={preferences.sms_reviews}
                                    onChange={() => togglePreference("sms_reviews")}
                                />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div>

                        <div className={styles.option}>
                            <div className={styles.optionInfo}>
                                <span className={styles.optionTitle}>תזכורת לחזור</span>
                                <span className={styles.optionDesc}>הודעה לאחר זמן לקביעת תור חדש</span>
                            </div>
                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={preferences.sms_return_reminders}
                                    onChange={() => togglePreference("sms_return_reminders")}
                                />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div>

                        <div className={styles.option}>
                            <div className={styles.optionInfo}>
                                <span className={styles.optionTitle}>הודעות שיווקיות</span>
                                <span className={styles.optionDesc}>מבצעים והנחות מיוחדות</span>
                            </div>
                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={preferences.sms_marketing}
                                    onChange={() => togglePreference("sms_marketing")}
                                />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div>

                        <button
                            className={styles.btn}
                            onClick={savePreferences}
                            disabled={loading}
                        >
                            {loading ? "שומר..." : "שמירת העדפות"}
                        </button>

                        <button
                            className={styles.unsubscribeAllBtn}
                            onClick={unsubscribeAll}
                        >
                            ביטול כל ההודעות (חוץ מתורים)
                        </button>
                    </div>
                )}

                {error && <p className={styles.error}>{error}</p>}
                {message && <p className={styles.success}>{message}</p>}
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <Suspense fallback={
            <div className={styles.page}>
                <div className={styles.card}>
                    <p>טוען...</p>
                </div>
            </div>
        }>
            <UnsubscribeContent />
        </Suspense>
    );
}
