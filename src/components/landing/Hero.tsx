"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarIcon, ArrowLeftIcon } from "@/components/icons";
import Stars from "@/components/ui/Stars";
import type { GalleryImage, SiteInfo } from "@/lib/landing";
import { reviewCountLabel } from "@/lib/landing";
import styles from "./Hero.module.css";

interface HeroProps {
    settings?: SiteInfo;
    images?: GalleryImage[];
    rating?: { average: number; count: number };
}

export default function Hero({ settings, images = [], rating }: HeroProps) {
    const businessName = settings?.businessName || "ליאת";
    const heroTitle = settings?.heroTitle || "יופי בקצות האצבעות";
    const heroSubtitle = settings?.heroSubtitle || "";

    const [userName, setUserName] = useState<string | null>(null);

    // Personalised greeting for returning clients (session lives in localStorage)
    useEffect(() => {
        async function validateSession() {
            try {
                const session = localStorage.getItem("liart_session");
                if (!session) return;
                const parsed = JSON.parse(session);
                const isValid = parsed.expiresAt
                    ? new Date(parsed.expiresAt) > new Date()
                    : parsed.expires > Date.now();
                if (!isValid) return;

                const storedName = parsed.name || "";
                const isNumeric = /\d{3}/.test(storedName) && storedName.replace(/\D/g, "").length >= 9;
                if (!isNumeric && storedName) setUserName(storedName);

                const res = await fetch(`/api/bookings/my?phone=${encodeURIComponent(parsed.phone)}`);
                if (res.ok) {
                    const data = await res.json();
                    const realName = data?.client?.name;
                    if (realName) {
                        setUserName(realName);
                        if (realName !== storedName) {
                            localStorage.setItem("liart_session", JSON.stringify({ ...parsed, name: realName }));
                        }
                    }
                }
            } catch {
                // Invalid or missing session — stay anonymous
            }
        }
        validateSession();
    }, []);

    const [main, ...rest] = images;
    const secondary = rest.slice(0, 2);
    const hasRating = rating && rating.count > 0 && rating.average > 0;
    const hasImages = !!main;

    return (
        <section className={`${styles.hero} ${hasImages ? "" : styles.typographic}`} aria-labelledby="hero-title">
            <div className={styles.glow} aria-hidden="true" />

            <div className={`container ${styles.inner}`}>
                <div className={styles.copy}>
                    {userName && (
                        <span className={`${styles.greeting} animate-fade-in`}>היי {userName}, טוב לראות אותך שוב</span>
                    )}

                    <span className={`eyebrow ${styles.eyebrow}`}>
                        {businessName} · nail artist
                    </span>

                    <h1 id="hero-title" className={`display ${styles.title}`}>
                        {heroTitle}
                    </h1>

                    {heroSubtitle && <p className={styles.subtitle}>{heroSubtitle}</p>}

                    <div className={styles.actions}>
                        <Link href="/book" className="btn btn-primary btn-lg">
                            <CalendarIcon size={18} />
                            <span>קביעת תור</span>
                        </Link>
                        <Link href="/gallery" className={`btn btn-text ${styles.secondary}`}>
                            <span>לצפייה בעבודות</span>
                            <ArrowLeftIcon size={16} />
                        </Link>
                    </div>

                    {hasRating && (
                        <div className={styles.ratingLine}>
                            <Stars value={rating.average} size={15} />
                            <span className="tabular">
                                {rating.average.toFixed(1)} · {reviewCountLabel(rating.count)} מלקוחות
                            </span>
                        </div>
                    )}
                </div>

                {hasImages && (
                <div className={styles.visual}>
                    {main ? (
                        <div className={`${styles.collage} ${secondary.length === 0 ? styles.single : ""}`}>
                            <figure className={`${styles.frame} ${styles.frameMain}`}>
                                <Image
                                    src={main.url}
                                    alt={main.alt || "עבודת ציפורניים מהסטודיו"}
                                    fill
                                    priority
                                    sizes="(max-width: 1023px) 92vw, 34vw"
                                    className={styles.image}
                                />
                            </figure>
                            {secondary.map((img, i) => (
                                <figure key={img.id} className={`${styles.frame} ${styles.frameSmall}`} style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
                                    <Image
                                        src={img.url}
                                        alt={img.alt || "עבודת ציפורניים מהסטודיו"}
                                        fill
                                        sizes="(max-width: 1023px) 45vw, 18vw"
                                        className={styles.image}
                                    />
                                </figure>
                            ))}
                        </div>
                    ) : null}
                </div>
                )}
            </div>
        </section>
    );
}
