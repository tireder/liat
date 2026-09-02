import Stars from "@/components/ui/Stars";
import { reviewCountLabel } from "@/lib/landing";
import styles from "./TrustBar.module.css";

interface TrustBarProps {
    rating?: { average: number; count: number };
    years?: string;
    clients?: string;
    graduates?: string;
}

/**
 * Compact proof strip beneath the hero. Renders only figures that already
 * exist in settings or reviews — nothing is assumed.
 */
export default function TrustBar({ rating, years, clients, graduates }: TrustBarProps) {
    const items: { value: string; label: string; stars?: number }[] = [];

    if (rating && rating.count > 0 && rating.average > 0) {
        items.push({ value: rating.average.toFixed(1), label: `דירוג ממוצע · ${reviewCountLabel(rating.count)}`, stars: rating.average });
    }
    if (years) items.push({ value: `${years}+`, label: "שנות ניסיון" });
    if (clients) items.push({ value: `${clients}+`, label: "לקוחות מרוצות" });
    if (graduates) items.push({ value: `${graduates}+`, label: "בוגרות קורסים" });

    if (items.length === 0) return null;

    return (
        <section className={styles.bar} aria-label="נתוני אמון">
            <div className={`container ${styles.inner}`}>
                {items.map((item) => (
                    <div key={item.label} className={styles.item}>
                        <div className={styles.valueRow}>
                            <span className={`display tabular ${styles.value}`}>{item.value}</span>
                            {item.stars !== undefined && <Stars value={item.stars} size={14} />}
                        </div>
                        <span className={styles.label}>{item.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
