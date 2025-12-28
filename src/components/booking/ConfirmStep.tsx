"use client";

import { BookingData } from "@/app/book/page";
import { CalendarIcon, ClockIcon, MapPinIcon, NailPolishIcon, CheckIcon } from "@/components/icons";
import styles from "./ConfirmStep.module.css";

interface ConfirmStepProps {
    bookingData: BookingData;
    onConfirm: () => void;
    onBack: () => void;
    address?: string;
    isReschedule?: boolean;
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
}: ConfirmStepProps) {
    const formatDate = () => {
        if (!bookingData.date) return "";
        const d = new Date(bookingData.date);
        return `יום ${HEBREW_DAYS[d.getDay()]}, ${d.getDate()} ${HEBREW_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    };

    const formatTime = () => {
        if (!bookingData.time) return "";
        const [hours, minutes] = bookingData.time.split(":");
        const startHour = parseInt(hours);
        const startMin = parseInt(minutes);
        const endMin = startMin + bookingData.serviceDuration;
        const endHour = startHour + Math.floor(endMin / 60);
        const endMinutes = endMin % 60;
        return `${bookingData.time} - ${endHour.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>{isReschedule ? "אישור שינוי תור" : "אישור התור"}</h2>
                <p className={styles.subtitle}>בדקי שהפרטים נכונים</p>
            </div>

            {/* Summary Card */}
            <div className={styles.card}>
                <div className={styles.cardRow}>
                    <div className={styles.cardIcon}>
                        <NailPolishIcon size={20} color="var(--color-primary-dark)" />
                    </div>
                    <div className={styles.cardContent}>
                        <span className={styles.cardLabel}>שירות</span>
                        <span className={styles.cardValue}>{bookingData.serviceName}</span>
                    </div>
                    <span className={styles.cardPrice}>₪{bookingData.servicePrice}</span>
                </div>

                <div className={styles.divider} />

                <div className={styles.cardRow}>
                    <div className={styles.cardIcon}>
                        <CalendarIcon size={20} color="var(--color-primary-dark)" />
                    </div>
                    <div className={styles.cardContent}>
                        <span className={styles.cardLabel}>תאריך</span>
                        <span className={styles.cardValue}>{formatDate()}</span>
                    </div>
                </div>

                <div className={styles.cardRow}>
                    <div className={styles.cardIcon}>
                        <ClockIcon size={20} color="var(--color-primary-dark)" />
                    </div>
                    <div className={styles.cardContent}>
                        <span className={styles.cardLabel}>שעה</span>
                        <span className={styles.cardValue}>{formatTime()}</span>
                    </div>
                </div>

                {address && (
                    <div className={styles.cardRow}>
                        <div className={styles.cardIcon}>
                            <MapPinIcon size={20} color="var(--color-primary-dark)" />
                        </div>
                        <div className={styles.cardContent}>
                            <span className={styles.cardLabel}>מיקום</span>
                            <span className={styles.cardValue}>{address}</span>
                        </div>
                    </div>
                )}

                {bookingData.notes && (
                    <>
                        <div className={styles.divider} />
                        <div className={styles.notes}>
                            <span className={styles.cardLabel}>הערות</span>
                            <p className={styles.notesText}>{bookingData.notes}</p>
                        </div>
                    </>
                )}
            </div>

            {/* Policy */}
            <div className={styles.policy}>
                <h4 className={styles.policyTitle}>מדיניות ביטולים</h4>
                <p className={styles.policyText}>
                    ביטול או שינוי מועד עד 24 שעות לפני התור - ללא עלות.
                    <br />
                    ביטול בתוך 24 שעות - דורש אישור.
                </p>
            </div>

            {/* Checkbox */}
            <label className={styles.checkbox}>
                <input type="checkbox" defaultChecked />
                <span className={styles.checkmark}>
                    <CheckIcon size={14} />
                </span>
                <span>קראתי ומסכימה למדיניות הביטולים</span>
            </label>

            <div className={styles.footer}>
                <button className="btn btn-secondary" onClick={onBack}>
                    חזרה
                </button>
                <button className="btn btn-primary" onClick={onConfirm}>
                    {isReschedule ? "אישור שינוי" : "אישור וקביעת תור"}
                </button>
            </div>
        </div>
    );
}
