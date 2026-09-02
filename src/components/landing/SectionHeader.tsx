import type { ReactNode } from "react";
import styles from "./SectionHeader.module.css";

interface SectionHeaderProps {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    align?: "start" | "center";
    action?: ReactNode;
    as?: "h1" | "h2";
    tone?: "light" | "dark";
    id?: string;
}

export default function SectionHeader({
    eyebrow,
    title,
    subtitle,
    align = "start",
    action,
    as: Heading = "h2",
    tone = "light",
    id,
}: SectionHeaderProps) {
    return (
        <div className={`${styles.header} ${styles[align]} ${tone === "dark" ? styles.dark : ""}`}>
            <div className={styles.text}>
                {eyebrow && <span className="eyebrow">{eyebrow}</span>}
                <Heading id={id} className={`display ${styles.title}`}>{title}</Heading>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {action && <div className={styles.action}>{action}</div>}
        </div>
    );
}
