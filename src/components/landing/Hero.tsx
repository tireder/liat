"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NailPolishIcon, CalendarIcon, BookIcon, StarIcon, HeartIcon, AwardIcon, ChevronDownIcon } from "@/components/icons";
import styles from "./Hero.module.css";

interface HeroSettings {
    businessName?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    aboutYears?: string;
    aboutClients?: string;
}

interface HeroProps {
    settings?: HeroSettings;
}

export default function Hero({ settings }: HeroProps) {
    const businessName = settings?.businessName || "ליאת";
    const heroTitle = settings?.heroTitle || "יופי בקצות האצבעות";
    const heroSubtitle = settings?.heroSubtitle || "טיפולי ציפורניים מקצועיים בסביבה אינטימית ומפנקת. כל ביקור הוא חוויה.";
    const years = settings?.aboutYears || "8";
    const clients = settings?.aboutClients || "500";

    // Check for logged-in user
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        async function validateSession() {
            try {
                const session = localStorage.getItem("liart_session");
                if (session) {
                    const parsed = JSON.parse(session);
                    const isValid = parsed.expiresAt
                        ? new Date(parsed.expiresAt) > new Date()
                        : parsed.expires > Date.now();

                    if (isValid) {
                        // 1. Set initial name from storage (if not numeric)
                        const storedName = parsed.name || "";
                        const isNumeric = /\d{3}/.test(storedName) && storedName.replace(/\D/g, "").length >= 9;

                        if (!isNumeric) {
                            setUserName(storedName);
                        }

                        // 2. Fetch real name from DB to ensure accuracy
                        try {
                            const res = await fetch(`/api/bookings/my?phone=${encodeURIComponent(parsed.phone)}`);
                            if (res.ok) {
                                const data = await res.json();
                                if (data.client && data.client.name) {
                                    // Use real name from DB
                                    const realName = data.client.name;
                                    setUserName(realName);

                                    // Update storage if different
                                    if (realName !== storedName) {
                                        const newSession = { ...parsed, name: realName };
                                        localStorage.setItem("liart_session", JSON.stringify(newSession));
                                    }
                                }
                            }
                        } catch (err) {
                            console.error("Error fetching client info:", err);
                        }
                    }
                }
            } catch {
                // Invalid session
            }
        }
        validateSession();
    }, []);

    return (
        <section className={styles.hero}>
            {/* Background */}
            <div className={styles.background}>
                <div className={styles.gradientOverlay} />
                <div className={styles.patternOverlay} />
            </div>

            {/* Content */}
            <div className={styles.content}>
                {/* Personalized Greeting */}
                {userName && (
                    <div className={styles.greeting}>
                        <span>היי {userName}! 👋</span>
                    </div>
                )}

                {/* Brand */}
                <div className={styles.brand}>
                    <div className={styles.logoIcon}>
                        <NailPolishIcon size={40} color="#c9a8a0" />
                    </div>
                    <h1 className={styles.logo}>{businessName}</h1>
                    <p className={styles.tagline}>nail artist</p>
                </div>

                {/* Main headline */}
                <div className={styles.headline}>
                    <h2 className={styles.title}>
                        {heroTitle}
                    </h2>
                    <p className={styles.subtitle}>
                        {heroSubtitle}
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className={styles.actions}>
                    <Link href="/book" className={`btn btn-primary ${styles.ctaPrimary}`}>
                        <CalendarIcon size={20} />
                        <span>קביעת תור</span>
                    </Link>
                    <Link href="/courses" className={`btn btn-ghost ${styles.ctaSecondary}`}>
                        <BookIcon size={20} />
                        <span>קורסים</span>
                    </Link>
                </div>

                {/* Trust indicators */}
                <div className={styles.trust}>
                    <div className={styles.trustItem}>
                        <StarIcon size={16} color="#c9a8a0" />
                        <span>5.0</span>
                    </div>
                    <div className={styles.trustDivider} />
                    <div className={styles.trustItem}>
                        <HeartIcon size={16} />
                        <span>+{clients} לקוחות</span>
                    </div>
                    <div className={styles.trustDivider} />
                    <div className={styles.trustItem}>
                        <AwardIcon size={16} />
                        <span>{years} שנות ניסיון</span>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <button
                className={styles.scrollIndicator}
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                aria-label="גללי למטה"
            >
                <ChevronDownIcon size={24} />
            </button>
        </section>
    );
}

