"use client";

import styles from "./StepIndicator.module.css";

interface StepIndicatorProps {
    steps: string[];
    currentStep: number;
}

/**
 * Compact progress header: "שלב 3 מתוך 6 · תאריך ושעה" with a segmented bar.
 * Keeps every step name available to assistive tech without crowding small screens.
 */
export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    const total = steps.length;
    const current = Math.min(Math.max(currentStep, 0), total - 1);

    return (
        <div className={styles.container} role="group" aria-label={`התקדמות: שלב ${current + 1} מתוך ${total}`}>
            <div className={styles.row}>
                <span className={styles.counter}>
                    <span className="tabular">שלב {current + 1} מתוך {total}</span>
                </span>
                <span className={styles.label} aria-live="polite">{steps[current]}</span>
            </div>
            <ol className={styles.segments} aria-hidden="true">
                {steps.map((step, index) => (
                    <li
                        key={step}
                        className={`${styles.segment} ${index < current ? styles.done : ""} ${index === current ? styles.active : ""}`}
                    />
                ))}
            </ol>
        </div>
    );
}
