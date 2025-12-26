"use client";

import Link from "next/link";
import { NailPolishIcon, CalendarIcon, BookIcon, StarIcon, HeartIcon, AwardIcon, ChevronDownIcon } from "@/components/icons";
import styles from "./Hero.module.css";

export default function Hero() {
    return (
        <section className={styles.hero}>
            {/* Background */}
            <div className={styles.background}>
                <div className={styles.gradientOverlay} />
                <div className={styles.patternOverlay} />
            </div>

            {/* Content */}
            <div className={styles.content}>
                {/* Brand */}
                <div className={styles.brand}>
                    <div className={styles.logoIcon}>
                        <NailPolishIcon size={40} color="#c9a8a0" />
                    </div>
                    <h1 className={styles.logo}>ליאת</h1>
                    <p className={styles.tagline}>nail artist</p>
                </div>

                {/* Main headline */}
                <div className={styles.headline}>
                    <h2 className={styles.title}>
                        יופי בקצות האצבעות
                    </h2>
                    <p className={styles.subtitle}>
                        טיפולי ציפורניים מקצועיים בסביבה אינטימית ומפנקת.
                        <br />
                        כל ביקור הוא חוויה.
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
                        <span>+500 לקוחות</span>
                    </div>
                    <div className={styles.trustDivider} />
                    <div className={styles.trustItem}>
                        <AwardIcon size={16} />
                        <span>8 שנות ניסיון</span>
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
