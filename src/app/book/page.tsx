"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

export default function BookingPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [bookingData, setBookingData] = useState<BookingData>(initialBookingData);
    const [isComplete, setIsComplete] = useState(false);
    const [settings, setSettings] = useState<SiteSettings | null>(null);

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

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleConfirm = async () => {
        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    serviceId: bookingData.serviceId,
                    date: bookingData.date,
                    startTime: bookingData.time,
                    phone: bookingData.phone,
                    notes: bookingData.notes,
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
                />
            </div>
        );
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
                <h1 className={styles.title}>קביעת תור</h1>
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
                    />
                )}
            </main>
        </div>
    );
}
