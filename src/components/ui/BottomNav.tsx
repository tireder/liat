"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./BottomNav.module.css";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

// Icons as inline SVGs for simplicity
function HomeIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    );
}

function CalendarPlusIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <line x1="12" y1="14" x2="12" y2="18" />
            <line x1="10" y1="16" x2="14" y2="16" />
        </svg>
    );
}

function BookOpenIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    );
}

function ImageIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function CalendarCheckIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="M9 16l2 2 4-4" />
        </svg>
    );
}

export default function BottomNav() {
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Check login status
    useEffect(() => {
        const checkSession = () => {
            try {
                const savedSession = localStorage.getItem("liart_session");
                if (savedSession) {
                    const session = JSON.parse(savedSession);
                    const isValid = session.expiresAt
                        ? new Date(session.expiresAt) > new Date()
                        : session.expires > Date.now();
                    setIsLoggedIn(isValid);
                } else {
                    setIsLoggedIn(false);
                }
            } catch {
                setIsLoggedIn(false);
            }
        };

        checkSession();
        // Listen for storage changes (login/logout from other tabs)
        window.addEventListener("storage", checkSession);
        // Also check periodically in case of same-tab changes
        const interval = setInterval(checkSession, 1000);

        return () => {
            window.removeEventListener("storage", checkSession);
            clearInterval(interval);
        };
    }, []);

    // Hide on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    // Hide on admin pages
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    const navItems: NavItem[] = [
        {
            label: "בית",
            href: "/",
            icon: <HomeIcon />,
        },
        {
            label: "קביעת תור",
            href: "/book",
            icon: <CalendarPlusIcon />,
        },
        {
            label: "קורסים",
            href: "/courses",
            icon: <BookOpenIcon />,
        },
        {
            label: "גלריה",
            href: "/gallery",
            icon: <ImageIcon />,
        },
        {
            label: isLoggedIn ? "התורים שלי" : "כניסה",
            href: "/my-bookings",
            icon: isLoggedIn ? <CalendarCheckIcon /> : <UserIcon />,
        },
    ];

    const isActive = (href: string) => {
        if (href === "/") {
            return pathname === "/";
        }
        return pathname?.startsWith(href);
    };

    return (
        <nav className={`${styles.bottomNav} ${!isVisible ? styles.hidden : ""}`}>
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navItem} ${isActive(item.href) ? styles.active : ""}`}
                >
                    <span className={styles.icon}>{item.icon}</span>
                    <span className={styles.label}>{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}
