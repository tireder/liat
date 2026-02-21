"use client";

import { useEffect, useState } from "react";
import { BookingData } from "@/app/book/page";
import { NailPolishIcon, SparklesIcon, DiamondIcon, PaletteIcon, FootIcon, WrenchIcon, ClockIcon, CheckIcon } from "@/components/icons";
import styles from "./ServiceStep.module.css";

interface ServiceStepProps {
    bookingData: BookingData;
    updateBookingData: (data: Partial<BookingData>) => void;
    onNext: () => void;
    artistId?: string | null;
}

interface Service {
    id: string;
    name: string;
    description: string | null;
    duration: number;
    price: number;
}

// Map service names to icons
const iconMap: Record<string, React.FC<{ size?: number; color?: string }>> = {
    "מניקור קלאסי": NailPolishIcon,
    "מניקור ג׳ל": SparklesIcon,
    "בניית ציפורניים": DiamondIcon,
    "עיצוב נייל ארט": PaletteIcon,
    "פדיקור ספא": FootIcon,
    "תיקון ציפורן": WrenchIcon,
};

export default function ServiceStep({
    bookingData,
    updateBookingData,
    onNext,
    artistId,
}: ServiceStepProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [recentServiceId, setRecentServiceId] = useState<string | null>(null);
    const [artistServiceIds, setArtistServiceIds] = useState<string[] | null>(null);

    useEffect(() => {
        if (bookingData.phone) {
            async function fetchHistory() {
                try {
                    const res = await fetch(`/api/bookings/my?phone=${encodeURIComponent(bookingData.phone)}`);
                    if (res.ok) {
                        const bookings = await res.json();
                        // Find last confirmed booking service
                        const lastBooking = bookings
                            .filter((b: any) => b.status === "confirmed" && b.service)
                            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

                        if (lastBooking?.service?.id) {
                            setRecentServiceId(lastBooking.service.id);
                        }
                    }
                } catch (e) {
                    console.error("Error fetching history:", e);
                }
            }
            fetchHistory();
        }
    }, [bookingData.phone]);

    useEffect(() => {
        async function fetchServices() {
            try {
                // Fetch artist service assignments if artistId provided
                if (artistId) {
                    const artistRes = await fetch("/api/artists");
                    if (artistRes.ok) {
                        const artists = await artistRes.json();
                        const artist = artists.find((a: { id: string }) => a.id === artistId);
                        if (artist) {
                            setArtistServiceIds(artist.serviceIds || []);
                        }
                    }
                }

                const res = await fetch("/api/services");
                if (res.ok) {
                    const data = await res.json();
                    setServices(data);
                }
            } catch (error) {
                console.error("Error fetching services:", error);
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

    const getIcon = (name: string) => iconMap[name] || NailPolishIcon;
    const canContinue = bookingData.serviceId !== null;

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>טוען שירותים...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>בחרי שירות</h2>
                <p className={styles.subtitle}>איזה טיפול את מעוניינת?</p>
            </div>

            <div className={styles.list}>
                {services
                    .filter(s => !artistServiceIds || artistServiceIds.includes(s.id))
                    .map((service) => {
                        const Icon = getIcon(service.name);
                        const isRecent = service.id === recentServiceId;

                        // Move recent service to top
                        const order = isRecent ? -1 : 0;

                        return (
                            <button
                                key={service.id}
                                className={`${styles.card} ${bookingData.serviceId === service.id ? styles.selected : ""
                                    }`}
                                onClick={() => handleSelect(service)}
                                style={{ order }}
                            >
                                <div className={styles.cardIcon}>
                                    <Icon size={22} color="var(--color-primary-dark)" />
                                </div>
                                <div className={styles.cardContent}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <h3 className={styles.cardTitle}>{service.name}</h3>
                                        {isRecent && (
                                            <span style={{
                                                fontSize: "0.7rem",
                                                background: "var(--color-accent)",
                                                color: "var(--color-primary-dark)",
                                                padding: "2px 6px",
                                                borderRadius: "4px",
                                                fontWeight: "bold"
                                            }}>
                                                הזמיני שוב
                                            </span>
                                        )}
                                    </div>
                                    <p className={styles.cardDescription}>{service.description}</p>
                                    <div className={styles.cardMeta}>
                                        <span className={styles.duration}>
                                            <ClockIcon size={12} />
                                            {service.duration} דק׳
                                        </span>
                                        <span className={styles.price}>₪{service.price}</span>
                                    </div>
                                </div>
                                <div className={styles.checkmark}>
                                    <CheckIcon size={18} />
                                </div>
                            </button>
                        );
                    })}
            </div>

            <div className={styles.footer}>
                <button
                    className="btn btn-primary"
                    onClick={onNext}
                    disabled={!canContinue}
                    style={{ width: "100%" }}
                >
                    המשך לבחירת תאריך
                </button>
            </div>
        </div>
    );
}
