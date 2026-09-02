"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClockIcon, ArrowLeftIcon } from "@/components/icons";
import SectionHeader from "./SectionHeader";
import Reveal from "@/components/ui/Reveal";
import type { ServiceItem } from "@/lib/landing";
import { formatPrice } from "@/lib/landing";
import styles from "./Services.module.css";

interface ServicesProps {
    initialServices?: ServiceItem[];
}

const SWATCHES = ["var(--rose)", "var(--nude)", "var(--peach)", "var(--rose-soft)", "var(--beige)", "var(--rose-deep)"];

export default function Services({ initialServices }: ServicesProps) {
    const [services, setServices] = useState<ServiceItem[]>(initialServices || []);
    const [loading, setLoading] = useState(!initialServices);

    useEffect(() => {
        if (initialServices) return;
        async function fetchServices() {
            try {
                const res = await fetch("/api/services");
                if (res.ok) setServices(await res.json());
            } catch (error) {
                console.error("Error fetching services:", error);
            }
            setLoading(false);
        }
        fetchServices();
    }, [initialServices]);

    if (!loading && services.length === 0) return null;

    return (
        <section className={`section ${styles.section}`} id="services" aria-labelledby="services-title">
            <div className="container">
                <Reveal>
                    <SectionHeader
                        id="services-title"
                        eyebrow="טיפולים"
                        title="הטיפולים שלי"
                        subtitle="כל טיפול מתחיל בייעוץ קצר ומותאם אלייך. בחרי מה מתאים לך ונקבע תור."
                        action={
                            <Link href="/book" className="btn btn-secondary">
                                לכל הטיפולים והזמנה
                                <ArrowLeftIcon size={16} />
                            </Link>
                        }
                    />
                </Reveal>

                {loading ? (
                    <div className={styles.grid} aria-busy="true">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className={`${styles.card} ${styles.skeleton}`} />
                        ))}
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {services.map((service, index) => (
                            <Reveal key={service.id} as="article" className={styles.card} delay={Math.min(index, 5) * 60}>
                                <div className={styles.cardTop}>
                                    <span className={`display tabular ${styles.index}`}>
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span
                                        className={styles.swatch}
                                        style={{ background: SWATCHES[index % SWATCHES.length] }}
                                        aria-hidden="true"
                                    />
                                </div>

                                <h3 className={`display ${styles.name}`}>{service.name}</h3>
                                {service.description && (
                                    <p className={styles.description}>{service.description}</p>
                                )}

                                <div className={styles.meta}>
                                    <span className={styles.duration}>
                                        <ClockIcon size={14} />
                                        <span className="tabular">{service.duration} דק׳</span>
                                    </span>
                                    <span className={`display tabular ${styles.price}`}>{formatPrice(service.price)}</span>
                                </div>

                                <Link
                                    href={`/book?service=${service.id}`}
                                    className={styles.cta}
                                    aria-label={`קביעת תור ל${service.name}`}
                                >
                                    <span>קביעת תור</span>
                                    <ArrowLeftIcon size={16} />
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
