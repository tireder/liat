import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import styles from "../legal.module.css";

export const metadata = {
    title: "מדיניות פרטיות | ליאת",
    description: "מדיניות הפרטיות של ליאת - סלון ציפורניים",
};

export default function PrivacyPage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/" className={styles.backBtn}>
                    <ArrowLeftIcon size={20} />
                </Link>
                <h1 className={styles.headerTitle}>פרטיות</h1>
                <div style={{ width: 44 }} />
            </header>

            <main className={styles.content}>
                <p className={styles.lastUpdated}>עודכן לאחרונה: דצמבר 2024</p>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>1. מידע שאנו אוספים</h2>
                    <p className={styles.text}>
                        במסגרת השימוש באתר ובשירותינו, אנו עשויים לאסוף את המידע הבא:
                    </p>
                    <ul className={styles.list}>
                        <li>שם מלא</li>
                        <li>מספר טלפון</li>
                        <li>היסטוריית תורים וטיפולים</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>2. שימוש במידע</h2>
                    <p className={styles.text}>
                        המידע שנאסף משמש אותנו למטרות הבאות:
                    </p>
                    <ul className={styles.list}>
                        <li>ניהול תורים ותזכורות</li>
                        <li>יצירת קשר בנוגע לתורים</li>
                        <li>שיפור השירות</li>
                        <li>שליחת עדכונים ומבצעים (בהסכמתך)</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>3. שמירת המידע</h2>
                    <p className={styles.text}>
                        המידע נשמר בשרתים מאובטחים. אנו נוקטים באמצעי אבטחה מתאימים כדי להגן על המידע מפני גישה לא מורשית.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>4. שיתוף מידע</h2>
                    <p className={styles.text}>
                        איננו מוכרים, משכירים או משתפים את המידע האישי שלך עם צדדים שלישיים, למעט במקרים הבאים:
                    </p>
                    <ul className={styles.list}>
                        <li>כאשר נדרש על פי חוק</li>
                        <li>לצורך אספקת השירות (למשל, שליחת תזכורות SMS)</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>5. זכויותיך</h2>
                    <p className={styles.text}>
                        בהתאם לחוק הגנת הפרטיות, יש לך זכות לעיין במידע שנשמר אודותיך ולבקש תיקון או מחיקה שלו. לבקשות כאלה, אנא פנה אלינו ישירות.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>6. קוקיות (Cookies)</h2>
                    <p className={styles.text}>
                        האתר עשוי להשתמש בקוקיות לצורך שיפור חוויית המשתמש. ניתן לשלוט בהגדרות הקוקיות דרך הדפדפן.
                    </p>
                </section>

                <div className={styles.contact}>
                    <h3>שאלות בנוגע לפרטיות?</h3>
                    <p>ניתן לפנות אלינו בכל שאלה הנוגעת לפרטיות ולמידע האישי שלך.</p>
                </div>
            </main>
        </div>
    );
}
