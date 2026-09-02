"use client";

import { useId } from "react";

interface StarsProps {
    value: number;
    size?: number;
    className?: string;
    label?: string;
}

/** Renders a five-star rating with partial fill, driven by a numeric value. */
export default function Stars({ value, size = 16, className = "", label }: StarsProps) {
    const uid = useId();
    const clamped = Math.max(0, Math.min(5, value));
    return (
        <span
            className={className}
            role="img"
            aria-label={label || `דירוג ${clamped.toFixed(1)} מתוך 5`}
            style={{ display: "inline-flex", gap: 2, lineHeight: 0 }}
        >
            {[0, 1, 2, 3, 4].map((i) => {
                const fill = Math.max(0, Math.min(1, clamped - i));
                const id = `${uid}-star-${i}`;
                return (
                    <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
                        <defs>
                            <linearGradient id={id} x1="0" x2="1">
                                <stop offset={`${fill * 100}%`} stopColor="var(--rose)" />
                                <stop offset={`${fill * 100}%`} stopColor="var(--rose-soft)" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M12 2.6l2.9 6.1 6.7.8-4.9 4.6 1.3 6.6L12 17.4l-6 3.3 1.3-6.6L2.4 9.5l6.7-.8L12 2.6z"
                            fill={`url(#${id})`}
                        />
                    </svg>
                );
            })}
        </span>
    );
}
