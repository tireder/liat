// Date, time, price and phone formatting shared across screens.

export const HEBREW_DAYS_SHORT = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
export const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
export const HEBREW_MONTHS = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];
export const HEBREW_MONTHS_SHORT = [
    'ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני',
    'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳',
];

/** Left-to-right isolate so times/ranges keep their order inside Hebrew text. */
export const LRM = '‎';

/** Parses "YYYY-MM-DD" as a *local* date (never UTC midnight). */
export function parseLocalDate(dateStr: string): Date {
    const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
    if (!y || !m || !d) return new Date(NaN);
    return new Date(y, m - 1, d);
}

/** Combines "YYYY-MM-DD" and "HH:mm(:ss)" into a local Date. */
export function parseBookingDateTime(dateStr: string, timeStr: string | null | undefined): Date {
    const date = parseLocalDate(dateStr);
    if (Number.isNaN(date.getTime())) return date;
    const [h = 0, min = 0] = (timeStr || '00:00').split(':').map(Number);
    date.setHours(h, min, 0, 0);
    return date;
}

/** "YYYY-MM-DD" in local time. */
export function toDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "יום שלישי, 20 באוקטובר" */
export function formatDateLong(dateStr: string, withYear = false): string {
    const d = parseLocalDate(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const base = `יום ${HEBREW_DAYS[d.getDay()]}, ${d.getDate()} ב${HEBREW_MONTHS[d.getMonth()]}`;
    return withYear ? `${base} ${d.getFullYear()}` : base;
}

/** "20 באוקטובר" */
export function formatDateShort(dateStr: string): string {
    const d = parseLocalDate(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ב${HEBREW_MONTHS[d.getMonth()]}`;
}

/** Parts for the serif date block on tickets. */
export function dateParts(dateStr: string): { day: string; month: string; weekday: string } {
    const d = parseLocalDate(dateStr);
    if (Number.isNaN(d.getTime())) return { day: '', month: '', weekday: '' };
    return {
        day: String(d.getDate()),
        month: HEBREW_MONTHS_SHORT[d.getMonth()],
        weekday: HEBREW_DAYS[d.getDay()],
    };
}

/** "HH:mm" from "HH:mm:ss" */
export function formatTime(time: string | null | undefined): string {
    if (!time) return '';
    return time.slice(0, 5);
}

/** "10:30 – 11:15" wrapped for RTL contexts. */
export function formatTimeRange(start: string, end?: string | null): string {
    const s = formatTime(start);
    const e = formatTime(end);
    return e ? `${LRM}${s} – ${e}${LRM}` : `${LRM}${s}${LRM}`;
}

/** "₪1,200" */
export function formatPrice(price: number | string | null | undefined): string {
    const n = Number(price);
    if (!Number.isFinite(n)) return '';
    return `₪${n.toLocaleString('he-IL')}`;
}

/** "050-123-4567" for display (input stays digits). */
export function formatPhoneDisplay(phone: string | null | undefined): string {
    const digits = (phone || '').replace(/\D/g, '');
    if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    if (digits.length === 12 && digits.startsWith('972')) {
        const local = '0' + digits.slice(3);
        return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
    }
    return phone || '';
}

/** Progressive mask while typing: 05X-XXX-XXXX */
export function maskPhoneInput(text: string): string {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
}

/** "היום" / "מחר" / "בעוד 3 ימים" — relative to the booking's local date. */
export function relativeDayLabel(dateStr: string, now: Date = new Date()): string {
    const target = parseLocalDate(dateStr);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
    if (diffDays < 0) return 'עבר';
    if (diffDays === 0) return 'היום';
    if (diffDays === 1) return 'מחר';
    if (diffDays === 2) return 'מחרתיים';
    return `בעוד ${diffDays} ימים`;
}

/** Adds minutes to "HH:mm" and returns "HH:mm". */
export function addMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + minutes;
    const hh = Math.floor(total / 60) % 24;
    const mm = total % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
