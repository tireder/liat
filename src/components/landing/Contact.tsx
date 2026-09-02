"use client";

import { useEffect, useState } from "react";
import { MapPinIcon, PhoneIcon, MessageIcon, ClockIcon, InstagramIcon, FacebookIcon, TikTokIcon, WazeIcon, ArrowLeftIcon } from "@/components/icons";
import SectionHeader from "./SectionHeader";
import Reveal from "@/components/ui/Reveal";
import type { SiteInfo } from "@/lib/landing";
import { groupOperatingHours, getTodayHours, toInternationalPhone, toWhatsAppNumber } from "@/lib/landing";
import styles from "./Contact.module.css";

interface ContactProps {
    initialSettings?: SiteInfo;
}

export default function Contact({ initialSettings }: ContactProps) {
    const [settings, setSettings] = useState<SiteInfo | null>(initialSettings || null);

    useEffect(() => {
        if (initialSettings) return;
        async function fetchSettings() {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) setSettings(await res.json());
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        }
        fetchSettings();
    }, [initialSettings]);

    const address = settings?.address?.trim() || "";
    const phone = settings?.phone?.trim() || "";
    const whatsapp = toWhatsAppNumber(settings?.whatsapp || settings?.phone);
    const telHref = toInternationalPhone(phone);
    const hoursRows = groupOperatingHours(settings?.operatingHours);
    const today = getTodayHours(settings?.operatingHours);
    const openToday = !!(today && today.active && today.openTime && today.closeTime);

    const mapsUrl = address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : "";
    const wazeUrl = address ? `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes` : "";
    const embedUrl = address
        ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
        : "";

    const socials = [
        settings?.instagram ? { href: settings.instagram, label: "Instagram", Icon: InstagramIcon } : null,
        settings?.facebook ? { href: settings.facebook, label: "Facebook", Icon: FacebookIcon } : null,
        settings?.tiktok ? { href: settings.tiktok, label: "TikTok", Icon: TikTokIcon } : null,
    ].filter(Boolean) as { href: string; label: string; Icon: React.FC<{ size?: number }> }[];

    const hasAnything = address || phone || hoursRows.length > 0 || socials.length > 0;
    if (settings && !hasAnything) return null;

    return (
        <section className={`section ${styles.section}`} id="contact" aria-labelledby="contact-title">
            <div className="container">
                <Reveal>
                    <SectionHeader
                        id="contact-title"
                        eyebrow="ביקור בסלון"
                        title="בואי לבקר"
                        subtitle="כל מה שצריך כדי להגיע, להתקשר או לשלוח הודעה. מחכה לך."
                    />
                </Reveal>

                <div className={styles.grid}>
                    <div className={styles.info}>
                        {/* Address */}
                        {address && (
                            <Reveal className={styles.block}>
                                <div className={styles.blockHead}>
                                    <span className={styles.blockIcon}><MapPinIcon size={18} /></span>
                                    <h3 className={styles.blockTitle}>איפה אנחנו</h3>
                                </div>
                                <p className={`display ${styles.address}`}>{address}</p>
                                <div className={styles.buttonRow}>
                                    <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                                        <WazeIcon size={16} />
                                        ניווט ב-Waze
                                    </a>
                                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                                        <MapPinIcon size={16} />
                                        Google Maps
                                    </a>
                                </div>
                            </Reveal>
                        )}

                        {/* Hours */}
                        {hoursRows.length > 0 && (
                            <Reveal className={styles.block} delay={60}>
                                <div className={styles.blockHead}>
                                    <span className={styles.blockIcon}><ClockIcon size={18} /></span>
                                    <h3 className={styles.blockTitle}>שעות פעילות</h3>
                                    <span className={`${styles.openBadge} ${openToday ? styles.open : styles.closed}`}>
                                        {openToday ? `פתוח היום עד ${today!.closeTime!.slice(0, 5)}` : "סגור היום"}
                                    </span>
                                </div>
                                <dl className={styles.hours}>
                                    {hoursRows.map((row) => {
                                        const isToday = row.days.includes(new Date().getDay());
                                        return (
                                            <div key={row.label} className={`${styles.hoursRow} ${isToday ? styles.hoursToday : ""}`}>
                                                <dt>{row.label}</dt>
                                                <dd className={`tabular ${row.closed ? styles.hoursClosed : ""}`} dir={row.closed ? undefined : "ltr"}>{row.hours}</dd>
                                            </div>
                                        );
                                    })}
                                </dl>
                            </Reveal>
                        )}

                        {/* Contact */}
                        {(phone || whatsapp) && (
                            <Reveal className={styles.block} delay={120}>
                                <div className={styles.blockHead}>
                                    <span className={styles.blockIcon}><PhoneIcon size={18} /></span>
                                    <h3 className={styles.blockTitle}>דברי איתי</h3>
                                </div>
                                <div className={styles.contactList}>
                                    {whatsapp && (
                                        <a
                                            href={`https://wa.me/${whatsapp}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.contactLink}
                                        >
                                            <MessageIcon size={18} />
                                            <span className={styles.contactText}>
                                                <span className={styles.contactLabel}>וואטסאפ</span>
                                                <span>שלחי הודעה, אחזור אלייך בהקדם</span>
                                            </span>
                                            <ArrowLeftIcon size={16} />
                                        </a>
                                    )}
                                    {phone && (
                                        <a href={`tel:${telHref}`} className={styles.contactLink}>
                                            <PhoneIcon size={18} />
                                            <span className={styles.contactText}>
                                                <span className={styles.contactLabel}>טלפון</span>
                                                <span className="tabular" dir="ltr">{phone}</span>
                                            </span>
                                            <ArrowLeftIcon size={16} />
                                        </a>
                                    )}
                                </div>
                            </Reveal>
                        )}

                        {socials.length > 0 && (
                            <Reveal className={styles.social} delay={160}>
                                <span className={styles.socialLabel}>עקבי אחריי</span>
                                <div className={styles.socialLinks}>
                                    {socials.map(({ href, label, Icon }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.socialLink}
                                            aria-label={label}
                                        >
                                            <Icon size={20} />
                                        </a>
                                    ))}
                                </div>
                            </Reveal>
                        )}
                    </div>

                    {embedUrl && (
                        <Reveal className={styles.map} delay={100}>
                            <iframe
                                className={styles.mapEmbed}
                                src={embedUrl}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="מיקום הסלון במפה"
                                allowFullScreen
                            />
                        </Reveal>
                    )}
                </div>
            </div>
        </section>
    );
}
