"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon, XIcon } from "@/components/icons";
import styles from "./page.module.css";

interface GalleryImage {
    id: string;
    url: string;
    alt: string | null;
    sort_order: number;
}

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    useEffect(() => {
        async function fetchGallery() {
            try {
                const res = await fetch("/api/gallery");
                if (res.ok) {
                    const data = await res.json();
                    setImages(data);
                }
            } catch (error) {
                console.error("Error fetching gallery:", error);
            }
            setLoading(false);
        }
        fetchGallery();
    }, []);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/" className={styles.backBtn}>
                    <ArrowLeftIcon size={20} />
                </Link>
                <h1 className={styles.headerTitle}>גלריה</h1>
                <div style={{ width: 44 }} />
            </header>

            <main className={styles.content}>
                {loading ? (
                    <div className={styles.loading}>טוען תמונות...</div>
                ) : images.length === 0 ? (
                    <div className={styles.empty}>
                        <p>אין תמונות בגלריה עדיין</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {images.map((image) => (
                            <button
                                key={image.id}
                                className={styles.imageCard}
                                onClick={() => setSelectedImage(image)}
                            >
                                <Image
                                    src={image.url}
                                    alt={image.alt || "עבודה"}
                                    fill
                                    sizes="(max-width: 600px) 50vw, 33vw"
                                    className={styles.image}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </main>

            {/* Lightbox */}
            {selectedImage && (
                <div className={styles.lightbox} onClick={() => setSelectedImage(null)}>
                    <button className={styles.closeBtn}>
                        <XIcon size={24} />
                    </button>
                    <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={selectedImage.url}
                            alt={selectedImage.alt || "עבודה"}
                            fill
                            sizes="100vw"
                            className={styles.lightboxImage}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
