import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import Reveal from "@/components/ui/Reveal";
import type { GalleryImage, SiteInfo } from "@/lib/landing";
import styles from "./About.module.css";

interface AboutProps {
    settings?: SiteInfo;
    images?: GalleryImage[];
}

export default function About({ settings, images = [] }: AboutProps) {
    const name = settings?.aboutName || settings?.businessName || "ליאת";
    const aboutText = settings?.aboutText || "";
    const years = settings?.aboutYears;
    const clients = settings?.aboutClients;
    const graduates = settings?.aboutGraduates;

    const [primary, secondary] = images;
    const stats = [
        years ? { value: `${years}+`, label: "שנות ניסיון" } : null,
        clients ? { value: `${clients}+`, label: "לקוחות" } : null,
        graduates ? { value: `${graduates}+`, label: "בוגרות" } : null,
    ].filter(Boolean) as { value: string; label: string }[];

    return (
        <section className={`section ${styles.section}`} id="about" aria-labelledby="about-title">
            <div className={`container ${styles.inner} ${primary ? "" : styles.textOnly}`}>
                {primary && (
                <Reveal className={styles.visual}>
                    <div className={styles.frameLarge}>
                        {primary ? (
                            <Image
                                src={primary.url}
                                alt={primary.alt || `עבודה מהסטודיו של ${name}`}
                                fill
                                sizes="(max-width: 1023px) 92vw, 42vw"
                                className={styles.image}
                            />
                        ) : (
                            <div className={styles.frameFallback} aria-hidden="true">
                                <span className="display">{name}</span>
                            </div>
                        )}
                    </div>
                    {secondary && (
                        <div className={styles.frameSmall}>
                            <Image
                                src={secondary.url}
                                alt={secondary.alt || "עבודת ציפורניים"}
                                fill
                                sizes="(max-width: 1023px) 40vw, 18vw"
                                className={styles.image}
                            />
                        </div>
                    )}
                    <div className={styles.nameTag} aria-hidden="true">
                        <span className={`display ${styles.nameTagName}`}>{name}</span>
                        <span className={styles.nameTagSub}>nail artist</span>
                    </div>
                </Reveal>
                )}

                <Reveal className={styles.copy} delay={100}>
                    <span className="eyebrow">קצת עליי</span>
                    <h2 id="about-title" className={`display ${styles.title}`}>
                        שלום, אני {name}
                    </h2>

                    {aboutText && <p className={styles.lead}>{aboutText}</p>}

                    <p className={styles.text}>
                        אני מאמינה שכל ציפורן היא קנבס קטן. הגישה שלי אישית ומותאמת: כל לקוחה מקבלת את מלוא תשומת הלב
                        והייעוץ המקצועי לבחירת העיצוב שמתאים לה. הסלון הוא מקום של שלווה ופינוק, שבו אפשר להירגע וליהנות מטיפול
                        ברמה הגבוהה ביותר.
                    </p>

                    {stats.length > 0 && (
                        <dl className={styles.stats}>
                            {stats.map((s) => (
                                <div key={s.label} className={styles.stat}>
                                    <dt className={styles.statLabel}>{s.label}</dt>
                                    <dd className={`display tabular ${styles.statValue}`}>{s.value}</dd>
                                </div>
                            ))}
                        </dl>
                    )}

                    <div className={styles.actions}>
                        <Link href="/book" className="btn btn-primary">
                            לקביעת תור אצלי
                        </Link>
                        <Link href="/gallery" className="btn btn-text">
                            לעבודות נוספות
                            <ArrowLeftIcon size={16} />
                        </Link>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
