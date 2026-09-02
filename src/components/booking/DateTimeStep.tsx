"use client";

import { useState, useMemo, useEffect } from "react";
import { BookingData } from "@/app/book/page";
import { ChevronDownIcon } from "@/components/icons";
import styles from "./DateTimeStep.module.css";

interface DateTimeStepProps {
    bookingData: BookingData;
    updateBookingData: (data: Partial<BookingData>) => void;
    onNext: () => void;
    onBack: () => void;
    rescheduleMode?: boolean;
    artistId?: string | null;
}

interface OperatingHour {
    dayOfWeek: number;
    openTime: string | null;
    closeTime: string | null;
    active: boolean;
}

const HEBREW_DAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const HEBREW_DAYS_FULL = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const HEBREW_MONTHS = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

type SlotState =
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "ready"; slots: string[] }
    | { kind: "closed" }
    | { kind: "blocked" }
    | { kind: "error" };

export default function DateTimeStep({
    bookingData,
    updateBookingData,
    onNext,
    onBack,
    rescheduleMode = false,
    artistId,
}: DateTimeStepProps) {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [operatingHours, setOperatingHours] = useState<OperatingHour[] | null>(null);
    const [bufferMinutes, setBufferMinutes] = useState(15);
    const [slotState, setSlotState] = useState<SlotState>({ kind: "idle" });

    // Operating hours + buffer come from the salon's settings, not hard-coded values
    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data.operatingHours)) setOperatingHours(data.operatingHours);
                    if (typeof data.bufferMinutes === "number") setBufferMinutes(data.bufferMinutes);
                }
            } catch {
                // Keep defaults; the availability API still enforces the real hours
            }
        }
        fetchSettings();
    }, []);

    // Availability is computed server-side (operating hours, blocked slots, existing bookings)
    useEffect(() => {
        const date = bookingData.date;
        if (!date) {
            setSlotState({ kind: "idle" });
            return;
        }
        let cancelled = false;
        setSlotState({ kind: "loading" });

        async function fetchSlots() {
            try {
                const params = new URLSearchParams({ date: date as string });
                if (bookingData.serviceId) params.set("serviceId", bookingData.serviceId);
                if (artistId) params.set("artistId", artistId);
                const res = await fetch(`/api/bookings/available?${params.toString()}`);
                if (!res.ok) throw new Error("availability");
                const data = await res.json();
                if (cancelled) return;

                if (data.closed) return setSlotState({ kind: "closed" });
                if (data.blocked) return setSlotState({ kind: "blocked" });

                // Drop slots that have already passed today (plus the booking buffer)
                const now = new Date();
                const isToday = formatLocalDate(now) === date;
                const cutoff = now.getTime() + bufferMinutes * 60 * 1000;
                const slots: string[] = (data.slots || []).filter((time: string) => {
                    if (!isToday) return true;
                    const [h, m] = time.split(":").map(Number);
                    const slot = new Date(now);
                    slot.setHours(h, m, 0, 0);
                    return slot.getTime() > cutoff;
                });
                setSlotState({ kind: "ready", slots });
            } catch (error) {
                console.error("Error fetching available slots:", error);
                if (!cancelled) setSlotState({ kind: "error" });
            }
        }
        fetchSlots();
        return () => { cancelled = true; };
    }, [bookingData.date, bookingData.serviceId, artistId, bufferMinutes]);

    const isDayClosed = (date: Date) => {
        if (!operatingHours) return false;
        const h = operatingHours.find((o) => o.dayOfWeek === date.getDay());
        return !!h && (!h.active || !h.openTime || !h.closeTime);
    };

    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay();

        const days: { date: Date | null; isToday: boolean; isDisabled: boolean; closed: boolean }[] = [];
        for (let i = 0; i < startPadding; i++) {
            days.push({ date: null, isToday: false, isDisabled: true, closed: false });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            const isPast = date < today;
            const closed = isDayClosed(date);
            days.push({
                date,
                isToday: date.getTime() === today.getTime(),
                isDisabled: isPast || closed,
                closed,
            });
        }
        return days;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMonth, operatingHours]);

    const handleDateSelect = (date: Date) => {
        updateBookingData({ date: formatLocalDate(date), time: null });
    };

    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    const canContinue = !!(bookingData.date && bookingData.time);
    const canGoPrev = currentMonth > new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const selectedLabel = useMemo(() => {
        if (!bookingData.date) return "";
        const [y, m, d] = bookingData.date.split("-").map(Number);
        const date = new Date(y, m - 1, d);
        return `יום ${HEBREW_DAYS_FULL[date.getDay()]}, ${d} ב${HEBREW_MONTHS[m - 1]}`;
    }, [bookingData.date]);

    // Group slots into parts of the day for quick scanning
    const groups = useMemo(() => {
        if (slotState.kind !== "ready") return [];
        const byPart: Record<string, string[]> = { בוקר: [], צהריים: [], ערב: [] };
        slotState.slots.forEach((t) => {
            const hour = Number(t.split(":")[0]);
            if (hour < 12) byPart["בוקר"].push(t);
            else if (hour < 16) byPart["צהריים"].push(t);
            else byPart["ערב"].push(t);
        });
        return Object.entries(byPart).filter(([, slots]) => slots.length > 0);
    }, [slotState]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={`display ${styles.title}`}>{rescheduleMode ? "בחרי מועד חדש" : "מתי נוח לך?"}</h2>
                <p className={styles.subtitle}>
                    {bookingData.serviceName}
                    {bookingData.serviceDuration ? <> · <span className="tabular">{bookingData.serviceDuration} דקות</span></> : null}
                </p>
            </div>

            {/* Calendar */}
            <div className={styles.calendar}>
                <div className={styles.calendarHeader}>
                    <button
                        type="button"
                        className={styles.monthBtn}
                        onClick={prevMonth}
                        disabled={!canGoPrev}
                        aria-label="חודש קודם"
                    >
                        <ChevronDownIcon size={18} style={{ transform: "rotate(-90deg)" }} />
                    </button>
                    <span className={`display ${styles.monthLabel}`} aria-live="polite">
                        {HEBREW_MONTHS[currentMonth.getMonth()]} <span className="tabular">{currentMonth.getFullYear()}</span>
                    </span>
                    <button type="button" className={styles.monthBtn} onClick={nextMonth} aria-label="חודש הבא">
                        <ChevronDownIcon size={18} style={{ transform: "rotate(90deg)" }} />
                    </button>
                </div>

                <div className={styles.weekDays} aria-hidden="true">
                    {HEBREW_DAYS.map((day) => (
                        <span key={day} className={styles.weekDay}>{day}</span>
                    ))}
                </div>

                <div className={styles.days} role="grid" aria-label="בחירת תאריך">
                    {calendarDays.map((day, i) => {
                        const value = day.date ? formatLocalDate(day.date) : "";
                        const selected = !!day.date && bookingData.date === value;
                        return (
                            <button
                                key={i}
                                type="button"
                                className={`${styles.day} ${selected ? styles.selected : ""} ${day.isToday ? styles.today : ""} ${day.closed ? styles.closedDay : ""}`}
                                onClick={() => day.date && !day.isDisabled && handleDateSelect(day.date)}
                                disabled={day.isDisabled || !day.date}
                                aria-pressed={selected}
                                aria-label={day.date ? `${day.date.getDate()} ב${HEBREW_MONTHS[day.date.getMonth()]}${day.closed ? ", סגור" : ""}` : undefined}
                                tabIndex={day.date ? 0 : -1}
                            >
                                <span className="tabular">{day.date?.getDate() || ""}</span>
                            </button>
                        );
                    })}
                </div>

                {operatingHours && (
                    <p className={styles.legend}>ימים מסומנים בקו הם ימים שהסלון סגור</p>
                )}
            </div>

            {/* Time slots */}
            {bookingData.date && (
                <div className={styles.timeSection}>
                    <h3 className={styles.timeTitle}>שעות פנויות · {selectedLabel}</h3>

                    {slotState.kind === "loading" && (
                        <div className={styles.timeGrid} aria-busy="true">
                            {Array.from({ length: 8 }).map((_, i) => <span key={i} className={styles.slotSkeleton} />)}
                        </div>
                    )}

                    {slotState.kind === "closed" && (
                        <p className={styles.notice}>הסלון סגור ביום זה. בחרי יום אחר.</p>
                    )}
                    {slotState.kind === "blocked" && (
                        <p className={styles.notice}>היום הזה לא זמין להזמנות. בחרי יום אחר.</p>
                    )}
                    {slotState.kind === "error" && (
                        <p className={styles.notice} role="alert">לא הצלחנו לטעון את השעות הפנויות. נסי שוב.</p>
                    )}
                    {slotState.kind === "ready" && slotState.slots.length === 0 && (
                        <p className={styles.notice}>כל השעות ביום זה תפוסות. נסי יום אחר.</p>
                    )}

                    {slotState.kind === "ready" && groups.map(([part, slots]) => (
                        <div key={part} className={styles.timeGroup}>
                            <span className={styles.timeGroupLabel}>{part}</span>
                            <div className={styles.timeGrid} role="radiogroup" aria-label={`שעות ${part}`}>
                                {slots.map((time) => {
                                    const selected = bookingData.time === time;
                                    return (
                                        <button
                                            key={time}
                                            type="button"
                                            role="radio"
                                            aria-checked={selected}
                                            className={`${styles.timeSlot} ${selected ? styles.selected : ""}`}
                                            onClick={() => updateBookingData({ time })}
                                        >
                                            <span className="tabular" dir="ltr">{time}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {canContinue && (
                <div className={styles.summary} aria-live="polite">
                    <span className={styles.summaryLabel}>נבחר</span>
                    <span className={styles.summaryValue}>
                        {selectedLabel} · <span className="tabular" dir="ltr">{bookingData.time}</span>
                    </span>
                </div>
            )}

            <div className={styles.footer}>
                <button type="button" className="btn btn-secondary" onClick={onBack}>
                    חזרה
                </button>
                <button type="button" className="btn btn-primary" onClick={onNext} disabled={!canContinue}>
                    המשך
                </button>
            </div>
        </div>
    );
}
