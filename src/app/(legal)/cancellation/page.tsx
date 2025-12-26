import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import styles from "../legal.module.css";

export const metadata = {
    title: "מדיניות ביטולים | ליאת",
    description: "מדיניות ביטולים ושינויים של ליאת - סלון ציפורניים",
};

export default function CancellationPage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/" className={styles.backBtn}>
                    <ArrowLeftIcon size={20} />
                </Link>
                <h1 className={styles.headerTitle}>מדיניות ביטולים</h1>
                <div style={{ width: 44 }} />
            </header>

            <main className={styles.content}>
                <p className={styles.lastUpdated}>עודכן לאחרונה: דצמבר 2024</p>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>ביטול תורים</h2>
                    <p className={styles.text}>
                        אנו מבינים שלפעמים תוכניות משתנות. כדי לאפשר לנו לשרת את כל הלקוחות בצורה הטובה ביותר, אנא הקפידו על מדיניות הביטולים הבאה:
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>ביטול עד 24 שעות מראש</h2>
                    <p className={styles.text}>
                        ביטול תור עד 24 שעות לפני מועד התור - ללא עלות. ניתן לבטל באמצעות האתר או בהודעה ישירה.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>ביטול בהתראה קצרה</h2>
                    <p className={styles.text}>
                        ביטול תור בתוך 24 שעות לפני המועד עלול לגרור חיוב חלקי או בקשה להפקדה בתור הבא, בהתאם לשיקול דעתנו.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>אי-הגעה</h2>
                    <p className={styles.text}>
                        אי-הגעה לתור ללא התראה מוקדמת עלולה להשפיע על האפשרות לקבוע תורים עתידיים.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>שינוי תור</h2>
                    <p className={styles.text}>
                        ניתן לשנות תור קיים עד 24 שעות לפני המועד המקורי, בכפוף לזמינות.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>ביטול קורסים</h2>
                    <p className={styles.text}>
                        לגבי קורסים והכשרות, מדיניות הביטולים היא כדלקמן:
                    </p>
                    <ul className={styles.list}>
                        <li>ביטול עד 48 שעות לפני הקורס - החזר מלא</li>
                        <li>ביטול בתוך 48 שעות - ללא החזר</li>
                        <li>אי-הגעה - ללא החזר</li>
                    </ul>
                </section>

                <div className={styles.contact}>
                    <h3>צריכים לבטל תור?</h3>
                    <p>ניתן לבטל באמצעות האתר או לשלוח לנו הודעה.</p>
                </div>
            </main>
        </div>
    );
}
