"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarIcon, UserIcon, XIcon } from "@/components/icons";
import styles from "./Header.module.css";

interface HeaderProps {
    businessName?: string;
}

const NAV_LINKS = [
    { label: "טיפולים", href: "/#services" },
    { label: "גלריה", href: "/#gallery" },
    { label: "קורסים", href: "/#courses" },
    { label: "אודות", href: "/#about" },
    { label: "ביקור בסלון", href: "/#contact" },
];

export default function Header({ businessName }: HeaderProps) {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const name = businessName || "ליאת";

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open]);

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
            <div className={`container ${styles.inner}`}>
                <Link href="/" className={styles.brand} aria-label={`${name} - דף הבית`}>
                    <span className={`display ${styles.brandName}`}>{name}</span>
                    <span className={styles.brandSub}>nail artist</span>
                </Link>

                <nav className={styles.nav} aria-label="ניווט ראשי">
                    {NAV_LINKS.map((link) => (
                        <a key={link.href} href={link.href} className={styles.navLink}>
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className={styles.actions}>
                    <Link href="/my-bookings" className={styles.iconLink} aria-label="התורים שלי">
                        <UserIcon size={20} />
                        <span className={styles.iconLinkLabel}>התורים שלי</span>
                    </Link>
                    <Link href="/book" className={`btn btn-primary ${styles.cta}`}>
                        <CalendarIcon size={18} />
                        <span>קביעת תור</span>
                    </Link>
                    <button
                        type="button"
                        className={styles.menuBtn}
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                        aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
                    >
                        {open ? (
                            <XIcon size={22} />
                        ) : (
                            <span className={styles.burger} aria-hidden="true">
                                <span />
                                <span />
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div
                id="mobile-menu"
                className={`${styles.sheet} ${open ? styles.sheetOpen : ""}`}
                aria-hidden={!open}
            >
                <nav className={styles.sheetNav} aria-label="תפריט נייד">
                    {NAV_LINKS.map((link, i) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className={`display ${styles.sheetLink}`}
                            style={{ transitionDelay: open ? `${60 + i * 40}ms` : "0ms" }}
                            onClick={() => setOpen(false)}
                            tabIndex={open ? 0 : -1}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>
                <div className={styles.sheetFooter}>
                    <Link href="/book" className="btn btn-primary btn-lg btn-block" tabIndex={open ? 0 : -1}>
                        <CalendarIcon size={18} />
                        קביעת תור
                    </Link>
                    <Link href="/my-bookings" className="btn btn-secondary btn-block" tabIndex={open ? 0 : -1}>
                        התורים שלי
                    </Link>
                </div>
            </div>
        </header>
    );
}
