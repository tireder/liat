"use client";

import { useState, useMemo } from "react";
import { BookingData } from "@/app/book/page";
import { ChevronDownIcon } from "@/components/icons";
import styles from "./DateTimeStep.module.css";

interface DateTimeStepProps {
    bookingData: BookingData;
    updateBookingData: (data: Partial<BookingData>) => void;
    onNext: () => void;
    onBack: () => void;
}

const HEBREW_DAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const HEBREW_MONTHS = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

// Generate time slots based on operating hours
const generateTimeSlots = (date: string, duration: number): string[] => {
    const slots: string[] = [];
    const dayOfWeek = new Date(date).getDay();

    // Operating hours (simplified)
    let startHour = 9;
    let endHour = dayOfWeek === 5 ? 14 : 20; // Friday ends at 14:00

    if (dayOfWeek === 6) return []; // Saturday closed

    for (let hour = startHour; hour < endHour; hour++) {
        for (let min = 0; min < 60; min += 30) {
            const endMin = min + duration;
            const endHourCalc = hour + Math.floor(endMin / 60);
            if (endHourCalc < endHour || (endHourCalc === endHour && endMin % 60 === 0)) {
                slots.push(`${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
            }
        }
    }

    // Simulate some taken slots
    const takenSlots = ["10:00", "11:30", "14:00", "16:30"];
    return slots.filter(s => !takenSlots.includes(s));
};

export default function DateTimeStep({
    bookingData,
    updateBookingData,
    onNext,
    onBack,
}: DateTimeStepProps) {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay(); // Sunday = 0

        const days: { date: Date | null; isToday: boolean; isPast: boolean; isDisabled: boolean }[] = [];

        // Padding for start
        for (let i = 0; i < startPadding; i++) {
            days.push({ date: null, isToday: false, isPast: false, isDisabled: true });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Actual days
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            const isPast = date < today;
            const isSaturday = date.getDay() === 6;
            days.push({
                date,
                isToday: date.getTime() === today.getTime(),
                isPast,
                isDisabled: isPast || isSaturday,
            });
        }

        return days;
    }, [currentMonth]);

    const timeSlots = useMemo(() => {
        if (!bookingData.date) return [];
        return generateTimeSlots(bookingData.date, bookingData.serviceDuration);
    }, [bookingData.date, bookingData.serviceDuration]);

    const handleDateSelect = (date: Date) => {
        updateBookingData({
            date: date.toISOString().split("T")[0],
            time: null, // Reset time when date changes
        });
    };

    const handleTimeSelect = (time: string) => {
        updateBookingData({ time });
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const canContinue = bookingData.date && bookingData.time;
    const canGoPrev = currentMonth > new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const formatSelectedDate = () => {
        if (!bookingData.date) return "";
        const d = new Date(bookingData.date);
        return `${d.getDate()} ${HEBREW_MONTHS[d.getMonth()]}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>בחרי תאריך ושעה</h2>
                <p className={styles.subtitle}>{bookingData.serviceName} • {bookingData.serviceDuration} דקות</p>
            </div>

            {/* Calendar */}
            <div className={styles.calendar}>
                <div className={styles.calendarHeader}>
                    <button
                        className={styles.monthBtn}
                        onClick={prevMonth}
                        disabled={!canGoPrev}
                        aria-label="חודש קודם"
                    >
                        <ChevronDownIcon size={20} style={{ transform: "rotate(90deg)" }} />
                    </button>
                    <span className={styles.monthLabel}>
                        {HEBREW_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button
                        className={styles.monthBtn}
                        onClick={nextMonth}
                        aria-label="חודש הבא"
                    >
                        <ChevronDownIcon size={20} style={{ transform: "rotate(-90deg)" }} />
                    </button>
                </div>

                <div className={styles.weekDays}>
                    {HEBREW_DAYS.map((day) => (
                        <span key={day} className={styles.weekDay}>{day}</span>
                    ))}
                </div>

                <div className={styles.days}>
                    {calendarDays.map((day, i) => (
                        <button
                            key={i}
                            className={`${styles.day} ${day.date && bookingData.date === day.date.toISOString().split("T")[0]
                                    ? styles.selected
                                    : ""
                                } ${day.isToday ? styles.today : ""} ${day.isDisabled ? styles.disabled : ""}`}
                            onClick={() => day.date && !day.isDisabled && handleDateSelect(day.date)}
                            disabled={day.isDisabled || !day.date}
                        >
                            {day.date?.getDate() || ""}
                        </button>
                    ))}
                </div>
            </div>

            {/* Time slots */}
            {bookingData.date && (
                <div className={styles.timeSection}>
                    <h3 className={styles.timeTitle}>
                        שעות פנויות ב-{formatSelectedDate()}
                    </h3>
                    {timeSlots.length === 0 ? (
                        <p className={styles.noSlots}>אין שעות פנויות ביום זה</p>
                    ) : (
                        <div className={styles.timeGrid}>
                            {timeSlots.map((time) => (
                                <button
                                    key={time}
                                    className={`${styles.timeSlot} ${bookingData.time === time ? styles.selected : ""
                                        }`}
                                    onClick={() => handleTimeSelect(time)}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className={styles.footer}>
                <button className="btn btn-secondary" onClick={onBack}>
                    חזרה
                </button>
                <button
                    className="btn btn-primary"
                    onClick={onNext}
                    disabled={!canContinue}
                >
                    המשך
                </button>
            </div>
        </div>
    );
}
