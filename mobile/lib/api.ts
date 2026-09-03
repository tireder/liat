// API Client - All calls to the liat-nails.art backend
// No secrets in the client, HTTPS only. Mutations use GET with query params
// because POST bodies are blocked for the mobile client on Vercel (see notes below).

import { API_BASE_URL, SITE_ORIGIN } from './config';
import { getCached, setCache, CACHE_TTL } from './cache';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ApiResponse<T> {
    data?: T;
    error?: string;
}

/** Strips sensitive query values before anything reaches the console. */
function redact(url: string): string {
    return url.replace(/([?&](?:phone|code|token|name)=)[^&]*/gi, '$1***');
}

function log(...args: unknown[]) {
    if (__DEV__) console.log(...args);
}

function request<T>(
    endpoint: string,
    method: HttpMethod = 'GET',
    body?: Record<string, unknown>,
    timeoutMs: number = 15000
): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    log(`[API] ${method} ${redact(url)}`);

    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.timeout = timeoutMs;

        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return;

            if (xhr.status === 0) {
                resolve({ error: 'אין חיבור לאינטרנט. בדקי את החיבור ונסי שוב.' });
                return;
            }

            try {
                const data = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve({ data });
                } else {
                    resolve({ error: data.error || data.message || `שגיאת שרת (${xhr.status})` });
                }
            } catch {
                log('[API] Failed to parse JSON for', redact(url));
                resolve({ error: 'תגובה לא תקינה מהשרת' });
            }
        };

        xhr.ontimeout = () => {
            log('[API] timeout', redact(url));
            resolve({ error: 'הבקשה לקחה יותר מדי זמן. בדקי חיבור ונסי שוב.' });
        };

        xhr.onerror = () => {
            log('[API] XHR error', redact(url));
            resolve({ error: 'שגיאת חיבור לשרת' });
        };

        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('User-Agent', 'LiatNailsApp/1.0');
        xhr.setRequestHeader('Origin', SITE_ORIGIN);

        if (body && method !== 'GET') {
            xhr.send(JSON.stringify(body));
        } else {
            xhr.send();
        }
    });
}

// ==========================================
// OTP / Auth
// ==========================================
export const otpApi = {
    // GET workaround for Vercel POST blocking on mobile
    send: (phone: string) =>
        request<{ success: boolean }>(`/otp/send?phone=${encodeURIComponent(phone)}`, 'GET'),

    verify: (phone: string, code: string) =>
        request<{ success: boolean; verified: boolean; isNewClient?: boolean; clientName?: string | null }>(
            `/otp/verify?phone=${encodeURIComponent(phone)}&code=${encodeURIComponent(code)}`,
            'GET',
            undefined,
            8000
        ),
};

// ==========================================
// Services
// ==========================================
export interface Service {
    id: string;
    name: string;
    description: string | null;
    duration: number;
    price: number;
    active: boolean;
    sort_order: number;
}

// ==========================================
// Artists
// ==========================================
export interface Artist {
    id: string;
    name: string;
    sort_order: number;
    serviceIds: string[];
    averageRating?: number;
    totalReviews?: number;
}

// ==========================================
// Bookings
// ==========================================
export type BookingStatus = 'pending' | 'confirmed' | 'pending_change' | 'cancelled' | 'completed' | 'no_show';

export interface Booking {
    id: string;
    client_id: string;
    service_id: string;
    artist_id?: string | null;
    date: string;
    start_time: string;
    end_time: string;
    status: BookingStatus;
    notes: string | null;
    requested_date?: string | null;
    requested_time?: string | null;
    review_token?: string | null;
    service?: Pick<Service, 'id' | 'name' | 'price' | 'duration'> | null;
}

export interface CourseRegistration {
    id?: string;
    course_id: string;
    status?: string;
    course?: Course | null;
}

export interface MyBookingsResponse {
    client: { id: string; name: string | null; phone: string } | null;
    bookings: Booking[];
    courseRegistrations?: CourseRegistration[];
}

export const bookingsApi = {
    getMyBookings: (phone: string) =>
        request<MyBookingsResponse>(`/bookings/my?phone=${encodeURIComponent(phone)}`),

    // GET workaround for Vercel POST blocking on mobile
    create: (data: {
        phone: string;
        serviceId: string;
        date: string;
        startTime: string;
        name?: string;
        notes?: string;
        artistId?: string;
    }) => {
        const params = new URLSearchParams({
            phone: data.phone,
            serviceId: data.serviceId,
            date: data.date,
            startTime: data.startTime,
        });
        if (data.name) params.append('name', data.name);
        if (data.notes) params.append('notes', data.notes);
        if (data.artistId) params.append('artistId', data.artistId);
        return request<{ success: boolean; booking: Booking }>(`/bookings/create?${params.toString()}`, 'GET');
    },

    cancel: (id: string, phone: string) =>
        request<{ success: boolean }>(`/bookings/${id}?action=cancel&phone=${encodeURIComponent(phone)}`, 'GET'),

    /** The server only accepts date / startTime / notes on reschedule; service and artist stay fixed. */
    reschedule: (id: string, data: { phone: string; date: string; startTime: string; notes?: string }) => {
        const params = new URLSearchParams({
            action: 'reschedule',
            phone: data.phone,
            date: data.date,
            startTime: data.startTime,
        });
        if (data.notes) params.append('notes', data.notes);
        return request<{ success: boolean; booking: Booking; pending?: boolean }>(`/bookings/${id}?${params.toString()}`, 'GET');
    },
};

// ==========================================
// Availability (short-lived cache)
// ==========================================
export interface AvailabilityResult {
    slots: string[];
    closed?: boolean;
    blocked?: boolean;
}

export const calendarApi = {
    getAvailable: async (date: string, serviceId: string, artistId?: string | null): Promise<ApiResponse<AvailabilityResult>> => {
        const cacheKey = `slots_${date}_${serviceId}_${artistId || 'any'}`;
        const cached = getCached<AvailabilityResult>(cacheKey);
        if (cached) return { data: cached };

        let url = `/bookings/available?date=${date}&serviceId=${serviceId}`;
        if (artistId) url += `&artistId=${artistId}`;
        const result = await request<{ slots?: string[]; date?: string; closed?: boolean; blocked?: boolean }>(url);

        if (result.error) return { error: result.error };
        const data: AvailabilityResult = {
            slots: Array.isArray(result.data?.slots) ? result.data!.slots : [],
            closed: !!result.data?.closed,
            blocked: !!result.data?.blocked,
        };
        setCache(cacheKey, data, CACHE_TTL.SLOTS);
        return { data };
    },
};

// ==========================================
// Courses
// ==========================================
export interface Course {
    id: string;
    name: string;
    description: string | null;
    date: string;
    duration: string;
    price: number;
    capacity: number;
    active: boolean;
    enrolled?: number;
    location?: string | null;
    schedule_info?: string | null;
    whatsapp_group_link?: string | null;
}

export const coursesApi = {
    list: () => request<Course[]>('/courses'),

    // GET workaround for Vercel POST blocking on mobile
    register: (courseId: string, phone: string, name: string) =>
        request<{ success: boolean }>(
            `/courses/${courseId}/register?phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}`,
            'GET'
        ),
};

// ==========================================
// Gallery
// ==========================================
export interface GalleryImage {
    id: string;
    image_url: string;
    title: string | null;
    description: string | null;
    category: string | null;
}

export const galleryApi = {
    list: () => request<GalleryImage[]>('/gallery'),
};

// ==========================================
// Settings
// ==========================================
export interface OperatingHour {
    dayOfWeek: number;
    openTime: string | null;
    closeTime: string | null;
    active: boolean;
}

export interface Settings {
    business_name?: string;
    phone?: string;
    address?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    cancelHoursBefore?: number;
    bufferMinutes?: number;
    operatingHours?: OperatingHour[];
}

export const settingsApi = {
    get: () => request<Settings>('/settings'),
};

// ==========================================
// Bootstrap – combined initial load
// ==========================================
export interface BootstrapData {
    settings: Settings;
    services: Service[];
    artists: Artist[];
    courses: Course[];
    _ts: number;
}

export const bootstrapApi = {
    load: () => request<BootstrapData>('/bootstrap'),
};

// ==========================================
// Notifications
// ==========================================
export interface NotificationPreferences {
    app_notifications_enabled: boolean;
    sms_marketing: boolean;
    sms_reviews: boolean;
    sms_return_reminders: boolean;
}

export const notificationsApi = {
    registerToken: (phone: string, token: string, platform: string) =>
        request<{ success: boolean }>(
            `/notifications/register?phone=${encodeURIComponent(phone)}&token=${encodeURIComponent(token)}&platform=${encodeURIComponent(platform)}`,
            'GET'
        ),

    unregisterToken: (phone: string, token: string) =>
        request<{ success: boolean }>('/notifications/register', 'DELETE', { phone, token }),

    getPreferences: (phone: string) =>
        request<NotificationPreferences>(`/notifications/preferences?phone=${encodeURIComponent(phone)}`),

    updatePreferences: (phone: string, prefs: Partial<NotificationPreferences>) => {
        const params = new URLSearchParams({ phone, action: 'update' });
        for (const [key, val] of Object.entries(prefs)) {
            if (val !== undefined) params.set(key, String(val));
        }
        return request<{ success: boolean }>(`/notifications/preferences?${params.toString()}`, 'GET');
    },
};

// ==========================================
// Reviews
// ==========================================
export interface Review {
    id: string;
    rating: number;
    comment: string | null;
    name?: string;
    client_name?: string;
    date?: string;
    created_at?: string;
}

export interface ReviewSummary {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
}

export const reviewsApi = {
    list: async (): Promise<ApiResponse<ReviewSummary>> => {
        const result = await request<{ reviews: Review[]; averageRating: number; totalReviews?: number; totalCount?: number }>('/reviews');
        if (result.error || !result.data) return { error: result.error || 'שגיאה' };
        return {
            data: {
                reviews: result.data.reviews || [],
                averageRating: Number(result.data.averageRating) || 0,
                totalReviews: result.data.totalReviews ?? result.data.totalCount ?? result.data.reviews?.length ?? 0,
            },
        };
    },

    // GET workaround for Vercel POST blocking on mobile
    submit: (token: string, rating: number, comment?: string) => {
        const params = new URLSearchParams({ token, rating: String(rating), ...(comment && { comment }) });
        return request<{ success: boolean; review: Review }>(`/reviews?${params.toString()}`, 'GET');
    },
};

// ==========================================
// Clients
// ==========================================
export const clientsApi = {
    updateName: (phone: string, name: string) =>
        request<{ success: boolean }>(
            `/bookings/my?phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}&action=update`,
            'GET'
        ),
};
