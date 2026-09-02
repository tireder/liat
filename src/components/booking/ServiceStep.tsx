"use client";

import { useEffect, useState } from "react";
import { BookingData } from "@/app/book/page";
import { ClockIcon, CheckIcon } from "@/components/icons";
import { formatPrice } from "@/lib/landing";
import styles from "./ServiceStep.module.css";

interface ServiceStepProps {
    bookingData: BookingData;
    updateBookingData: (data: Partial<BookingData>) => void;
    onNext: () => void;
    artistId?: string | null;
    preselectServiceId?: string | null;
}

interface Service {
    id: string;
    name: string;
    description: string | null;
    duration: number;
    price: number;
}

export default function ServiceStep({
    bookingData,
    updateBookingData,
    onNext,
    artistId,
    preselectServiceId,
}: ServiceStepProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [recentServiceId, setRecentServiceId] = useState<string | null>(null);
    const [artistServiceIds, setArtistServiceIds] = useState<string[] | null>(null);

    // Surface the client's most recent treatment first
    useEffect(() => {
        if (!bookingData.phone) return;
        async function fetchHistory() {
            try {
                const res = await fetch(`/api/bookings/my?phone=${encodeURIComponent(bookingData.phone)}`);
                if (res.ok) {
                    const bookings = await res.json();
                    const lastBooking = (Array.isArray(bookings) ? bookings : [])
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .filter((b: any) => b.status === "confirmed" && b.service)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                    if (lastBooking?.service?.id) setRecentServiceId(lastBooking.service.id);
                }
            } catch (e) {
                console.error("Error fetching history:", e);
            }
        }
        fetchHistory();
    }, [bookingData.phone]);

    useEffect(() => {
        async function fetchServices() {
            setError("");
            try {
                if (artistId) {
                    const artistRes = await fetch("/api/artists");
                    if (artistRes.ok) {
                        const artists = await artistRes.json();
                        const artist = artists.find((a: { id: string }) => a.id === artistId);
                        if (artist) setArtistServiceIds(artist.serviceIds || []);
                    }
                }

                const res = await fetch("/api/services");
                if (!res.ok) throw new Error("services");
                setServices(await res.json());
            } catch (err) {
                console.error("Error fetching services:", err);
                setError("לא הצלחנו לטעון את רשימת הטיפולים. נסי לרענן את העמוד.");
            }
            setLoading(false);
        }
        fetchServices();
    }, [artistId]);

    const handleSelect = (service: Service) => {
        updateBookingData({
            serviceId: service.id,
            serviceName: service.name,
            servicePrice: service.price,
            serviceDuration: service.duration,
        });
    };

    const visible = services.filter((s) => !artistServiceIds || artistServiceIds.includes(s.id));

    // Pre-select the service passed from a landing-page card (once)
    useEffect(() => {
        if (loading || !preselectServiceId || bookingData.serviceId) return;
        const match = visible.find((s) => s.id === preselectServiceId);
        if (match) handleSelect(match);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, preselectServiceId, artistServiceIds, services.length]);

    const canContinue = bookingData.serviceId !== null;
    const ordered = [...visible].sort((a, b) => (a.id === recentServiceId ? -1 : b.id === recentServiceId ? 1 : 0));

    if (loading) {
        return (
            <div className={styles.container} aria-busy="true">
                <div className={styles.header}>
                    <h2 className={`display ${styles.title}`}>בחרי טיפול</h2>
                    <p className={styles.subtitle}>טוענת את רשימת הטיפולים...</p>
                </div>
                <div className={styles.list}>
                    {[0, 1, 2].map((i) => <div key={i} className={styles.skeleton} />)}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={`display ${styles.title}`}>בחרי טיפול</h2>
                <p className={styles.subtitle}>איזה טיפול מתאים לך היום?</p>
            </div>

            {error && <p className="field-error" role="alert">{error}</p>}

            {!error && ordered.length === 0 && (
                <p className={styles.empty}>אין כרגע טיפולים זמינים לבחירה.</p>
            )}

            <div className={styles.list} role="radiogroup" aria-label="טיפולים">
                {ordered.map((service) => {
                    const selected = bookingData.serviceId === service.id;
                    const isRecent = service.id === recentServiceId;
                    return (
                        <button
                            key={service.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            className={`${styles.card} ${selected ? styles.selected : ""}`}
                            onClick={() => handleSelect(service)}
                        >
                            <span className={styles.check} aria-hidden="true">
                                <CheckIcon size={14} />
                            </span>
                            <span className={styles.cardContent}>
                                <span className={styles.cardTitleRow}>
                                    <span className={`display ${styles.cardTitle}`}>{service.name}</span>
                                    {isRecent && <span className={styles.recent}>הטיפול האחרון שלך</span>}
                                </span>
                                {service.description && (
                                    <span className={styles.cardDescription}>{service.description}</span>
                                )}
                                <span className={styles.cardMeta}>
                                    <span className={styles.duration}>
                                        <ClockIcon size={13} />
                                        <span className="tabular">{service.duration} דק׳</span>
                                    </span>
                                    <span className={`display tabular ${styles.price}`}>{formatPrice(service.price)}</span>
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className={styles.footer}>
                <button
                    type="button"
                    className="btn btn-primary btn-block btn-lg"
                    onClick={onNext}
                    disabled={!canContinue}
                >
                    {canContinue ? "המשך לבחירת תאריך" : "בחרי טיפול כדי להמשיך"}
                </button>
            </div>
        </div>
    );
}
