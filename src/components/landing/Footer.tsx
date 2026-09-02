import Link from "next/link";
import { InstagramIcon, FacebookIcon, TikTokIcon, CalendarIcon } from "@/components/icons";
import type { SiteInfo } from "@/lib/landing";
import { toInternationalPhone } from "@/lib/landing";
import styles from "./Footer.module.css";

interface FooterProps {
    settings?: SiteInfo;
}

const NAV = [
    { label: "קביעת תור", href: "/book" },
    { label: "טיפולים", href: "/#services" },
    { label: "גלריה", href: "/gallery" },
    { label: "קורסים", href: "/courses" },
    { label: "אודות", href: "/#about" },
    { label: "התורים שלי", href: "/my-bookings" },
];

const LEGAL = [
    { label: "תקנון", href: "/terms" },
    { label: "פרטיות", href: "/privacy" },
    { label: "מדיניות ביטולים", href: "/cancellation" },
    { label: "הצהרת נגישות", href: "/accessibility" },
];

export default function Footer({ settings }: FooterProps) {
    const year = new Date().getFullYear();
    const name = settings?.businessName || "ליאת";
    const phone = settings?.phone?.trim();
    const address = settings?.address?.trim();

    const socials = [
        settings?.instagram ? { href: settings.instagram, label: "Instagram", Icon: InstagramIcon } : null,
        settings?.facebook ? { href: settings.facebook, label: "Facebook", Icon: FacebookIcon } : null,
        settings?.tiktok ? { href: settings.tiktok, label: "TikTok", Icon: TikTokIcon } : null,
    ].filter(Boolean) as { href: string; label: string; Icon: React.FC<{ size?: number }> }[];

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.inner}`}>
                <div className={styles.brandCol}>
                    <Link href="/" className={styles.brand}>
                        <span className={`display ${styles.brandName}`}>{name}</span>
                        <span className={styles.brandSub}>nail artist</span>
                    </Link>
                    {(address || phone) && (
                        <address className={styles.address}>
                            {address && <span>{address}</span>}
                            {phone && (
                                <a href={`tel:${toInternationalPhone(phone)}`} className="tabular" dir="ltr">
                                    {phone}
                                </a>
                            )}
                        </address>
                    )}
                    {socials.length > 0 && (
                        <div className={styles.socials}>
                            {socials.map(({ href, label, Icon }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className={styles.socialLink}
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                <nav className={styles.col} aria-label="ניווט">
                    <h4 className={styles.colTitle}>ניווט</h4>
                    <ul className={styles.list}>
                        {NAV.map((l) => (
                            <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
                        ))}
                    </ul>
                </nav>

                <nav className={styles.col} aria-label="מידע משפטי">
                    <h4 className={styles.colTitle}>מידע</h4>
                    <ul className={styles.list}>
                        {LEGAL.map((l) => (
                            <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
                        ))}
                    </ul>
                </nav>

                <div className={styles.ctaCol}>
                    <h4 className={styles.colTitle}>מוכנה להתחיל?</h4>
                    <p className={styles.ctaText}>קביעת תור אונליין, אישור מיידי ב-SMS.</p>
                    <Link href="/book" className="btn btn-primary">
                        <CalendarIcon size={16} />
                        קביעת תור
                    </Link>
                </div>
            </div>

            <div className={`container ${styles.bottom}`}>
                <p className={styles.copyright}>© {year} {name} nail artist. כל הזכויות שמורות.</p>
                <p className={styles.credit}>
                    Site by{" "}
                    <a href="https://mbdev.space" target="_blank" rel="noopener noreferrer">
                        MBD
                    </a>
                </p>
            </div>
        </footer>
    );
}
