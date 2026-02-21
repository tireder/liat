"use client";

import { useEffect, useState } from "react";
import { MapPinIcon, PhoneIcon, MessageIcon, ClockIcon, InstagramIcon, FacebookIcon, TikTokIcon, ArrowLeftIcon, WazeIcon } from "@/components/icons";
import styles from "./Contact.module.css";

type SiteSettings = {
    phone: string;
    address: string;
    whatsapp: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    operatingHours: {
        dayOfWeek: number;
        openTime: string | null;
        closeTime: string | null;
        active: boolean;
    }[];
};

const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export default function Contact() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        }
        fetchSettings();
    }, []);

    // Format phone for tel: link (remove dashes/spaces)
    const phoneLink = settings?.phone?.replace(/[-\s]/g, "") || "0501234567";
    const whatsappNumber = settings?.whatsapp?.replace(/[-\s+]/g, "") || "972501234567";
    const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(settings?.address || "רחוב הרצל 50 תל אביב")}`;

    // Group operating hours for display
    const getHoursDisplay = () => {
        if (!settings?.operatingHours?.length) {
            return [
                { label: "ראשון - חמישי", hours: "09:00 - 20:00" },
                { label: "שישי", hours: "09:00 - 14:00" },
                { label: "שבת", hours: "סגור" },
            ];
        }

        const hours = settings.operatingHours;
        const result: { label: string; hours: string }[] = [];

        // Check if Sunday-Thursday have same hours
        const sunToThu = hours.filter(h => h.dayOfWeek >= 0 && h.dayOfWeek <= 4);
        const allSame = sunToThu.every(h =>
            h.active === sunToThu[0]?.active &&
            h.openTime === sunToThu[0]?.openTime &&
            h.closeTime === sunToThu[0]?.closeTime
        );

        if (allSame && sunToThu.length === 5 && sunToThu[0]?.active) {
            result.push({
                label: "ראשון - חמישי",
                hours: `${sunToThu[0].openTime} - ${sunToThu[0].closeTime}`,
            });
        } else {
            // Show individual days
            sunToThu.forEach(h => {
                result.push({
                    label: dayNames[h.dayOfWeek],
                    hours: h.active ? `${h.openTime} - ${h.closeTime}` : "סגור",
                });
            });
        }

        // Friday
        const friday = hours.find(h => h.dayOfWeek === 5);
        if (friday) {
            result.push({
                label: "שישי",
                hours: friday.active ? `${friday.openTime} - ${friday.closeTime}` : "סגור",
            });
        }

        // Saturday
        const saturday = hours.find(h => h.dayOfWeek === 6);
        if (saturday) {
            result.push({
                label: "שבת",
                hours: saturday.active ? `${saturday.openTime} - ${saturday.closeTime}` : "סגור",
            });
        }

        return result;
    };

    const hoursDisplay = getHoursDisplay();

    return (
        <section className={styles.section} id="contact">
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <span className={styles.badge}>
                        <MapPinIcon size={14} />
                        צרי קשר
                    </span>
                    <h2 className={styles.title}>בואי לבקר</h2>
                    <p className={styles.subtitle}>
                        מחכה לך בסלון לפגישה אישית
                    </p>
                    <div className={styles.divider} />
                </header>

                <div className={styles.content}>
                    {/* Contact Info */}
                    <div className={styles.info}>
                        {/* Address */}
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.infoCard}
                        >
                            <div className={styles.infoIcon}>
                                <MapPinIcon size={22} />
                            </div>
                            <div className={styles.infoContent}>
                                <h3 className={styles.infoTitle}>כתובת</h3>
                                <p className={styles.infoText}>{settings?.address || "רחוב הרצל 50, תל אביב"}</p>
                                <span className={styles.infoLink}>
                                    פתח במפות
                                    <ArrowLeftIcon size={14} />
                                </span>
                            </div>
                        </a>

                        {/* Phone */}
                        <a href={`tel:+972${phoneLink.startsWith("0") ? phoneLink.slice(1) : phoneLink}`} className={styles.infoCard}>
                            <div className={styles.infoIcon}>
                                <PhoneIcon size={22} />
                            </div>
                            <div className={styles.infoContent}>
                                <h3 className={styles.infoTitle}>טלפון</h3>
                                <p className={styles.infoText}>{settings?.phone}</p>
                                <span className={styles.infoLink}>
                                    התקשרי עכשיו
                                    <ArrowLeftIcon size={14} />
                                </span>
                            </div>
                        </a>

                        {/* WhatsApp */}
                        <a
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.infoCard}
                        >
                            <div className={styles.infoIcon}>
                                <MessageIcon size={22} />
                            </div>
                            <div className={styles.infoContent}>
                                <h3 className={styles.infoTitle}>וואטסאפ</h3>
                                <p className={styles.infoText}>שלחי הודעה</p>
                                <span className={styles.infoLink}>
                                    פתח וואטסאפ
                                    <ArrowLeftIcon size={14} />
                                </span>
                            </div>
                        </a>

                        {/* Hours */}
                        <div className={styles.infoCard}>
                            <div className={styles.infoIcon}>
                                <ClockIcon size={22} />
                            </div>
                            <div className={styles.infoContent}>
                                <h3 className={styles.infoTitle}>שעות פעילות</h3>
                                <div className={styles.hours}>
                                    {hoursDisplay.map((row, index) => (
                                        <div key={index} className={styles.hoursRow}>
                                            <span>{row.label}</span>
                                            <span>{row.hours}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map with Navigation Links */}
                    <div className={styles.mapContainer}>
                        <iframe
                            className={styles.mapEmbed}
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(settings?.address || "רחוב הרצל 50 תל אביב")}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="מיקום הסלון"
                            allowFullScreen
                        />
                        <div className={styles.mapButtons}>
                            <a
                                href={`https://waze.com/ul?q=${encodeURIComponent(settings?.address || "רחוב הרצל 50 תל אביב")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.mapBtn}
                            >
                                <WazeIcon size={18} />
                                Waze
                            </a>
                            <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.mapBtn}
                            >
                                <MapPinIcon size={18} />
                                Google Maps
                            </a>
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className={styles.social}>
                    <span className={styles.socialLabel}>עקבי אחריי</span>
                    <div className={styles.socialLinks}>
                        <a
                            href={settings?.instagram || "https://instagram.com"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                            aria-label="Instagram"
                        >
                            <InstagramIcon size={20} />
                        </a>
                        <a
                            href={settings?.facebook || "https://facebook.com"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                            aria-label="Facebook"
                        >
                            <FacebookIcon size={20} />
                        </a>
                        <a
                            href={settings?.tiktok || "https://tiktok.com"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                            aria-label="TikTok"
                        >
                            <TikTokIcon size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
