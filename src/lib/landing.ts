/**
 * Shared types and helpers for the public landing surfaces.
 * Everything here operates on data that already lives in Supabase;
 * nothing invents business information.
 */

export interface GalleryImage {
    id: string;
    url: string;
    alt: string | null;
    category?: string | null;
}

export interface OperatingHour {
    dayOfWeek: number;
    openTime: string | null;
    closeTime: string | null;
    active: boolean;
}

export interface SiteInfo {
    businessName?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    aboutName?: string;
    aboutText?: string;
    aboutYears?: string;
    aboutClients?: string;
    aboutGraduates?: string;
    phone?: string;
    address?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    operatingHours?: OperatingHour[];
}

export interface ReviewItem {
    id: string;
    rating: number;
    comment: string | null;
    name: string;
    date: string;
}

export interface ReviewSummary {
    reviews: ReviewItem[];
    averageRating: number;
    totalReviews: number;
}

export interface CourseItem {
    id: string;
    name: string;
    description: string | null;
    date: string;
    duration: string;
    price: number;
    capacity: number;
    enrolled: number;
    location?: string | null;
    schedule_info?: string | null;
}

export interface ServiceItem {
    id: string;
    name: string;
    description: string | null;
    duration: number;
    price: number;
}

export type CourseStatus = "upcoming" | "limited" | "full" | "past";

/** Derives a display status from the course's own date and enrollment. */
export function getCourseStatus(course: Pick<CourseItem, "date" | "capacity" | "enrolled">, now: Date = new Date()): CourseStatus {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const courseDate = new Date(course.date + (course.date.length === 10 ? "T00:00:00" : ""));
    if (!Number.isNaN(courseDate.getTime()) && courseDate < today) return "past";

    const capacity = Number(course.capacity) || 0;
    const enrolled = Number(course.enrolled) || 0;
    if (capacity > 0 && enrolled >= capacity) return "full";
    if (capacity > 0 && capacity - enrolled <= 2) return "limited";
    return "upcoming";
}

export const COURSE_STATUS_LABEL: Record<CourseStatus, string> = {
    upcoming: "ההרשמה פתוחה",
    limited: "מקומות אחרונים",
    full: "הקורס מלא",
    past: "הסתיים",
};

export function formatCourseDate(dateStr: string): string {
    const date = new Date(dateStr + (dateStr.length === 10 ? "T00:00:00" : ""));
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function formatPrice(price: number): string {
    return `₪${Number(price).toLocaleString("he-IL")}`;
}

const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export interface HoursRow {
    label: string;
    hours: string;
    closed: boolean;
    days: number[];
}

/** Groups consecutive days that share the same hours into single rows. */
export function groupOperatingHours(hours: OperatingHour[] | undefined): HoursRow[] {
    if (!hours || hours.length === 0) return [];
    const sorted = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    const rows: HoursRow[] = [];

    const describe = (h: OperatingHour) =>
        h.active && h.openTime && h.closeTime ? `${h.openTime.slice(0, 5)} – ${h.closeTime.slice(0, 5)}` : "סגור";

    for (const h of sorted) {
        const text = describe(h);
        const last = rows[rows.length - 1];
        const isConsecutive = last && last.days[last.days.length - 1] === h.dayOfWeek - 1;
        if (last && isConsecutive && last.hours === text) {
            last.days.push(h.dayOfWeek);
            last.label = `${DAY_NAMES[last.days[0]]} – ${DAY_NAMES[h.dayOfWeek]}`;
        } else {
            rows.push({ label: DAY_NAMES[h.dayOfWeek], hours: text, closed: text === "סגור", days: [h.dayOfWeek] });
        }
    }
    return rows;
}

/** Returns today's hours row when the salon is open today. */
export function getTodayHours(hours: OperatingHour[] | undefined, now: Date = new Date()): OperatingHour | null {
    if (!hours) return null;
    return hours.find((h) => h.dayOfWeek === now.getDay()) || null;
}

export function digitsOnly(value: string | undefined): string {
    return (value || "").replace(/\D/g, "");
}

export function toInternationalPhone(value: string | undefined): string {
    const digits = digitsOnly(value);
    if (!digits) return "";
    if (digits.startsWith("972")) return `+${digits}`;
    if (digits.startsWith("0")) return `+972${digits.slice(1)}`;
    return `+972${digits}`;
}

export function toWhatsAppNumber(value: string | undefined): string {
    return toInternationalPhone(value).replace("+", "");
}

/** "ביקורת אחת" / "12 ביקורות" — Hebrew singular/plural for review counts. */
export function reviewCountLabel(count: number): string {
    if (count === 1) return "ביקורת אחת";
    if (count === 2) return "שתי ביקורות";
    return `${count} ביקורות`;
}
