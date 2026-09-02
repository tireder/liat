import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, MessageIcon } from "@/components/icons";
import Reveal from "@/components/ui/Reveal";
import type { GalleryImage } from "@/lib/landing";
import { toWhatsAppNumber } from "@/lib/landing";
import styles from "./CTASection.module.css";

interface CTASectionProps {
    image?: GalleryImage;
    whatsapp?: string;
}

export default function CTASection({ image, whatsapp }: CTASectionProps) {
    const wa = toWhatsAppNumber(whatsapp);

    return (
        <section className={styles.section} aria-labelledby="cta-title">
            <div className="container">
                <Reveal className={styles.banner}>
                    {image ? (
                        <Image
                            src={image.url}
                            alt=""
                            fill
                            sizes="(max-width: 1023px) 100vw, 1200px"
                            className={styles.image}
                            aria-hidden="true"
                        />
                    ) : (
                        <div className={styles.fallback} aria-hidden="true" />
                    )}
                    <div className={styles.overlay} aria-hidden="true" />

                    <div className={styles.content}>
                        <span className={`eyebrow ${styles.eyebrow}`}>הצעד הבא</span>
                        <h2 id="cta-title" className={`display ${styles.title}`}>
                            מוכנה לציפורניים שתאהבי?
                        </h2>
                        <p className={styles.text}>
                            בוחרים טיפול, בוחרים שעה, ומקבלים אישור ב-SMS. זה לוקח פחות מדקה.
                        </p>
                        <div className={styles.actions}>
                            <Link href="/book" className="btn btn-light btn-lg">
                                <CalendarIcon size={18} />
                                קביעת תור עכשיו
                            </Link>
                            {wa && (
                                <a
                                    href={`https://wa.me/${wa}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-ghost btn-lg"
                                >
                                    <MessageIcon size={18} />
                                    שאלה בוואטסאפ
                                </a>
                            )}
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
