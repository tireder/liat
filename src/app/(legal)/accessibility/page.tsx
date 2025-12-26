import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import styles from "../legal.module.css";

export const metadata = {
    title: "הצהרת נגישות | ליאת",
    description: "הצהרת נגישות של ליאת - סלון ציפורניים",
};

export default function AccessibilityPage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/" className={styles.backBtn}>
                    <ArrowLeftIcon size={20} />
                </Link>
                <h1 className={styles.headerTitle}>הצהרת נגישות</h1>
                <div style={{ width: 44 }} />
            </header>

            <main className={styles.content}>
                <p className={styles.lastUpdated}>עודכן לאחרונה: דצמבר 2024</p>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>מחויבות לנגישות</h2>
                    <p className={styles.text}>
                        אנו מאמינים שכל אדם זכאי לגישה שווה לשירותים ולמידע. אנו עושים מאמצים לספק אתר נגיש לכלל המשתמשים, כולל אנשים עם מוגבלויות.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>תכונות נגישות באתר</h2>
                    <p className={styles.text}>
                        האתר כולל את תכונות הנגישות הבאות:
                    </p>
                    <ul className={styles.list}>
                        <li>תמיכה בקורא מסך</li>
                        <li>ניווט באמצעות מקלדת</li>
                        <li>טקסט חלופי לתמונות</li>
                        <li>ניגודיות צבעים מתאימה</li>
                        <li>אפשרות להגדלת טקסט</li>
                        <li>תפריט נגישות מובנה</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>נגישות הסלון</h2>
                    <p className={styles.text}>
                        הסלון שלנו נגיש גם פיזית לאנשים עם מוגבלויות:
                    </p>
                    <ul className={styles.list}>
                        <li>כניסה נגישה</li>
                        <li>שירותים נגישים</li>
                        <li>חניה נגישה בקרבת מקום</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>דרכי תקשורת נגישות</h2>
                    <p className={styles.text}>
                        אנו זמינים בערוצים הבאים לסיוע ותמיכה:
                    </p>
                    <ul className={styles.list}>
                        <li>טלפון</li>
                        <li>וואטסאפ</li>
                        <li>קביעת תורים באתר</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>משוב</h2>
                    <p className={styles.text}>
                        אנו מתחייבים לשיפור מתמיד של הנגישות. אם נתקלת בבעיית נגישות או יש לך הצעות לשיפור, אנא פנה אלינו ונטפל בכך בהקדם.
                    </p>
                </section>

                <div className={styles.contact}>
                    <h3>נתקלת בבעיית נגישות?</h3>
                    <p>נשמח לשמוע ולסייע. פנו אלינו בכל ערוץ נוח.</p>
                </div>
            </main>
        </div>
    );
}
