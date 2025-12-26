"use client";

import { useState } from "react";
import { NailPolishIcon, SearchIcon, XIcon, ArrowLeftIcon } from "@/components/icons";
import styles from "./Gallery.module.css";

const galleryImages = [
    { id: "1", alt: "עיצוב פרחוני עדין" },
    { id: "2", alt: "ג׳ל ורוד קלאסי" },
    { id: "3", alt: "עיצוב גיאומטרי" },
    { id: "4", alt: "צרפתי מודרני" },
    { id: "5", alt: "נוצצים לאירוע" },
    { id: "6", alt: "נודי אלגנטי" },
];

export default function Gallery() {
    const [activeImage, setActiveImage] = useState<string | null>(null);

    return (
        <section className={styles.section} id="gallery">
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <span className={styles.badge}>
                        <NailPolishIcon size={14} />
                        גלריה
                    </span>
                    <h2 className={styles.title}>מהעבודות שלי</h2>
                    <p className={styles.subtitle}>
                        הצצה ליצירות האחרונות
                    </p>
                    <div className={styles.divider} />
                </header>

                {/* Gallery Grid */}
                <div className={styles.grid}>
                    {galleryImages.map((image, index) => (
                        <button
                            key={image.id}
                            className={styles.imageCard}
                            onClick={() => setActiveImage(image.id)}
                            style={{ animationDelay: `${index * 0.08}s` }}
                            aria-label={`צפייה ב${image.alt}`}
                        >
                            {/* Placeholder */}
                            <div className={styles.imagePlaceholder}>
                                <NailPolishIcon size={28} color="var(--color-primary)" />
                                <span className={styles.placeholderText}>{image.alt}</span>
                            </div>
                            <div className={styles.imageOverlay}>
                                <SearchIcon size={24} color="white" />
                            </div>
                        </button>
                    ))}
                </div>

                {/* View All Link */}
                <div className={styles.viewAll}>
                    <a href="/gallery" className={styles.viewAllLink}>
                        <span>לגלריה המלאה</span>
                        <ArrowLeftIcon size={18} />
                    </a>
                </div>
            </div>

            {/* Lightbox Modal */}
            {activeImage && (
                <div className={styles.lightbox} onClick={() => setActiveImage(null)}>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setActiveImage(null)}
                        aria-label="סגירה"
                    >
                        <XIcon size={24} />
                    </button>
                    <div className={styles.lightboxContent}>
                        <div className={styles.lightboxImage}>
                            <NailPolishIcon size={64} color="var(--color-primary)" />
                            <span>
                                {galleryImages.find((img) => img.id === activeImage)?.alt}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
