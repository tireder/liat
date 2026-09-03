// Operating-hours helpers (data comes from /api/bootstrap → settings.operatingHours)
import type { OperatingHour } from './api';
import { HEBREW_DAYS, LRM } from './format';

export interface HoursRow {
    label: string;
    hours: string;
    closed: boolean;
    days: number[];
}

function describe(h: OperatingHour): string {
    return h.active && h.openTime && h.closeTime
        ? `${LRM}${h.openTime.slice(0, 5)} – ${h.closeTime.slice(0, 5)}${LRM}`
        : 'סגור';
}

/** Groups consecutive days with identical hours into one row. */
export function groupOperatingHours(hours: OperatingHour[] | undefined | null): HoursRow[] {
    if (!hours || hours.length === 0) return [];
    const sorted = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    const rows: HoursRow[] = [];
    for (const h of sorted) {
        const text = describe(h);
        const last = rows[rows.length - 1];
        const consecutive = last && last.days[last.days.length - 1] === h.dayOfWeek - 1;
        if (last && consecutive && last.hours === text) {
            last.days.push(h.dayOfWeek);
            last.label = `${HEBREW_DAYS[last.days[0]]} – ${HEBREW_DAYS[h.dayOfWeek]}`;
        } else {
            rows.push({ label: HEBREW_DAYS[h.dayOfWeek], hours: text, closed: text === 'סגור', days: [h.dayOfWeek] });
        }
    }
    return rows;
}

export function getTodayHours(hours: OperatingHour[] | undefined | null, now: Date = new Date()): OperatingHour | null {
    if (!hours) return null;
    return hours.find((h) => h.dayOfWeek === now.getDay()) || null;
}

export function isOpenToday(hours: OperatingHour[] | undefined | null, now: Date = new Date()): boolean {
    const today = getTodayHours(hours, now);
    return !!(today && today.active && today.openTime && today.closeTime);
}

/**
 * Whether the salon is open on a given weekday.
 * When hours are unknown (older server), every day stays enabled and the
 * availability API decides — never assume a closed day.
 */
export function isDayOpen(hours: OperatingHour[] | undefined | null, dayOfWeek: number): boolean {
    if (!hours || hours.length === 0) return true;
    const h = hours.find((o) => o.dayOfWeek === dayOfWeek);
    if (!h) return true;
    return !!(h.active && h.openTime && h.closeTime);
}
