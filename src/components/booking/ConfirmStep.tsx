"use client";

import { useState } from "react";
import { BookingData } from "@/app/book/page";
import { CalendarIcon, ClockIcon, MapPinIcon, NailPolishIcon, UserIcon, CheckIcon } from "@/components/icons";
import { formatPrice } from "@/lib/landing";
import styles from "./ConfirmStep.module.css";

interface ConfirmStepProps {
    bookingData: BookingData;
    onConfirm: () => void;
    onBack: () => void;
    address?: string;
    isReschedule?: boolean;
    submitting?: boolean;
}

const HEBREW_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const HEBREW_MONTHS = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

export default function ConfirmStep({
    bookingData,
    onConfirm,
    onBack,
    address,
    isReschedule = false,
    submitting = false,
}: ConfirmStepProps) {
    const [agreed, setAgreed] = useState(true);

    const formatDate = () => {
        if (!bookingData.date) return "";
        const [y, m, d] = bookingData.date.split("-").map(Number);
        const date = new Date(y, m - 1, d);
        return `יום ${HEBREW_DAYS[date.getDay()]}, ${d} ב${HEBREW_MONTHS[m - 1]} ${y}`;
    };

    const formatTime = () => {
        if (!bookingData.time) return "";
        const [hours, minutes] = bookingData.time.split(":");
        const startHour = parseInt(hours);
        const startMin = parseInt(minutes);
        const endMin = startMin + bookingData.serviceDuration;
        const endHour = startHour + Math.floor(endMin / 60);
        const endMinutes = endMin % 60;
        return `${bookingData.time} – ${endHour.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={`display ${styles.title}`}>{isReschedule ? "אישור שינוי התור" : "רגע לפני שקובעים"}</h2>
                <p className={styles.subtitle}>בדקי שהפרטים נכונים ואשרי</p>
            </div>

            <div className={styles.card}>
                <div className={styles.row}>
                    <span className={styles.rowIcon}><NailPolishIcon size={18} /></span>
                    <span className={styles.rowContent}>
                        <span className={styles.rowLabel}>טיפול</span>
                        <span className={`display ${styles.rowValueLarge}`}>{bookingData.serviceName}</span>
                    </span>
                    <span className={`display tabular ${styles.price}`}>{formatPrice(bookingData.servicePrice)}</span>
                </div>

                {bookingData.artistName && (
                    <div className={styles.row}>
                        <span className={styles.rowIcon}><UserIcon size={18} /></span>
                        <span className={styles.rowContent}>
                            <span className={styles.rowLabel}>אמנית</span>
                            <span className={styles.rowValue}>{bookingData.artistName}</span>
                        </span>
                    </div>
                )}

                <div className={styles.divider} />

                <div className={styles.row}>
                    <span className={styles.rowIcon}><CalendarIcon size={18} /></span>
                    <span className={styles.rowContent}>
                        <span className={styles.rowLabel}>תאריך</span>
                        <span className={styles.rowValue}>{formatDate()}</span>
                    </span>
                </div>

                <div className={styles.row}>
                    <span className={styles.rowIcon}><ClockIcon size={18} /></span>
                    <span className={styles.rowContent}>
                        <span className={styles.rowLabel}>שעה</span>
                        <span className={`tabular ${styles.rowValue}`} dir="ltr">{formatTime()}</span>
                    </span>
                </div>

                {address && (
                    <div className={styles.row}>
                        <span className={styles.rowIcon}><MapPinIcon size={18} /></span>
                        <span className={styles.rowContent}>
                            <span className={styles.rowLabel}>מיקום</span>
                            <span className={styles.rowValue}>{address}</span>
                        </span>
                    </div>
                )}

                {bookingData.notes && (
                    <>
                        <div className={styles.divider} />
                        <div className={styles.notes}>
                            <span className={styles.rowLabel}>הערות</span>
                            <p className={styles.notesText}>{bookingData.notes}</p>
                        </div>
                    </>
                )}
            </div>

            <div className={styles.policy}>
                <h4 className={styles.policyTitle}>מדיניות ביטולים</h4>
                <p className={styles.policyText}>
                    ביטול או שינוי מועד עד 24 שעות לפני התור - ללא עלות.
                    <br />
                    ביטול בתוך 24 שעות - דורש אישור.
                </p>
            </div>

            <label className={styles.checkbox}>
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className={styles.checkboxInput}
                />
                <span className={styles.checkmark} aria-hidden="true">
                    <CheckIcon size={13} />
                </span>
                <span>קראתי ומסכימה למדיניות הביטולים</span>
            </label>

            <div className={styles.footer}>
                <button type="button" className="btn btn-secondary" onClick={onBack} disabled={submitting}>
                    חזרה
                </button>
                <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={onConfirm}
                    disabled={!agreed || submitting}
                    aria-busy={submitting}
                >
                    {submitting ? "שולחת..." : isReschedule ? "אישור השינוי" : "אישור וקביעת התור"}
                </button>
            </div>
        </div>
    );
}
