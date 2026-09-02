"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, XIcon, ChevronDownIcon } from "@/components/icons";
import SectionHeader from "./SectionHeader";
import Reveal from "@/components/ui/Reveal";
import type { GalleryImage } from "@/lib/landing";
import styles from "./Gallery.module.css";

interface GalleryProps {
    initialImages?: GalleryImage[];
    limit?: number;
}

export default function Gallery({ initialImages, limit = 8 }: GalleryProps) {
    const [images, setImages] = useState<GalleryImage[]>(initialImages || []);
    const [loading, setLoading] = useState(!initialImages);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const closeBtnRef = useRef<HTMLButtonElement>(null);
    const lastTrigger = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (initialImages) return;
        async function fetchGallery() {
            try {
                const res = await fetch("/api/gallery");
                if (res.ok) {
                    const data = await res.json();
                    setImages(data.slice(0, limit));
                }
            } catch (error) {
                console.error("Error fetching gallery:", error);
            }
            setLoading(false);
        }
        fetchGallery();
    }, [initialImages, limit]);

    const close = useCallback(() => {
        setActiveIndex(null);
        lastTrigger.current?.focus();
    }, []);

    const step = useCallback(
        (dir: 1 | -1) => {
            setActiveIndex((i) => (i === null ? i : (i + dir + images.length) % images.length));
        },
        [images.length]
    );

    useEffect(() => {
        if (activeIndex === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
            // In RTL the "next" image sits to the left
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

    if (!loading && images.length === 0) return null;

    const active = activeIndex !== null ? images[activeIndex] : null;

    return (
        <section className={`section ${styles.section}`} id="gallery" aria-labelledby="gallery-title">
            <div className="container">
                <Reveal>
                    <SectionHeader
                        id="gallery-title"
                        eyebrow="גלריה"
                        title="מהעבודות שלי"
                        subtitle="הצצה לעבודות האחרונות מהסטודיו. לחצי על תמונה לצפייה מקרוב."
                        action={
                            <Link href="/gallery" className="btn btn-secondary">
                                לגלריה המלאה
                                <ArrowLeftIcon size={16} />
                            </Link>
                        }
                    />
                </Reveal>

                {loading ? (
                    <div className={styles.grid} aria-busy="true">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className={`${styles.tile} ${styles.skeleton}`} />
                        ))}
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {images.map((image, index) => (
                            <Reveal key={image.id} className={styles.tile} delay={Math.min(index, 7) * 50}>
                                <button
                                    type="button"
                                    className={styles.tileBtn}
                                    onClick={(e) => {
                                        lastTrigger.current = e.currentTarget;
                                        setActiveIndex(index);
                                    }}
                                    aria-label={`צפייה ב${image.alt || "עבודה"}`}
                                >
                                    <Image
                                        src={image.url}
                                        alt={image.alt || "עבודת ציפורניים"}
                                        fill
                                        sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                                        className={styles.image}
                                    />
                                    <span className={styles.tileOverlay} aria-hidden="true" />
                                </button>
                            </Reveal>
                        ))}
                    </div>
                )}

                <div className={styles.mobileAction}>
                    <Link href="/gallery" className="btn btn-secondary btn-block">
                        לגלריה המלאה
                        <ArrowLeftIcon size={16} />
                    </Link>
                </div>
            </div>

            {active && (
                <div
                    className={styles.lightbox}
                    role="dialog"
                    aria-modal="true"
                    aria-label={active.alt || "תצוגת תמונה"}
                    onClick={close}
                >
                    <button
                        ref={closeBtnRef}
                        type="button"
                        className={styles.closeBtn}
                        onClick={close}
                        aria-label="סגירה"
                    >
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
        </section>
    );
}
