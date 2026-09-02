"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

interface RevealProps {
    children: ReactNode;
    as?: ElementType;
    className?: string;
    delay?: number;
    id?: string;
}

/**
 * Fades content in once it scrolls into view. Renders visible immediately
 * when IntersectionObserver is unavailable or reduced motion is requested.
 */
export default function Reveal({ children, as: Tag = "div", className = "", delay = 0, id }: RevealProps) {
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        if (reduce || !("IntersectionObserver" in window)) {
            el.classList.add("is-visible");
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        el.classList.add("is-visible");
                        observer.unobserve(el);
                    }
                });
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <Tag
            ref={ref}
            id={id}
            className={`reveal ${className}`}
            style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
        >
            {children}
        </Tag>
    );
}
