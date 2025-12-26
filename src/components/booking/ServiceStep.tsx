"use client";

import { useEffect, useState } from "react";
import { BookingData } from "@/app/book/page";
import { NailPolishIcon, SparklesIcon, DiamondIcon, PaletteIcon, FootIcon, WrenchIcon, ClockIcon, CheckIcon } from "@/components/icons";
import styles from "./ServiceStep.module.css";

interface ServiceStepProps {
    bookingData: BookingData;
    updateBookingData: (data: Partial<BookingData>) => void;
    onNext: () => void;
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
}: ServiceStepProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchServices() {
            try {
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
    }, []);

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
                {services.map((service) => {
                    const Icon = getIcon(service.name);
                    return (
                        <button
                            key={service.id}
                            className={`${styles.card} ${bookingData.serviceId === service.id ? styles.selected : ""
                                }`}
                            onClick={() => handleSelect(service)}
                        >
                            <div className={styles.cardIcon}>
                                <Icon size={22} color="var(--color-primary-dark)" />
                            </div>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{service.name}</h3>
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
