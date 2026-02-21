"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./BeforeAfterSlider.module.css";

interface Props {
    beforeUrl: string;
    afterUrl: string;
    beforeLabel?: string;
    afterLabel?: string;
    className?: string;
}

export default function BeforeAfterSlider({
    beforeUrl,
    afterUrl,
    beforeLabel = "לפני",
    afterLabel = "אחרי",
    className = ""
}: Props) {
    const [position, setPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const updatePosition = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setPosition(percentage);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        updatePosition(e.clientX);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        updatePosition(e.touches[0].clientX);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                updatePosition(e.clientX);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (isDragging) {
                updatePosition(e.touches[0].clientX);
            }
        };

        const handleEnd = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleEnd);
            document.addEventListener("touchmove", handleTouchMove);
            document.addEventListener("touchend", handleEnd);
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleEnd);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleEnd);
        };
    }, [isDragging, updatePosition]);

    return (
        <div
            ref={containerRef}
            className={`${styles.container} ${className}`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            {/* After image (full width) */}
            <div className={styles.imageWrapper}>
                <img src={afterUrl} alt={afterLabel} className={styles.image} draggable={false} />
                <span className={`${styles.label} ${styles.afterLabel}`}>{afterLabel}</span>
            </div>

            {/* Before image (clipped) */}
            <div
                className={styles.beforeWrapper}
                style={{ width: `${position}%` }}
            >
                <img src={beforeUrl} alt={beforeLabel} className={styles.image} draggable={false} />
                <span className={`${styles.label} ${styles.beforeLabel}`}>{beforeLabel}</span>
            </div>

            {/* Slider handle */}
            <div
                className={styles.slider}
                style={{ left: `${position}%` }}
            >
                <div className={styles.handle}>
                    <span className={styles.arrows}>◀ ▶</span>
                </div>
            </div>
        </div>
    );
}
