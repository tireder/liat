import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/icons";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
    title: string;
    backHref?: string;
    backLabel?: string;
    action?: ReactNode;
}

/** Compact sticky header for inner pages (gallery, courses). */
export default function PageHeader({ title, backHref = "/", backLabel = "חזרה לדף הבית", action }: PageHeaderProps) {
    return (
        <header className={styles.header}>
            <div className={`container ${styles.inner}`}>
                <Link href={backHref} className={styles.back} aria-label={backLabel}>
                    <ArrowLeftIcon size={18} style={{ transform: "scaleX(-1)" }} />
                    <span className={styles.backText}>{backLabel}</span>
                </Link>
                <h1 className={`display ${styles.title}`}>{title}</h1>
                <div className={styles.action}>{action}</div>
            </div>
        </header>
    );
}
