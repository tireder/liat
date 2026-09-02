import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import DownloadButtons from "./DownloadButtons";
import styles from "./AppPromotion.module.css";

export default function AppPromotion() {
    return (
        <section className={`section ${styles.section}`} aria-labelledby="app-title">
            <div className="container">
                <div className={styles.panel}>
                    <Reveal className={styles.copy}>
                        <span className="eyebrow">האפליקציה</span>
                        <h2 id="app-title" className={`display ${styles.title}`}>
                            לקבוע תור מעולם לא היה פשוט כל כך
                        </h2>
                        <p className={styles.text}>
                            הורידי את האפליקציה ותהני מחוויית שירות חלקה ומהירה יותר: בחירת טיפול, קביעת תור בקליק,
                            צפייה בגלריה וניהול התורים שלך, הכול ישר מהנייד.
                        </p>
                        <DownloadButtons />
                    </Reveal>

                    <Reveal className={styles.visual} delay={120}>
                        <div className={styles.glow} aria-hidden="true" />
                        <Image
                            src="/images/app-mockup-v2.png"
                            alt="תצוגה מקדימה של אפליקציית ליאת nail artist"
                            width={600}
                            height={800}
                            sizes="(max-width: 1023px) 70vw, 380px"
                            className={styles.mockup}
                        />
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
