"use client";

import { useEffect, useState } from "react";
import styles from "./Reviews.module.css";

interface Review {
    id: string;
    rating: number;
    comment: string;
    name: string;
    date: string;
}

interface ReviewsProps {
    initialData?: {
        reviews: Review[];
        averageRating: number;
    };
}

export default function Reviews({ initialData }: ReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>(initialData?.reviews || []);
    const [averageRating, setAverageRating] = useState(initialData?.averageRating || 0);
    const [loading, setLoading] = useState(!initialData);

    useEffect(() => {
        // Only fetch if no initial data provided
        if (initialData) return;

        fetch("/api/reviews")
            .then(res => res.json())
            .then(data => {
                setReviews(data.reviews || []);
                setAverageRating(data.averageRating || 0);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [initialData]);

    if (loading) {
        return (
            <section className={styles.section}>
                <div className={styles.container}>
                    <p className={styles.loading}>טוען ביקורות...</p>
                </div>
            </section>
        );
    }

    if (reviews.length === 0) {
        return null; // Don't show section if no reviews
    }

    return (
        <section className={styles.section} id="reviews">
            <div className={styles.container}>
                <h2 className={styles.title}>מה הלקוחות אומרות 💕</h2>

                <div className={styles.summary}>
                    <div className={styles.stars}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <span
                                key={star}
                                className={`${styles.star} ${star <= Math.round(averageRating) ? styles.filled : ""}`}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <span className={styles.rating}>{averageRating.toFixed(1)}</span>
                    <span className={styles.count}>({reviews.length} ביקורות)</span>
                </div>

                <div className={styles.grid}>
                    {reviews.slice(0, 6).map(review => (
                        <div key={review.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={styles.name}>{review.name}</span>
                                <div className={styles.cardStars}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span
                                            key={star}
                                            className={star <= review.rating ? styles.starFilled : styles.starEmpty}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {review.comment && (
                                <p className={styles.comment}>{review.comment}</p>
                            )}
                            <span className={styles.date}>
                                {new Date(review.date).toLocaleDateString("he-IL", {
                                    month: "short",
                                    year: "numeric"
                                })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
