"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { BookingData } from "@/app/book/page";
import { CheckIcon } from "@/components/icons";
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
    const [name, setName] = useState(bookingData.name || "");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"phone" | "otp" | "name" | "verified">("phone");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [otpMethod, setOtpMethod] = useState<"supabase" | "sms4free">("sms4free");
    const [rememberMe, setRememberMe] = useState(false);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = supabaseUrl && supabaseAnonKey
        ? createBrowserClient(supabaseUrl, supabaseAnonKey)
        : null;

    // Existing session (30 or 365 days) skips verification
    useEffect(() => {
        let mounted = true;

        async function checkSession() {
            try {
                const savedSession = localStorage.getItem("liart_session");
                if (savedSession) {
                    const session = JSON.parse(savedSession);
                    const isValid = session.expiresAt
                        ? new Date(session.expiresAt) > new Date()
                        : session.expires > Date.now();

                    if (isValid) {
                        if (!mounted) return;
                        const savedName = session.name || session.phone;
                        setPhone(session.phone);

                        const isNameNumeric = /\d{3}/.test(savedName) && savedName.replace(/\D/g, "").length >= 9;
                        if (isNameNumeric) {
                            setName("");
                            setStep("name");
                        } else {
                            setName(savedName);
                            updateBookingData({ phone: session.phone, name: savedName });
                            setStep("verified");
                            setLoading(false);
                            setTimeout(() => {
                                if (mounted) onNext();
                            }, 800);
                            return;
                        }
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
    }, []);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    if (data.otp_method) setOtpMethod(data.otp_method);
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            }
        }
        fetchSettings();
    }, []);

    function formatPhoneE164(phoneNumber: string): string {
        const cleaned = phoneNumber.replace(/\D/g, "");
        if (cleaned.startsWith("0")) return "+972" + cleaned.slice(1);
        if (cleaned.startsWith("972")) return "+" + cleaned;
        return "+972" + cleaned;
    }

    async function sendOtp() {
        setError("");
        setLoading(true);
        try {
            if (otpMethod === "supabase" && supabase) {
                const { error: otpError } = await supabase.auth.signInWithOtp({ phone: formatPhoneE164(phone) });
                if (otpError) {
                    setError("שגיאה בשליחת הקוד. נסי שוב.");
                    console.error("OTP Error:", otpError);
                } else {
                    setStep("otp");
                }
            } else {
                const res = await fetch("/api/otp/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone }),
                });
                const data = await res.json();
                if (!res.ok) setError(data.error || "שגיאה בשליחת הקוד. נסי שוב.");
                else setStep("otp");
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
                const { error: verifyError } = await supabase.auth.verifyOtp({
                    phone: formatPhoneE164(phone),
                    token: otp,
                    type: "sms",
                });
                if (verifyError) {
                    setError("קוד שגוי. נסי שוב.");
                    console.error("Verify Error:", verifyError);
                } else {
                    setStep("name");
                }
            } else {
                const res = await fetch("/api/otp/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone, code: otp }),
                });
                const data = await res.json();
                if (!res.ok) setError(data.error || "קוד שגוי. נסי שוב.");
                else setStep("name");
            }
        } catch {
            setError("שגיאה באימות הקוד");
        }
        setLoading(false);
    }

    function saveNameAndContinue() {
        const trimmedName = name.trim() || phone;
        const days = rememberMe ? 365 : 30;
        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        localStorage.setItem("liart_session", JSON.stringify({ phone, name: trimmedName, expiresAt }));
        updateBookingData({ phone, name: trimmedName });
        setStep("verified");
        setTimeout(() => onNext(), 900);
    }

    const isValidPhone = phone.replace(/\D/g, "").length >= 9;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={`display ${styles.title}`}>
                    {step === "name" ? "נעים להכיר" : step === "verified" ? "מאומת" : "נתחיל מהטלפון"}
                </h2>
                <p className={styles.subtitle}>
                    {step === "phone" && "נשלח לך קוד ב-SMS כדי לאשר את ההזמנה. בלי סיסמאות."}
                    {step === "otp" && <>הקוד נשלח למספר <span className="tabular" dir="ltr">{phone}</span></>}
                    {step === "name" && "איך לקרוא לך? כך נדע לפנות אלייך בהודעות."}
                    {step === "verified" && "מספר הטלפון אומת בהצלחה"}
                </p>
            </div>

            {loading && step === "phone" && (
                <p className={styles.checking} role="status">בודקת אם כבר נפגשנו...</p>
            )}

            {!loading && step === "phone" && (
                <form
                    className={styles.form}
                    onSubmit={(e) => { e.preventDefault(); if (isValidPhone && !loading) sendOtp(); }}
                >
                    <div className="field">
                        <label htmlFor="phone" className="field-label">מספר טלפון נייד</label>
                        <input
                            id="phone"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="050-0000000"
                            dir="ltr"
                            className={`input ${styles.ltrInput}`}
                            aria-invalid={!!error}
                            aria-describedby={error ? "phone-error" : undefined}
                            autoFocus
                        />
                        {error && <p id="phone-error" className="field-error" role="alert">{error}</p>}
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={!isValidPhone || loading}>
                        {loading ? "שולחת..." : "שלחי לי קוד אימות"}
                    </button>
                </form>
            )}

            {step === "otp" && (
                <form
                    className={styles.form}
                    onSubmit={(e) => { e.preventDefault(); if (otp.length === 6 && !loading) verifyOtp(); }}
                >
                    <div className="field">
                        <label htmlFor="otp" className="field-label">קוד אימות</label>
                        <input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="••••••"
                            dir="ltr"
                            className={`input ${styles.otpInput}`}
                            maxLength={6}
                            aria-invalid={!!error}
                            aria-describedby={error ? "otp-error" : undefined}
                            autoFocus
                        />
                        {error && <p id="otp-error" className="field-error" role="alert">{error}</p>}
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={otp.length !== 6 || loading}>
                        {loading ? "מאמתת..." : "אימות והמשך"}
                    </button>
                    <button
                        type="button"
                        className={`btn btn-text ${styles.resend}`}
                        onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                    >
                        לא קיבלת? שלחי קוד חדש
                    </button>
                </form>
            )}

            {step === "name" && (
                <form
                    className={styles.form}
                    onSubmit={(e) => { e.preventDefault(); if (name.trim()) saveNameAndContinue(); }}
                >
                    <div className="field">
                        <label htmlFor="name" className="field-label">השם שלך</label>
                        <input
                            id="name"
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="שם מלא"
                            className="input"
                            autoFocus
                        />
                    </div>

                    <label className={styles.remember}>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className={styles.rememberInput}
                        />
                        <span className={styles.rememberBox} aria-hidden="true"><CheckIcon size={12} /></span>
                        <span>זכרי אותי במכשיר הזה</span>
                    </label>

                    <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={!name.trim()}>
                        המשך
                    </button>
                </form>
            )}

            {step === "verified" && (
                <div className={styles.verified} role="status">
                    <span className={styles.verifiedIcon}>
                        <CheckIcon size={28} />
                    </span>
                    <span>ממשיכים לבחירת הטיפול...</span>
                </div>
            )}
        </div>
    );
}
