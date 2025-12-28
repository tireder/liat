"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeftIcon, XIcon } from "@/components/icons";
import StepIndicator from "@/components/booking/StepIndicator";
import PhoneStep from "@/components/booking/PhoneStep";
import ServiceStep from "@/components/booking/ServiceStep";
import DateTimeStep from "@/components/booking/DateTimeStep";
import NotesStep from "@/components/booking/NotesStep";
import ConfirmStep from "@/components/booking/ConfirmStep";
import SuccessStep from "@/components/booking/SuccessStep";
import styles from "./page.module.css";

export interface BookingData {
    phone: string;
    name: string;
    serviceId: string | null;
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
    date: string | null;
    time: string | null;
    notes: string;
    rescheduleId?: string; // Add rescheduleId
}

interface SiteSettings {
    address: string;
    businessName: string;
}

const initialBookingData: BookingData = {
    phone: "",
    name: "",
    serviceId: null,
    serviceName: "",
    servicePrice: 0,
    serviceDuration: 0,
    date: null,
    time: null,
    notes: "",
};

const STEPS = ["טלפון", "שירות", "תאריך ושעה", "הערות", "אישור"];

function BookingContent() {
    const searchParams = useSearchParams();
    const rescheduleId = searchParams.get("reschedule");

    const [currentStep, setCurrentStep] = useState(0);
    const [bookingData, setBookingData] = useState<BookingData>(initialBookingData);
    const [isComplete, setIsComplete] = useState(false);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loadingReschedule, setLoadingReschedule] = useState(false);

    useEffect(() => {
        if (rescheduleId) {
            setBookingData(prev => ({ ...prev, rescheduleId }));
        }
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

    const updateBookingData = (data: Partial<BookingData>) => {
        setBookingData((prev) => ({ ...prev, ...data }));
    };

    const nextStep = async () => {
        // If finishing PhoneStep and we have a rescheduleId, fetch booking details
        if (currentStep === 0 && bookingData.rescheduleId) {
            setLoadingReschedule(true);
            try {
                const res = await fetch(`/api/bookings/${bookingData.rescheduleId}?phone=${bookingData.phone}`);
                if (res.ok) {
                    const booking = await res.json();

                    // Populate booking data
                    setBookingData(prev => ({
                        ...prev,
                        serviceId: booking.service.id,
                        serviceName: booking.service.name,
                        servicePrice: booking.service.price,
                        serviceDuration: booking.service.duration,
                        name: booking.client.name || prev.name,
                        // Don't set date/time as we want to pick new ones
                        // date: booking.date, 
                        // time: booking.start_time,
                    }));

                    // Jump to DateTimeStep (Step 2)
                    setCurrentStep(2);
                    setLoadingReschedule(false);
                    return;
                } else {
                    console.error("Failed to fetch booking for reschedule");
                    // Optionally show error or just continue as normal booking
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
            // If we jumped from Phone(0) to DateTime(2) during reschedule, back should go to Phone(0)
            if (currentStep === 2 && bookingData.rescheduleId) {
                setCurrentStep(0);
                return;
            }
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleConfirm = async () => {
        try {
            const endpoint = bookingData.rescheduleId
                ? `/api/bookings/${bookingData.rescheduleId}`
                : "/api/bookings";

            const method = bookingData.rescheduleId ? "PATCH" : "POST";

            const res = await fetch(endpoint, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    serviceId: bookingData.serviceId,
                    date: bookingData.date,
                    startTime: bookingData.time,
                    phone: bookingData.phone,
                    notes: bookingData.notes,
                    status: "pending_change", // Mark as pending change if reschedule
                }),
            });
            if (res.ok) {
                setIsComplete(true);
            }
        } catch (error) {
            console.error("Booking error:", error);
        }
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
        return <div className={styles.page}><div className={styles.loading}>טוען פרטי תור...</div></div>;
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <button
                    className={styles.backBtn}
                    onClick={currentStep > 0 ? prevStep : undefined}
                    disabled={currentStep === 0}
                    aria-label="חזרה"
                >
                    <ArrowLeftIcon size={20} />
                </button>
                <h1 className={styles.title}>
                    {bookingData.rescheduleId ? "שינוי מועד תור" : "קביעת תור"}
                </h1>
                <Link href="/" className={styles.closeBtn} aria-label="סגירה">
                    <XIcon size={20} />
                </Link>
            </header>

            {/* Progress */}
            <StepIndicator steps={STEPS} currentStep={currentStep} />

            {/* Content */}
            <main className={styles.content}>
                {currentStep === 0 && (
                    <PhoneStep
                        bookingData={bookingData}
                        updateBookingData={updateBookingData}
                        onNext={nextStep}
                    />
                )}
                {currentStep === 1 && (
                    <ServiceStep
                        bookingData={bookingData}
                        updateBookingData={updateBookingData}
                        onNext={nextStep}
                    />
                )}
                {currentStep === 2 && (
                    <DateTimeStep
                        bookingData={bookingData}
                        updateBookingData={updateBookingData}
                        onNext={nextStep}
                        onBack={prevStep}
                        rescheduleMode={!!bookingData.rescheduleId}
                    />
                )}
                {currentStep === 3 && (
                    <NotesStep
                        bookingData={bookingData}
                        updateBookingData={updateBookingData}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                )}
                {currentStep === 4 && (
                    <ConfirmStep
                        bookingData={bookingData}
                        onConfirm={handleConfirm}
                        onBack={prevStep}
                        address={settings?.address}
                        isReschedule={!!bookingData.rescheduleId}
                    />
                )}
            </main>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingContent />
        </Suspense>
    );
}
