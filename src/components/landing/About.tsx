"use client";

import { UserIcon, StarIcon, HeartIcon, AwardIcon } from "@/components/icons";
import styles from "./About.module.css";

export default function About() {
    return (
        <section className={styles.section} id="about">
            <div className={styles.container}>
                <div className={styles.content}>
                    {/* Image side */}
                    <div className={styles.imageContainer}>
                        <div className={styles.imagePlaceholder}>
                            <UserIcon size={64} color="var(--color-primary)" />
                        </div>
                        {/* Decorative elements */}
                        <div className={styles.decorCircle} />
                    </div>

                    {/* Text side */}
                    <div className={styles.textContainer}>
                        <span className={styles.badge}>קצת עליי</span>
                        <h2 className={styles.title}>שלום, אני ליאת</h2>
                        <div className={styles.divider} />

                        <div className={styles.paragraphs}>
                            <p>
                                מזה למעלה מ-8 שנים אני עוסקת באמנות הציפורניים מתוך אהבה אמיתית
                                למקצוע. התחלתי את דרכי כחובבת וכיום אני גאה להיות בעלת סלון
                                ומעבירת קורסים מקצועיים.
                            </p>
                            <p>
                                אני מאמינה שכל ציפורן היא קנבס קטן ליצירת אמנות. הגישה שלי היא
                                אישית ומותאמת - כל לקוחה מקבלת את מלוא תשומת הלב והייעוץ המקצועי
                                לבחירת העיצוב המושלם עבורה.
                            </p>
                            <p>
                                הסלון שלי הוא מקום של שלווה ופינוק, שבו תוכלי להירגע וליהנות
                                מטיפול ברמה הגבוהה ביותר.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <AwardIcon size={20} color="var(--color-primary)" />
                                <span className={styles.statNumber}>8+</span>
                                <span className={styles.statLabel}>שנות ניסיון</span>
                            </div>
                            <div className={styles.statDivider} />
                            <div className={styles.stat}>
                                <HeartIcon size={20} color="var(--color-primary)" />
                                <span className={styles.statNumber}>500+</span>
                                <span className={styles.statLabel}>לקוחות</span>
                            </div>
                            <div className={styles.statDivider} />
                            <div className={styles.stat}>
                                <StarIcon size={20} color="var(--color-primary)" />
                                <span className={styles.statNumber}>50+</span>
                                <span className={styles.statLabel}>בוגרות</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
