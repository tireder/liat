"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CalendarIcon, ClockIcon, XIcon, EditIcon, CheckIcon, PhoneIcon } from "@/components/icons";
import styles from "./page.module.css";

interface Booking {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    notes: string | null;
    service: {
        name: string;
        price: number;
        duration: number;
    };
}

interface ClientInfo {
    name: string;
    phone: string;
}

export default function MyBookingsPage() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [name, setName] = useState("");
    const [step, setStep] = useState<"phone" | "otp" | "name" | "bookings">("phone");
    const [loading, setLoading] = useState(true); // Start as loading to check session
    const [error, setError] = useState("");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
    const [cancelHoursBefore, setCancelHoursBefore] = useState(24);

    // Check for existing session on mount
    useEffect(() => {
        async function checkSession() {
            try {
                const savedSession = localStorage.getItem("liart_session");
                if (savedSession) {
                    const session = JSON.parse(savedSession);
                    // Check if session is still valid (7 days)
                    if (session.expires > Date.now()) {
                        const clientRes = await fetch(`/api/bookings/my?phone=${encodeURIComponent(session.phone)}`);
                        if (clientRes.ok) {
                            const clientData = await clientRes.json();
                            if (clientData.client) {
                                setPhone(session.phone);
                                setClientInfo(clientData.client);
                                setBookings(clientData.bookings || []);
                                setStep("bookings");
                                setLoading(false);
                                return;
                            }
                        }
                    } else {
                        // Session expired, clear it
                        localStorage.removeItem("liart_session");
                    }
                }
            } catch {
                // Session invalid, continue to login
                localStorage.removeItem("liart_session");
            }
            setLoading(false);
        }
        checkSession();
    }, []);

    // Fetch settings
    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    if (data.cancel_hours_before) {
                        setCancelHoursBefore(parseInt(data.cancel_hours_before));
                    }
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            }
        }
        fetchSettings();
    }, []);

    async function sendOtp() {
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "שגיאה בשליחת הקוד");
            } else {
                setStep("otp");
            }
        } catch {
            setError("שגיאה בשליחת הקוד");
        }

        setLoading(false);
    }

    async function verifyOtp() {
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, code: otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "קוד שגוי");
            } else {
                // Save session to localStorage (7 days)
                const session = {
                    phone,
                    expires: Date.now() + (7 * 24 * 60 * 60 * 1000),
                };
                localStorage.setItem("liart_session", JSON.stringify(session));

                // Check if client exists and has a name
                const clientRes = await fetch(`/api/bookings/my?phone=${encodeURIComponent(phone)}`);
                const clientData = await clientRes.json();

                if (clientData.client && clientData.client.name && clientData.client.name !== clientData.client.phone) {
                    // Existing client with name
                    setClientInfo(clientData.client);
                    setBookings(clientData.bookings || []);
                    setStep("bookings");
                } else if (clientData.client) {
                    // Client exists but no name - ask for name
                    setClientInfo(clientData.client);
                    setBookings(clientData.bookings || []);
                    setStep("name");
                } else {
                    // New client - ask for name
                    setStep("name");
                }
            }
        } catch {
            setError("שגיאה באימות הקוד");
        }

        setLoading(false);
    }

    async function saveName() {
        if (!name.trim()) {
            setError("נא להזין שם");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/bookings/my", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, name }),
            });

            if (res.ok) {
                setClientInfo({ name, phone });
                setStep("bookings");
            } else {
                setError("שגיאה בשמירת השם");
            }
        } catch {
            setError("שגיאה בשמירת השם");
        }

        setLoading(false);
    }

    async function cancelBooking(bookingId: string) {
        if (!confirm("האם את בטוחה שברצונך לבטל את התור?")) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/bookings/${bookingId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });

            if (res.ok) {
                setBookings(prev => prev.filter(b => b.id !== bookingId));
            } else {
                const data = await res.json();
                alert(data.error || "שגיאה בביטול התור");
            }
        } catch {
            alert("שגיאה בביטול התור");
        }
        setLoading(false);
    }

    function canCancel(booking: Booking): boolean {
        const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`);
        const now = new Date();
        const hoursUntil = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntil >= cancelHoursBefore;
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString("he-IL", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
    }

    const upcomingBookings = bookings.filter(b => {
        const bookingDate = new Date(`${b.date}T${b.start_time}`);
        // Show confirmed, pending, or pending_change bookings that are in the future
        return bookingDate > new Date() && ["confirmed", "pending", "pending_change"].includes(b.status);
    });

    const pastBookings = bookings.filter(b => {
        const bookingDate = new Date(`${b.date}T${b.start_time}`);
        // Past bookings OR cancelled/completed/no_show
        return bookingDate <= new Date() || ["cancelled", "completed", "no_show"].includes(b.status);
    });

    const isValidPhone = phone.replace(/\D/g, "").length >= 9;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/" className={styles.backBtn}>
                    <ArrowLeftIcon size={20} />
                </Link>
                <h1 className={styles.headerTitle}>התורים שלי</h1>
                <div style={{ width: 44 }} />
            </header>

            <main className={styles.content}>
                {loading && step === "phone" && (
                    <div className={styles.authCard}>
                        <p>בודק הרשאות...</p>
                    </div>
                )}

                {!loading && step === "phone" && (
                    <div className={styles.authCard}>
                        <div className={styles.authIcon}>
                            <PhoneIcon size={32} color="var(--color-primary)" />
                        </div>
                        <h2>כניסה עם מספר טלפון</h2>
                        <p>הזיני את מספר הטלפון איתו קבעת תורים</p>

                        <div className={styles.field}>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="050-1234567"
                                dir="ltr"
                                className={styles.input}
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <button
                            className="btn btn-primary"
                            onClick={sendOtp}
                            disabled={!isValidPhone || loading}
                            style={{ width: "100%" }}
                        >
                            {loading ? "שולח..." : "שלחי קוד"}
                        </button>
                    </div>
                )}

                {step === "otp" && (
                    <div className={styles.authCard}>
                        <h2>קוד אימות</h2>
                        <p>הקוד נשלח ל-{phone}</p>

                        <div className={styles.field}>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="123456"
                                dir="ltr"
                                className={styles.input}
                                maxLength={6}
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <button
                            className="btn btn-primary"
                            onClick={verifyOtp}
                            disabled={otp.length !== 6 || loading}
                            style={{ width: "100%" }}
                        >
                            {loading ? "מאמת..." : "אמתי"}
                        </button>

                        <button
                            className={styles.resendBtn}
                            onClick={() => {
                                setStep("phone");
                                setOtp("");
                                setError("");
                            }}
                        >
                            שלחי קוד חדש
                        </button>
                    </div>
                )}

                {step === "name" && (
                    <div className={styles.authCard}>
                        <h2>מה השם שלך?</h2>
                        <p>כדי שנוכל לזהות אותך בתורים הבאים</p>

                        <div className={styles.field}>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="השם שלך"
                                className={styles.input}
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <button
                            className="btn btn-primary"
                            onClick={saveName}
                            disabled={!name.trim() || loading}
                            style={{ width: "100%" }}
                        >
                            {loading ? "שומר..." : "המשך"}
                        </button>
                    </div>
                )}

                {step === "bookings" && (
                    <>
                        <div className={styles.welcome}>
                            שלום, <strong>{clientInfo?.name}</strong> 👋
                        </div>

                        {upcomingBookings.length > 0 ? (
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>תורים קרובים</h2>
                                <div className={styles.bookingsList}>
                                    {upcomingBookings.map((booking) => (
                                        <div key={booking.id} className={styles.bookingCard}>
                                            <div className={styles.bookingInfo}>
                                                <div className={styles.serviceName}>{booking.service.name}</div>
                                                <div className={styles.bookingMeta}>
                                                    <span>
                                                        <CalendarIcon size={14} />
                                                        {formatDate(booking.date)}
                                                    </span>
                                                    <span>
                                                        <ClockIcon size={14} />
                                                        {booking.start_time}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={styles.bookingActions}>
                                                {canCancel(booking) ? (
                                                    <button
                                                        className={styles.cancelBtn}
                                                        onClick={() => cancelBooking(booking.id)}
                                                        disabled={loading}
                                                    >
                                                        <XIcon size={16} />
                                                        ביטול
                                                    </button>
                                                ) : (
                                                    <span className={styles.cantCancel}>
                                                        לא ניתן לבטל (פחות מ-{cancelHoursBefore} שעות)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : (
                            <div className={styles.empty}>
                                <p>אין לך תורים קרובים</p>
                                <Link href="/book" className="btn btn-primary">
                                    קביעת תור חדש
                                </Link>
                            </div>
                        )}

                        {pastBookings.length > 0 && (
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>היסטוריה</h2>
                                <div className={styles.bookingsList}>
                                    {pastBookings.slice(0, 5).map((booking) => (
                                        <div key={booking.id} className={`${styles.bookingCard} ${styles.pastBooking}`}>
                                            <div className={styles.bookingInfo}>
                                                <div className={styles.serviceName}>{booking.service.name}</div>
                                                <div className={styles.bookingMeta}>
                                                    <span>{formatDate(booking.date)}</span>
                                                    <span>{booking.start_time}</span>
                                                </div>
                                            </div>
                                            <span className={styles.status}>
                                                {booking.status === "cancelled" && "בוטל"}
                                                {booking.status === "completed" && "הושלם"}
                                                {booking.status === "no_show" && "לא הגיעה"}
                                                {booking.status === "confirmed" && new Date(`${booking.date}T${booking.start_time}`) <= new Date() && "הושלם"}
                                                {booking.status === "confirmed" && new Date(`${booking.date}T${booking.start_time}`) > new Date() && "מאושר"}
                                                {booking.status === "pending" && "ממתין לאישור"}
                                                {booking.status === "pending_change" && "ממתין לשינוי"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <div className={styles.actions}>
                            <Link href="/book" className="btn btn-primary">
                                קביעת תור חדש
                            </Link>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
