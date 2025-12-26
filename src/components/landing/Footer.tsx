"use client";

import Link from "next/link";
import { NailPolishIcon, CalendarIcon, HeartIcon } from "@/components/icons";
import styles from "./Footer.module.css";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Main Footer */}
                <div className={styles.main}>
                    {/* Brand */}
                    <div className={styles.brand}>
                        <div className={styles.logo}>
                            <NailPolishIcon size={20} color="var(--color-primary)" />
                            <span>ליאת</span>
                        </div>
                        <p className={styles.tagline}>nail artist</p>
                    </div>

                    {/* Quick Links */}
                    <nav className={styles.nav}>
                        <h4 className={styles.navTitle}>ניווט</h4>
                        <ul className={styles.navList}>
                            <li><Link href="/book">קביעת תור</Link></li>
                            <li><Link href="/courses">קורסים</Link></li>
                            <li><Link href="/gallery">גלריה</Link></li>
                            <li><Link href="#about">אודות</Link></li>
                            <li><Link href="#contact">צרי קשר</Link></li>
                        </ul>
                    </nav>

                    {/* Policies */}
                    <nav className={styles.nav}>
                        <h4 className={styles.navTitle}>מידע</h4>
                        <ul className={styles.navList}>
                            <li><Link href="/terms">תקנון</Link></li>
                            <li><Link href="/privacy">פרטיות</Link></li>
                            <li><Link href="/cancellation">ביטולים</Link></li>
                            <li><Link href="/accessibility">נגישות</Link></li>
                        </ul>
                    </nav>

                    {/* CTA */}
                    <div className={styles.cta}>
                        <h4 className={styles.ctaTitle}>מוכנה להתחיל?</h4>
                        <Link href="/book" className={`btn btn-primary ${styles.ctaBtn}`}>
                            <CalendarIcon size={18} />
                            קביעת תור
                        </Link>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {currentYear} ליאת nail artist. כל הזכויות שמורות.
                    </p>
                    <p className={styles.credit}>
                        <HeartIcon size={14} />
                    </p>
                </div>
            </div>
        </footer>
    );
}
