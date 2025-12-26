"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { NailPolishIcon, SearchIcon, XIcon, ArrowLeftIcon } from "@/components/icons";
import styles from "./Gallery.module.css";

interface GalleryImage {
    id: string;
    url: string;
    alt: string | null;
    sort_order: number;
}

export default function Gallery() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);

    useEffect(() => {
        async function fetchGallery() {
            try {
                const res = await fetch("/api/gallery");
                if (res.ok) {
                    const data = await res.json();
                    // Only show first 6 images on landing page
                    setImages(data.slice(0, 6));
                }
            } catch (error) {
                console.error("Error fetching gallery:", error);
            }
            setLoading(false);
        }
        fetchGallery();
    }, []);

    // Don't render section if no images
    if (!loading && images.length === 0) {
        return null;
    }

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
                {loading ? (
                    <div className={styles.loading}>טוען...</div>
                ) : (
                    <div className={styles.grid}>
                        {images.map((image, index) => (
                            <button
                                key={image.id}
                                className={styles.imageCard}
                                onClick={() => setActiveImage(image)}
                                style={{ animationDelay: `${index * 0.08}s` }}
                                aria-label={`צפייה ב${image.alt || "תמונה"}`}
                            >
                                <Image
                                    src={image.url}
                                    alt={image.alt || "עבודה"}
                                    fill
                                    sizes="(max-width: 600px) 50vw, 33vw"
                                    className={styles.image}
                                />
                                <div className={styles.imageOverlay}>
                                    <SearchIcon size={24} color="white" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}

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
                    <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={activeImage.url}
                            alt={activeImage.alt || "עבודה"}
                            fill
                            sizes="100vw"
                            className={styles.lightboxImage}
                        />
                    </div>
                </div>
            )}
        </section>
    );
}
