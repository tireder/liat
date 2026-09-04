// Booking helpers shared by Home, Appointments and the wizard.
import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import type { Booking, BookingStatus } from './api';
import { parseBookingDateTime, parseLocalDate } from './format';

export type StatusTone = 'success' | 'warning' | 'neutral' | 'danger' | 'rose';

export const BOOKING_STATUS: Record<BookingStatus, { label: string; tone: StatusTone }> = {
    pending: { label: 'ממתין לאישור', tone: 'warning' },
    confirmed: { label: 'מאושר', tone: 'success' },
    pending_change: { label: 'ממתין לאישור שינוי', tone: 'warning' },
    completed: { label: 'הושלם', tone: 'neutral' },
    cancelled: { label: 'בוטל', tone: 'danger' },
    no_show: { label: 'לא הגעת', tone: 'danger' },
};

export function getStatusInfo(status: BookingStatus | string) {
    return BOOKING_STATUS[status as BookingStatus] || { label: String(status), tone: 'neutral' as StatusTone };
}

const ACTIVE_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'pending_change'];

/** Start datetime of a booking in local time. */
export function bookingStart(b: Pick<Booking, 'date' | 'start_time'>): Date {
    return parseBookingDateTime(b.date, b.start_time);
}

/** End datetime; falls back to start when end_time is missing. */
export function bookingEnd(b: Pick<Booking, 'date' | 'start_time' | 'end_time'>): Date {
    return parseBookingDateTime(b.date, b.end_time || b.start_time);
}

/** True while the appointment has not finished yet (today's bookings stay "upcoming"). */
export function isUpcoming(b: Booking, now: Date = new Date()): boolean {
    if (!ACTIVE_STATUSES.includes(b.status)) return false;
    return bookingEnd(b).getTime() >= now.getTime();
}

export function isPast(b: Booking, now: Date = new Date()): boolean {
    return !isUpcoming(b, now);
}

/** The soonest active booking that has not ended yet. */
export function getNextBooking(bookings: Booking[], now: Date = new Date()): Booking | null {
    return (
        bookings
            .filter((b) => isUpcoming(b, now))
            .sort((a, b) => bookingStart(a).getTime() - bookingStart(b).getTime())[0] || null
    );
}

/** Most recent completed booking (for "book again"). */
export function getLastCompleted(bookings: Booking[]): Booking | null {
    return (
        bookings
            .filter((b) => b.status === 'completed')
            .sort((a, b) => bookingStart(b).getTime() - bookingStart(a).getTime())[0] || null
    );
}

/** Can the client still cancel/reschedule without contacting the salon? */
export function canModify(b: Booking, cancelHoursBefore: number, now: Date = new Date()): boolean {
    const hoursUntil = (bookingStart(b).getTime() - now.getTime()) / 3600000;
    return hoursUntil >= cancelHoursBefore;
}

export type BookingSort = 'date-asc' | 'date-desc' | 'service' | 'status';

const STATUS_ORDER: Record<BookingStatus, number> = {
    confirmed: 0,
    pending: 1,
    pending_change: 1,
    completed: 2,
    cancelled: 3,
    no_show: 4,
};

export function sortBookings(list: Booking[], sortBy: BookingSort): Booking[] {
    const copy = [...list];
    switch (sortBy) {
        case 'date-desc':
            return copy.sort((a, b) => bookingStart(b).getTime() - bookingStart(a).getTime());
        case 'service':
            return copy.sort((a, b) => (a.service?.name || '').localeCompare(b.service?.name || '', 'he'));
        case 'status':
            return copy.sort((a, b) => (STATUS_ORDER[a.status] ?? 5) - (STATUS_ORDER[b.status] ?? 5));
        case 'date-asc':
        default:
            return copy.sort((a, b) => bookingStart(a).getTime() - bookingStart(b).getTime());
    }
}

export type CalendarResult =
    | { ok: true }
    | { ok: false; reason: 'permission' | 'no-calendar' | 'error' };

/** Adds the appointment to the device calendar with a one-hour reminder. */
export async function addBookingToCalendar(b: Booking, businessName?: string): Promise<CalendarResult> {
    try {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status !== 'granted') return { ok: false, reason: 'permission' };

        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const target =
            Platform.OS === 'ios'
                ? calendars.find((c) => c.allowsModifications && c.source?.type === 'local')
                  || calendars.find((c) => c.allowsModifications)
                  || calendars[0]
                : calendars.find((c) => c.accessLevel === 'owner' && c.allowsModifications)
                  || calendars.find((c) => c.allowsModifications)
                  || calendars[0];
        if (!target) return { ok: false, reason: 'no-calendar' };

        const serviceName = b.service?.name || 'טיפול ציפורניים';
        await Calendar.createEventAsync(target.id, {
            title: businessName ? `${serviceName} · ${businessName}` : serviceName,
            startDate: bookingStart(b),
            endDate: bookingEnd(b),
            notes: b.notes || undefined,
            alarms: [{ relativeOffset: -60 }],
        });
        return { ok: true };
    } catch (error) {
        console.error('[Calendar] add failed', error);
        return { ok: false, reason: 'error' };
    }
}

/** Groups "HH:mm" slots into parts of the day. */
export function groupSlots(slots: string[]): { key: 'morning' | 'noon' | 'evening'; label: string; slots: string[] }[] {
    const groups = {
        morning: [] as string[],
        noon: [] as string[],
        evening: [] as string[],
    };
    for (const t of slots) {
        const hour = Number(t.split(':')[0]);
        if (hour < 12) groups.morning.push(t);
        else if (hour < 16) groups.noon.push(t);
        else groups.evening.push(t);
    }
    return [
        { key: 'morning' as const, label: 'בוקר', slots: groups.morning },
        { key: 'noon' as const, label: 'צהריים', slots: groups.noon },
        { key: 'evening' as const, label: 'ערב', slots: groups.evening },
    ].filter((g) => g.slots.length > 0);
}

/** Drops slots that already passed today (plus the salon's buffer). */
export function filterPastSlots(dateKey: string, slots: string[], bufferMinutes: number, now: Date = new Date()): string[] {
    const day = parseLocalDate(dateKey);
    const isToday =
        day.getFullYear() === now.getFullYear() && day.getMonth() === now.getMonth() && day.getDate() === now.getDate();
    if (!isToday) return slots;
    const cutoff = now.getTime() + bufferMinutes * 60000;
    return slots.filter((t) => parseBookingDateTime(dateKey, t).getTime() > cutoff);
}
