"use client";

import { useEffect, useState } from "react";
import { NailPolishIcon, SparklesIcon, DiamondIcon, PaletteIcon, FootIcon, WrenchIcon, ClockIcon } from "@/components/icons";
import styles from "./Services.module.css";

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

export default function Services() {
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

    const getIcon = (name: string) => iconMap[name] || NailPolishIcon;

    if (loading) {
        return (
            <section className={styles.section} id="services">
                <div className={styles.container}>
                    <div className={styles.loading}>טוען שירותים...</div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.section} id="services">
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <span className={styles.badge}>
                        <NailPolishIcon size={14} />
                        טיפולים
                    </span>
                    <h2 className={styles.title}>השירותים שלי</h2>
                    <p className={styles.subtitle}>
                        מגוון טיפולים מקצועיים בסטנדרט הגבוה ביותר
                    </p>
                    <div className={styles.divider} />
                </header>

                {/* Services Grid */}
                <div className={styles.grid}>
                    {services.map((service, index) => {
                        const Icon = getIcon(service.name);
                        return (
                            <article
                                key={service.id}
                                className={styles.card}
                                style={{ animationDelay: `${index * 0.08}s` }}
                            >
                                <div className={styles.cardIcon}>
                                    <Icon size={24} color="var(--color-primary-dark)" />
                                </div>
                                <div className={styles.cardContent}>
                                    <h3 className={styles.cardTitle}>{service.name}</h3>
                                    <p className={styles.cardDescription}>{service.description}</p>
                                    <div className={styles.cardMeta}>
                                        <span className={styles.duration}>
                                            <ClockIcon size={14} />
                                            {service.duration} דקות
                                        </span>
                                        <span className={styles.price}>
                                            ₪{service.price}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* CTA */}
                <div className={styles.cta}>
                    <a href="/book" className="btn btn-primary">
                        לקביעת תור
                    </a>
                </div>
            </div>
        </section>
    );
}
