"use client";

import Link from "next/link";
import { BookingData } from "@/app/book/page";
import { CheckIcon, CalendarIcon, HomeIcon } from "@/components/icons";
import styles from "./SuccessStep.module.css";

interface SuccessStepProps {
    bookingData: BookingData;
}

const HEBREW_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const HEBREW_MONTHS = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

export default function SuccessStep({ bookingData }: SuccessStepProps) {
    const formatDate = () => {
        if (!bookingData.date) return "";
        const d = new Date(bookingData.date);
        return `יום ${HEBREW_DAYS[d.getDay()]}, ${d.getDate()} ${HEBREW_MONTHS[d.getMonth()]}`;
    };

    // Generate ICS file content
    const generateICS = () => {
        if (!bookingData.date || !bookingData.time) return "";

        const [hours, minutes] = bookingData.time.split(":").map(Number);
        const startDate = new Date(bookingData.date);
        startDate.setHours(hours, minutes, 0, 0);

        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + bookingData.serviceDuration);

        const formatICSDate = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        };

        const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${bookingData.serviceName} - ליאת
LOCATION:רחוב הרצל 50, תל אביב
DESCRIPTION:תור לטיפול ציפורניים
END:VEVENT
END:VCALENDAR`;

        return ics;
    };

    const handleAddToCalendar = () => {
        const ics = generateICS();
        const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "appointment.ics";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.container}>
            {/* Success Icon */}
            <div className={styles.iconWrapper}>
                <div className={styles.icon}>
                    <CheckIcon size={40} />
                </div>
            </div>

            {/* Message */}
            <div className={styles.message}>
                <h1 className={styles.title}>התור נקבע בהצלחה!</h1>
                <p className={styles.subtitle}>
                    נשלחה אליך הודעת אישור
                </p>
            </div>

            {/* Summary */}
            <div className={styles.summary}>
                <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>שירות</span>
                    <span className={styles.summaryValue}>{bookingData.serviceName}</span>
                </div>
                <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>תאריך</span>
                    <span className={styles.summaryValue}>{formatDate()}</span>
                </div>
                <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>שעה</span>
                    <span className={styles.summaryValue}>{bookingData.time}</span>
                </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <button className="btn btn-secondary" onClick={handleAddToCalendar}>
                    <CalendarIcon size={18} />
                    הוספה ליומן
                </button>
                <Link href="/" className="btn btn-primary">
                    <HomeIcon size={18} />
                    חזרה לדף הבית
                </Link>
            </div>
        </div>
    );
}
