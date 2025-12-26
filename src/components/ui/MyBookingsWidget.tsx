"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarIcon, ClockIcon, UserIcon } from "@/components/icons";
import styles from "./MyBookingsWidget.module.css";

interface Booking {
    id: string;
    date: string;
    start_time: string;
    service: { name: string } | null;
}

export default function MyBookingsWidget() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [nextBooking, setNextBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user has a session
        const session = localStorage.getItem("liart_session");
        if (!session) {
            setIsLoggedIn(false);
            setLoading(false);
            return;
        }

        try {
            const parsed = JSON.parse(session);
            // Check if session is still valid (7 days)
            if (parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
                setIsLoggedIn(true);
                // Fetch next booking
                fetchNextBooking(parsed.phone);
            } else {
                localStorage.removeItem("liart_session");
                setIsLoggedIn(false);
                setLoading(false);
            }
        } catch {
            setIsLoggedIn(false);
            setLoading(false);
        }
    }, []);

    async function fetchNextBooking(phone: string) {
        try {
            const res = await fetch(`/api/bookings/my?phone=${encodeURIComponent(phone)}`);
            if (res.ok) {
                const bookings = await res.json();
                // Find next upcoming booking
                const now = new Date();
                const upcoming = bookings
                    .filter((b: Booking & { status: string }) => {
                        const bookingDate = new Date(`${b.date}T${b.start_time}`);
                        return bookingDate > now && b.status === "confirmed";
                    })
                    .sort((a: Booking, b: Booking) => {
                        const dateA = new Date(`${a.date}T${a.start_time}`);
                        const dateB = new Date(`${b.date}T${b.start_time}`);
                        return dateA.getTime() - dateB.getTime();
                    })[0];

                setNextBooking(upcoming || null);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
        setLoading(false);
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("he-IL", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
    };

    // Don't show if not logged in or still loading
    if (loading || !isLoggedIn) {
        return null;
    }

    return (
        <div className={styles.widget}>
            <Link href="/my-bookings" className={styles.container}>
                <div className={styles.icon}>
                    <UserIcon size={20} />
                </div>
                <div className={styles.content}>
                    {nextBooking ? (
                        <>
                            <span className={styles.label}>התור הבא</span>
                            <span className={styles.booking}>
                                <CalendarIcon size={12} />
                                {formatDate(nextBooking.date)}
                                <ClockIcon size={12} />
                                {nextBooking.start_time.slice(0, 5)}
                            </span>
                        </>
                    ) : (
                        <span className={styles.label}>התורים שלי</span>
                    )}
                </div>
            </Link>
        </div>
    );
}
