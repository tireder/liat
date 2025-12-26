"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { BookingData } from "@/app/book/page";
import { PhoneIcon, CheckIcon } from "@/components/icons";
import styles from "./PhoneStep.module.css";

interface PhoneStepProps {
    bookingData: BookingData;
    updateBookingData: (data: Partial<BookingData>) => void;
    onNext: () => void;
}

export default function PhoneStep({
    bookingData,
    updateBookingData,
    onNext,
}: PhoneStepProps) {
    const [phone, setPhone] = useState(bookingData.phone || "");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"phone" | "otp" | "verified">("phone");
    const [loading, setLoading] = useState(true); // Start loading to check session
    const [error, setError] = useState("");
    const [otpMethod, setOtpMethod] = useState<"supabase" | "sms4free">("sms4free");

    // Supabase client for supabase auth method
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = supabaseUrl && supabaseAnonKey
        ? createBrowserClient(supabaseUrl, supabaseAnonKey)
        : null;

    // Check for existing session on mount
    useEffect(() => {
        let mounted = true;

        async function checkSession() {
            try {
                const savedSession = localStorage.getItem("liart_session");
                if (savedSession) {
                    const session = JSON.parse(savedSession);
                    // Check if session is still valid (7 days)
                    if (session.expires > Date.now()) {
                        if (!mounted) return;
                        setPhone(session.phone);
                        updateBookingData({ phone: session.phone, name: session.phone });
                        setStep("verified");
                        setLoading(false);
                        // Give parent component time to update before moving to next step
                        setTimeout(() => {
                            if (mounted) onNext();
                        }, 800);
                        return;
                    } else {
                        localStorage.removeItem("liart_session");
                    }
                }
            } catch {
                localStorage.removeItem("liart_session");
            }
            if (mounted) setLoading(false);
        }
        checkSession();

        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    // Fetch OTP method from settings
    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    if (data.otp_method) {
                        setOtpMethod(data.otp_method);
                    }
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            }
        }
        fetchSettings();
    }, []);

    // Format phone for E.164 (Israeli format)
    function formatPhoneE164(phoneNumber: string): string {
        const cleaned = phoneNumber.replace(/\D/g, "");
        if (cleaned.startsWith("0")) {
            return "+972" + cleaned.slice(1);
        }
        if (cleaned.startsWith("972")) {
            return "+" + cleaned;
        }
        return "+972" + cleaned;
    }

    async function sendOtp() {
        setError("");
        setLoading(true);

        try {
            if (otpMethod === "supabase" && supabase) {
                // Use Supabase Auth
                const formattedPhone = formatPhoneE164(phone);
                const { error: otpError } = await supabase.auth.signInWithOtp({
                    phone: formattedPhone,
                });

                if (otpError) {
                    setError("שגיאה בשליחת הקוד. נסי שוב.");
                    console.error("OTP Error:", otpError);
                } else {
                    setStep("otp");
                }
            } else {
                // Use SMS4Free custom API
                const res = await fetch("/api/otp/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "שגיאה בשליחת הקוד. נסי שוב.");
                } else {
                    setStep("otp");
                }
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
            if (otpMethod === "supabase" && supabase) {
                // Use Supabase Auth
                const formattedPhone = formatPhoneE164(phone);
                const { error: verifyError } = await supabase.auth.verifyOtp({
                    phone: formattedPhone,
                    token: otp,
                    type: "sms",
                });

                if (verifyError) {
                    setError("קוד שגוי. נסי שוב.");
                    console.error("Verify Error:", verifyError);
                } else {
                    // Save session to localStorage (7 days)
                    const session = { phone, expires: Date.now() + (7 * 24 * 60 * 60 * 1000) };
                    localStorage.setItem("liart_session", JSON.stringify(session));

                    updateBookingData({ phone, name: phone });
                    setStep("verified");
                    setTimeout(() => {
                        onNext();
                    }, 1000);
                }
            } else {
                // Use SMS4Free custom API
                const res = await fetch("/api/otp/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone, code: otp }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "קוד שגוי. נסי שוב.");
                } else {
                    // Save session to localStorage (7 days)
                    const session = { phone, expires: Date.now() + (7 * 24 * 60 * 60 * 1000) };
                    localStorage.setItem("liart_session", JSON.stringify(session));

                    updateBookingData({ phone, name: phone });
                    setStep("verified");
                    setTimeout(() => {
                        onNext();
                    }, 1000);
                }
            }
        } catch {
            setError("שגיאה באימות הקוד");
        }

        setLoading(false);
    }

    const isValidPhone = phone.replace(/\D/g, "").length >= 9;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.iconWrapper}>
                    <PhoneIcon size={32} color="var(--color-primary)" />
                </div>
                <h2 className={styles.title}>אימות מספר טלפון</h2>
                <p className={styles.subtitle}>
                    נשלח אליך קוד SMS לאימות הזמנתך
                </p>
            </div>

            {loading && step === "phone" && (
                <div className={styles.form}>
                    <p style={{ textAlign: "center", color: "var(--foreground-muted)" }}>בודק הרשאות...</p>
                </div>
            )}

            {!loading && step === "phone" && (
                <div className={styles.form}>
                    <div className={styles.field}>
                        <label>מספר טלפון</label>
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
                        {loading ? "שולח..." : "שלחי קוד אימות"}
                    </button>
                </div>
            )}

            {step === "otp" && (
                <div className={styles.form}>
                    <div className={styles.field}>
                        <label>קוד אימות</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="123456"
                            dir="ltr"
                            className={`${styles.input} ${styles.otpInput}`}
                            maxLength={6}
                        />
                        <span className={styles.hint}>
                            הקוד נשלח ל-{phone}
                        </span>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button
                        className="btn btn-primary"
                        onClick={verifyOtp}
                        disabled={otp.length !== 6 || loading}
                        style={{ width: "100%" }}
                    >
                        {loading ? "מאמת..." : "אמתי קוד"}
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

            {step === "verified" && (
                <div className={styles.verified}>
                    <div className={styles.verifiedIcon}>
                        <CheckIcon size={32} color="white" />
                    </div>
                    <span>מספר הטלפון אומת בהצלחה!</span>
                </div>
            )}
        </div>
    );
}
