// AppDataProvider – centralized data fetching & caching.
// Bootstrap (settings/services/artists/courses) loads once and is persisted for
// instant cold starts; bookings, gallery and reviews are cached separately.

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
    bootstrapApi,
    settingsApi,
    galleryApi,
    bookingsApi,
    reviewsApi,
    Service,
    Artist,
    Course,
    Settings,
    GalleryImage,
    Booking,
    BootstrapData,
    CourseRegistration,
    ReviewSummary,
} from './api';
import {
    getCached,
    setCache,
    invalidateCache,
    invalidateSlots as invalidateSlotCache,
    CACHE_TTL,
    CACHE_KEYS,
    persistCache,
    loadPersistedCache,
} from './cache';

interface AppData {
    settings: Settings;
    services: Service[];
    artists: Artist[];
    courses: Course[];

    gallery: GalleryImage[];
    bookings: Booking[];
    myCourseIds: string[];
    myCourseRegistrations: CourseRegistration[];
    reviewSummary: ReviewSummary | null;

    isBootstrapLoading: boolean;
    isGalleryLoading: boolean;
    isBookingsLoading: boolean;
    bootstrapError: string | null;

    refreshBootstrap: (force?: boolean) => Promise<void>;
    refreshGallery: (force?: boolean) => Promise<void>;
    refreshBookings: (phone: string, force?: boolean) => Promise<void>;
    refreshReviews: () => Promise<void>;
    invalidateBookings: () => void;
    invalidateSlots: () => void;

    cancelHoursBefore: number;
    bufferMinutes: number;
    businessPhone: string;
    businessWhatsApp: string;
    businessAddress: string;
    businessName: string;
    clientName: string | null;
}

const defaultSettings: Settings = {
    phone: '',
    address: '',
    whatsapp: '',
    cancelHoursBefore: 24,
    bufferMinutes: 15,
    operatingHours: [],
};

const AppDataContext = createContext<AppData | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [services, setServices] = useState<Service[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);

    const [gallery, setGallery] = useState<GalleryImage[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [myCourseRegistrations, setMyCourseRegistrations] = useState<CourseRegistration[]>([]);
    const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
    const [clientName, setClientName] = useState<string | null>(null);

    const [isBootstrapLoading, setIsBootstrapLoading] = useState(true);
    const [isGalleryLoading, setIsGalleryLoading] = useState(false);
    const [isBookingsLoading, setIsBookingsLoading] = useState(false);
    const [bootstrapError, setBootstrapError] = useState<string | null>(null);

    const bootstrapInFlight = useRef<Promise<void> | null>(null);

    const applyBootstrap = useCallback((data: BootstrapData) => {
        setSettings({ ...defaultSettings, ...data.settings });
        setServices(data.services || []);
        setArtists(data.artists || []);
        setCourses(data.courses || []);
    }, []);

    // ===== Bootstrap =====
    const refreshBootstrap = useCallback(async (force?: boolean) => {
        if (!force) {
            const cached = getCached<BootstrapData>(CACHE_KEYS.BOOTSTRAP);
            if (cached) {
                applyBootstrap(cached);
                setIsBootstrapLoading(false);
                return;
            }
        }

        // Share the in-flight request so pull-to-refresh actually waits for data
        if (bootstrapInFlight.current) return bootstrapInFlight.current;

        const run = (async () => {
            try {
                const result = await bootstrapApi.load();
                if (result.data) {
                    applyBootstrap(result.data);
                    setBootstrapError(null);
                    setCache(CACHE_KEYS.BOOTSTRAP, result.data, CACHE_TTL.BOOTSTRAP);
                    persistCache(CACHE_KEYS.BOOTSTRAP, result.data);
                } else {
                    setBootstrapError(result.error || 'שגיאה בטעינת הנתונים');
                    const persisted = await loadPersistedCache<BootstrapData>(CACHE_KEYS.BOOTSTRAP);
                    if (persisted) {
                        applyBootstrap(persisted);
                    } else {
                        const settingsResult = await settingsApi.get();
                        if (settingsResult.data) setSettings({ ...defaultSettings, ...settingsResult.data });
                    }
                }
            } catch (error) {
                console.error('Bootstrap load error:', error);
                setBootstrapError('שגיאה בטעינת הנתונים');
            } finally {
                setIsBootstrapLoading(false);
                bootstrapInFlight.current = null;
            }
        })();

        bootstrapInFlight.current = run;
        return run;
    }, [applyBootstrap]);

    // ===== Gallery =====
    const refreshGallery = useCallback(async (force?: boolean) => {
        if (!force) {
            const cached = getCached<GalleryImage[]>(CACHE_KEYS.GALLERY);
            if (cached) {
                setGallery(cached);
                return;
            }
        } else {
            invalidateCache(CACHE_KEYS.GALLERY);
        }

        setIsGalleryLoading(true);
        try {
            const result = await galleryApi.list();
            if (result.data) {
                const list = Array.isArray(result.data) ? result.data : [];
                setGallery(list);
                setCache(CACHE_KEYS.GALLERY, list, CACHE_TTL.GALLERY);
                persistCache(CACHE_KEYS.GALLERY, list);
            }
        } catch (error) {
            console.error('Gallery load error:', error);
        } finally {
            setIsGalleryLoading(false);
        }
    }, []);

    // ===== Reviews (social proof, non-blocking) =====
    const refreshReviews = useCallback(async () => {
        const cached = getCached<ReviewSummary>(CACHE_KEYS.REVIEWS);
        if (cached) {
            setReviewSummary(cached);
            return;
        }
        const result = await reviewsApi.list();
        if (result.data) {
            setReviewSummary(result.data);
            setCache(CACHE_KEYS.REVIEWS, result.data, CACHE_TTL.BOOTSTRAP);
        }
    }, []);

    // ===== Bookings =====
    const refreshBookings = useCallback(async (phone: string, force?: boolean) => {
        if (!phone) return;

        if (!force) {
            const cached = getCached<Booking[]>(CACHE_KEYS.BOOKINGS);
            if (cached) {
                setBookings(cached);
                return;
            }
        } else {
            invalidateCache(CACHE_KEYS.BOOKINGS);
        }

        setIsBookingsLoading(true);
        try {
            const result = await bookingsApi.getMyBookings(phone);
            if (result.data) {
                const list = Array.isArray(result.data.bookings) ? result.data.bookings : [];
                setBookings(list);
                setMyCourseRegistrations(result.data.courseRegistrations || []);
                if (result.data.client?.name) setClientName(result.data.client.name);
                setCache(CACHE_KEYS.BOOKINGS, list, CACHE_TTL.BOOKINGS);
            }
        } catch (error) {
            console.error('Bookings load error:', error);
        } finally {
            setIsBookingsLoading(false);
        }
    }, []);

    const invalidateBookings = useCallback(() => {
        invalidateCache(CACHE_KEYS.BOOKINGS);
    }, []);

    const invalidateSlots = useCallback(() => {
        invalidateSlotCache();
    }, []);

    // Persisted snapshot first (instant), then a fresh fetch in the background
    useEffect(() => {
        let cancelled = false;
        async function init() {
            const [persistedBootstrap, persistedGallery] = await Promise.all([
                loadPersistedCache<BootstrapData>(CACHE_KEYS.BOOTSTRAP),
                loadPersistedCache<GalleryImage[]>(CACHE_KEYS.GALLERY),
            ]);
            if (cancelled) return;
            if (persistedBootstrap) {
                applyBootstrap(persistedBootstrap);
                setIsBootstrapLoading(false);
            }
            if (persistedGallery && Array.isArray(persistedGallery)) setGallery(persistedGallery);

            refreshBootstrap();
            refreshGallery();
            refreshReviews();
        }
        init();
        return () => {
            cancelled = true;
        };
    }, [applyBootstrap, refreshBootstrap, refreshGallery, refreshReviews]);

    const value: AppData = {
        settings,
        services,
        artists,
        courses,
        gallery,
        bookings,
        myCourseIds: myCourseRegistrations.map((r) => r.course_id),
        myCourseRegistrations,
        reviewSummary,
        isBootstrapLoading,
        isGalleryLoading,
        isBookingsLoading,
        bootstrapError,
        refreshBootstrap,
        refreshGallery,
        refreshBookings,
        refreshReviews,
        invalidateBookings,
        invalidateSlots,
        cancelHoursBefore: settings.cancelHoursBefore ?? 24,
        bufferMinutes: settings.bufferMinutes ?? 15,
        businessPhone: settings.phone ?? '',
        businessWhatsApp: settings.whatsapp || settings.phone || '',
        businessAddress: settings.address ?? '',
        businessName: settings.business_name || 'ליאת',
        clientName,
    };

    return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
    const context = useContext(AppDataContext);
    if (!context) {
        throw new Error('useAppData must be used within AppDataProvider');
    }
    return context;
}
