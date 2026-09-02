"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/ui/PageHeader";
import { XIcon, ChevronDownIcon, CalendarIcon } from "@/components/icons";
import type { GalleryImage } from "@/lib/landing";
import styles from "./page.module.css";

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const closeBtnRef = useRef<HTMLButtonElement>(null);
    const lastTrigger = useRef<HTMLElement | null>(null);

    useEffect(() => {
        async function fetchGallery() {
            try {
                const res = await fetch("/api/gallery");
                if (!res.ok) throw new Error("gallery");
                setImages(await res.json());
            } catch (err) {
                console.error("Error fetching gallery:", err);
                setError(true);
            }
            setLoading(false);
        }
        fetchGallery();
    }, []);

    const close = useCallback(() => {
        setActiveIndex(null);
        lastTrigger.current?.focus();
    }, []);

    const step = useCallback(
        (dir: 1 | -1) => setActiveIndex((i) => (i === null ? i : (i + dir + images.length) % images.length)),
        [images.length]
    );

    useEffect(() => {
        if (activeIndex === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
            if (e.key === "ArrowLeft") step(1);
            if (e.key === "ArrowRight") step(-1);
        };
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeBtnRef.current?.focus();
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [activeIndex, close, step]);

    const active = activeIndex !== null ? images[activeIndex] : null;

    return (
        <div className={styles.page}>
            <PageHeader
                title="גלריה"
                action={
                    <Link href="/book" className={`btn btn-primary btn-sm ${styles.headerCta}`}>
                        <CalendarIcon size={15} />
                        <span>קביעת תור</span>
                    </Link>
                }
            />

            <main id="main" className={`container ${styles.content}`}>
                <div className={styles.intro}>
                    <span className="eyebrow">העבודות שלי</span>
                    <h2 className={`display ${styles.introTitle}`}>כל עבודה היא עיצוב אישי</h2>
                    <p className={styles.introText}>
                        אוסף עבודות מהסטודיו. מצאת משהו שאת אוהבת? קבעי תור ונתאים אותו בדיוק לך.
                    </p>
                </div>

                {loading ? (
                    <div className={styles.grid} aria-busy="true">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className={`${styles.tile} ${styles.skeleton}`} />
                        ))}
                    </div>
                ) : error ? (
                    <div className={styles.empty} role="alert">
                        <p>לא הצלחנו לטעון את הגלריה. נסי לרענן את העמוד.</p>
                    </div>
                ) : images.length === 0 ? (
                    <div className={styles.empty}>
                        <p className={`display ${styles.emptyTitle}`}>הגלריה מתמלאת בקרוב</p>
                        <p>בינתיים אפשר לעקוב אחריי ברשתות או לקבוע תור.</p>
                        <Link href="/book" className="btn btn-primary">קביעת תור</Link>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {images.map((image, index) => (
                            <button
                                key={image.id}
                                type="button"
                                className={styles.tile}
                                onClick={(e) => {
                                    lastTrigger.current = e.currentTarget;
                                    setActiveIndex(index);
                                }}
                                aria-label={`צפייה ב${image.alt || "עבודה"}`}
                                style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
                            >
                                <Image
                                    src={image.url}
                                    alt={image.alt || "עבודת ציפורניים"}
                                    fill
                                    sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                                    className={styles.image}
                                />
                            </button>
                        ))}
                    </div>
                )}

                {!loading && images.length > 0 && (
                    <div className={styles.footerCta}>
                        <p className={`display ${styles.footerCtaTitle}`}>ראית משהו שאת אוהבת?</p>
                        <Link href="/book" className="btn btn-primary btn-lg">
                            <CalendarIcon size={18} />
                            קביעת תור
                        </Link>
                    </div>
                )}
            </main>

            {active && (
                <div
                    className={styles.lightbox}
                    role="dialog"
                    aria-modal="true"
                    aria-label={active.alt || "תצוגת תמונה"}
                    onClick={close}
                >
                    <button ref={closeBtnRef} type="button" className={styles.closeBtn} onClick={close} aria-label="סגירה">
                        <XIcon size={22} />
                    </button>
                    {images.length > 1 && (
                        <>
                            <button
                                type="button"
                                className={`${styles.navBtn} ${styles.navPrev}`}
                                onClick={(e) => { e.stopPropagation(); step(-1); }}
                                aria-label="תמונה קודמת"
                            >
                                <ChevronDownIcon size={22} />
                            </button>
                            <button
                                type="button"
                                className={`${styles.navBtn} ${styles.navNext}`}
                                onClick={(e) => { e.stopPropagation(); step(1); }}
                                aria-label="תמונה הבאה"
                            >
                                <ChevronDownIcon size={22} />
                            </button>
                        </>
                    )}
                    <figure className={styles.lightboxFigure} onClick={(e) => e.stopPropagation()}>
                        <Image
                            key={active.id}
                            src={active.url}
                            alt={active.alt || "עבודת ציפורניים"}
                            fill
                            sizes="100vw"
                            className={styles.lightboxImage}
                            priority
                        />
                        {active.alt && <figcaption className={styles.caption}>{active.alt}</figcaption>}
                    </figure>
                    <span className={`tabular ${styles.counter}`} aria-live="polite">
                        {activeIndex! + 1} / {images.length}
                    </span>
                </div>
            )}
        </div>
    );
}
