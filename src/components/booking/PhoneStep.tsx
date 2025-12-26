"use client";

import { useState } from "react";
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabase = supabaseUrl && supabaseAnonKey
        ? createBrowserClient(supabaseUrl, supabaseAnonKey)
        : null;

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
        if (!supabase) {
            setError("שגיאה בהתחברות");
            return;
        }
        setError("");
        setLoading(true);

        try {
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
        } catch {
            setError("שגיאה בשליחת הקוד");
        }

        setLoading(false);
    }

    async function verifyOtp() {
        if (!supabase) {
            setError("שגיאה בהתחברות");
            return;
        }
        setError("");
        setLoading(true);

        try {
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
                updateBookingData({ phone, name: phone });
                setStep("verified");
                // Wait a moment then proceed
                setTimeout(() => {
                    onNext();
                }, 1000);
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

            {step === "phone" && (
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
