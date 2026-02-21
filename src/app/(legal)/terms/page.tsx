import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import styles from "../legal.module.css";

export const metadata = {
    title: "תקנון | ליאת",
    description: "תקנון השימוש באתר ובשירותים של ליאת - סלון ציפורניים",
};

export default function TermsPage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/" className={styles.backBtn}>
                    <ArrowLeftIcon size={20} />
                </Link>
                <h1 className={styles.headerTitle}>תקנון</h1>
                <div style={{ width: 44 }} />
            </header>

            <main className={styles.content}>
                <p className={styles.lastUpdated}>עודכן לאחרונה: דצמבר 2024</p>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>1. כללי</h2>
                    <p className={styles.text}>
                        ברוכים הבאים לאתר של ליאת - סלון ציפורניים מקצועי. השימוש באתר ובשירותים המוצעים בו כפוף לתנאים המפורטים להלן. הכניסה לאתר והשימוש בו מהווים הסכמה לתנאים אלה.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>2. קביעת תורים</h2>
                    <p className={styles.text}>
                        קביעת תור באמצעות האתר מחייבת הזנת מספר טלפון ואימות באמצעות קוד. התור ייחשב מאושר רק לאחר קבלת אישור מהמערכת.
                    </p>
                    <ul className={styles.list}>
                        <li>יש להגיע לתור בזמן שנקבע</li>
                        <li>במקרה של איחור מעל 15 דקות, התור עלול להתבטל</li>
                        <li>ביטול תור יש לבצע לפחות 24 שעות מראש</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>3. תשלום</h2>
                    <p className={styles.text}>
                        התשלום עבור השירותים מתבצע בסלון לאחר קבלת הטיפול. אנו מקבלים מזומן, כרטיסי אשראי וביט.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>4. קורסים והכשרות</h2>
                    <p className={styles.text}>
                        ההרשמה לקורסים מחייבת תשלום מקדמה. פרטים מלאים על מדיניות הביטולים לקורסים מופיעים בעמוד הקורסים ובהסכם ההרשמה.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>5. אחריות</h2>
                    <p className={styles.text}>
                        הסלון עושה כל מאמץ לספק שירות מקצועי ואיכותי. במקרה של בעיה כלשהי, אנא פנו אלינו ישירות ונשמח לטפל בכך.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>6. שינויים בתקנון</h2>
                    <p className={styles.text}>
                        הסלון שומר לעצמו את הזכות לעדכן תקנון זה מעת לעת. שינויים ייכנסו לתוקף מרגע פרסומם באתר.
                    </p>
                </section>

                <div className={styles.contact}>
                    <h3>יש לך שאלות?</h3>
                    <p>ניתן לפנות אלינו בכל שאלה או הבהרה.</p>
                </div>
            </main>
        </div>
    );
}
