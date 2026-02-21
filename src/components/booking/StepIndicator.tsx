"use client";

import styles from "./StepIndicator.module.css";

interface StepIndicatorProps {
    steps: string[];
    currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className={styles.container}>
            <div className={styles.steps}>
                {steps.map((step, index) => (
                    <div
                        key={step}
                        className={`${styles.step} ${index < currentStep
                                ? styles.completed
                                : index === currentStep
                                    ? styles.active
                                    : styles.upcoming
                            }`}
                    >
                        <div className={styles.dot}>
                            {index < currentStep ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M20 6L9 17L4 12"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            ) : (
                                <span>{index + 1}</span>
                            )}
                        </div>
                        <span className={styles.label}>{step}</span>
                    </div>
                ))}
            </div>
            {/* Progress bar */}
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
            </div>
        </div>
    );
}
