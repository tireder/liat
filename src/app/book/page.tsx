"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeftIcon, XIcon } from "@/components/icons";
import StepIndicator from "@/components/booking/StepIndicator";
import PhoneStep from "@/components/booking/PhoneStep";
import ArtistStep from "@/components/booking/ArtistStep";
import ServiceStep from "@/components/booking/ServiceStep";
import DateTimeStep from "@/components/booking/DateTimeStep";
import NotesStep from "@/components/booking/NotesStep";
import ConfirmStep from "@/components/booking/ConfirmStep";
import SuccessStep from "@/components/booking/SuccessStep";
import { useToast } from "@/components/ui/Toast";
import styles from "./page.module.css";

export interface BookingData {
    phone: string;
    name: string;
    artistId: string | null;
    artistName: string;
    serviceId: string | null;
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
    date: string | null;
    time: string | null;
    notes: string;
    rescheduleId?: string;
}

interface SiteSettings {
    address: string;
    businessName: string;
}

const initialBookingData: BookingData = {
    phone: "",
    name: "",
    artistId: null,
    artistName: "",
    serviceId: null,
    serviceName: "",
    servicePrice: 0,
    serviceDuration: 0,
    date: null,
    time: null,
    notes: "",
};

const STEPS = ["טלפון", "אמנית", "טיפול", "תאריך ושעה", "הערות", "אישור"];

function BookingContent() {
    const searchParams = useSearchParams();
    const rescheduleId = searchParams.get("reschedule");
    const preselectServiceId = searchParams.get("service");
    const { showToast } = useToast();

    const [currentStep, setCurrentStep] = useState(0);
    const [bookingData, setBookingData] = useState<BookingData>(() => ({
        ...initialBookingData,
        rescheduleId: rescheduleId || undefined,
    }));
    const [isComplete, setIsComplete] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loadingReschedule, setLoadingReschedule] = useState(false);

    // Returning clients skip phone verification
    useEffect(() => {
        function restoreSession() {
            const savedSession = localStorage.getItem("liart_session");
            if (!savedSession) return;
            try {
                const session = JSON.parse(savedSession);
                const isValid = session.expiresAt
                    ? new Date(session.expiresAt) > new Date()
                    : session.expires > Date.now();

                if (isValid && !rescheduleId) {
                    setBookingData(prev => ({
                        ...prev,
                        phone: session.phone,
                        name: session.name
                    }));
                    setCurrentStep(1);
                }
            } catch (e) {
                console.error("Invalid session", e);
            }
        }
        restoreSession();
    }, [rescheduleId]);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    setSettings({
                        address: data.address || "",
                        businessName: data.business_name || "ליאת",
                    });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        }
        fetchSettings();
    }, []);

    // Scroll to top whenever the step changes (mobile-friendly)
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentStep]);

    const updateBookingData = (data: Partial<BookingData>) => {
        setBookingData((prev) => ({ ...prev, ...data }));
    };

    const nextStep = async () => {
        if (currentStep === 0 && bookingData.rescheduleId) {
            setLoadingReschedule(true);
            try {
                const res = await fetch(`/api/bookings/${bookingData.rescheduleId}?phone=${bookingData.phone}`);
                if (res.ok) {
                    const booking = await res.json();
                    setBookingData(prev => ({
                        ...prev,
                        serviceId: booking.service.id,
                        serviceName: booking.service.name,
                        servicePrice: booking.service.price,
                        serviceDuration: booking.service.duration,
                        name: booking.client.name || prev.name,
                        artistId: booking.artist_id || prev.artistId,
                    }));
                    setCurrentStep(3);
                    setLoadingReschedule(false);
                    return;
                } else {
                    showToast("לא הצלחנו לטעון את פרטי התור. נמשיך כהזמנה חדשה.", "warning");
                }
            } catch (err) {
                console.error("Error fetching booking:", err);
            }
            setLoadingReschedule(false);
        }

        if (currentStep < STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            if (currentStep === 3 && bookingData.rescheduleId) {
                setCurrentStep(0);
                return;
            }
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleConfirm = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const isReschedule = !!bookingData.rescheduleId;
            const endpoint = isReschedule
                ? `/api/bookings/${bookingData.rescheduleId}`
                : "/api/bookings";
            const method = isReschedule ? "PATCH" : "POST";

            const bodyData: Record<string, unknown> = {
                serviceId: bookingData.serviceId,
                date: bookingData.date,
                startTime: bookingData.time,
                phone: bookingData.phone,
                notes: bookingData.notes,
                artistId: bookingData.artistId,
            };

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });

            if (res.ok) {
                const data = await res.json().catch(() => null);
                if (isReschedule && data?.pending) {
                    showToast("בקשת השינוי נשלחה וממתינה לאישור", "info", 5000);
                }
                setIsComplete(true);
            } else {
                const errData = await res.json().catch(() => null);
                showToast(errData?.error || "שגיאה בעדכון התור. נסי שוב.", "error", 5000);
            }
        } catch (error) {
            console.error("Booking error:", error);
            showToast("שגיאה בעדכון התור. בדקי את החיבור ונסי שוב.", "error", 5000);
        }
        setSubmitting(false);
    };

    if (isComplete) {
        return (
            <div className={styles.page}>
                <SuccessStep
                    bookingData={bookingData}
                    address={settings?.address}
                    businessName={settings?.businessName}
                    isReschedule={!!bookingData.rescheduleId}
                />
            </div>
        );
    }

    if (loadingReschedule) {
        return (
            <div className={styles.page}>
                <div className={styles.loading} role="status">טוענת את פרטי התור...</div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={currentStep > 0 ? prevStep : undefined}
                        disabled={currentStep === 0}
                        aria-label="חזרה לשלב הקודם"
                    >
                        <ArrowLeftIcon size={20} style={{ transform: "scaleX(-1)" }} />
                    </button>
                    <div className={styles.titleBlock}>
                        <span className={styles.brand}>ליאת · nail artist</span>
                        <h1 className={styles.title}>
                            {bookingData.rescheduleId ? "שינוי מועד תור" : "קביעת תור"}
                        </h1>
                    </div>
                    <Link href="/" className={styles.iconBtn} aria-label="סגירה וחזרה לדף הבית">
                        <XIcon size={20} />
                    </Link>
                </div>
                <StepIndicator steps={STEPS} currentStep={currentStep} />
            </header>

            <main className={styles.content} id="main">
                <div key={currentStep} className={`${styles.stepCard} animate-fade-in-up`}>
                    {currentStep === 0 && (
                        <PhoneStep
                            bookingData={bookingData}
                            updateBookingData={updateBookingData}
                            onNext={nextStep}
                        />
                    )}
                    {currentStep === 1 && (
                        <ArtistStep
                            bookingData={bookingData}
                            updateBookingData={updateBookingData}
                            onNext={nextStep}
                        />
                    )}
                    {currentStep === 2 && (
                        <ServiceStep
                            bookingData={bookingData}
                            updateBookingData={updateBookingData}
                            onNext={nextStep}
                            artistId={bookingData.artistId}
                            preselectServiceId={preselectServiceId}
                        />
                    )}
                    {currentStep === 3 && (
                        <DateTimeStep
                            bookingData={bookingData}
                            updateBookingData={updateBookingData}
                            onNext={nextStep}
                            onBack={prevStep}
                            rescheduleMode={!!bookingData.rescheduleId}
                            artistId={bookingData.artistId}
                        />
                    )}
                    {currentStep === 4 && (
                        <NotesStep
                            bookingData={bookingData}
                            updateBookingData={updateBookingData}
                            onNext={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {currentStep === 5 && (
                        <ConfirmStep
                            bookingData={bookingData}
                            onConfirm={handleConfirm}
                            onBack={prevStep}
                            address={settings?.address}
                            isReschedule={!!bookingData.rescheduleId}
                            submitting={submitting}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div className={styles.page}><div className={styles.loading}>טוען...</div></div>}>
            <BookingContent />
        </Suspense>
    );
}
