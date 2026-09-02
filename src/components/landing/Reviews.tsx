"use client";

import { useEffect, useState } from "react";
import Stars from "@/components/ui/Stars";
import Reveal from "@/components/ui/Reveal";
import type { ReviewItem, ReviewSummary } from "@/lib/landing";
import { reviewCountLabel } from "@/lib/landing";
import styles from "./Reviews.module.css";

interface ReviewsProps {
    initialData?: ReviewSummary;
}

function formatMonth(date: string) {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("he-IL", { month: "long", year: "numeric" });
}

export default function Reviews({ initialData }: ReviewsProps) {
    const [reviews, setReviews] = useState<ReviewItem[]>(initialData?.reviews || []);
    const [averageRating, setAverageRating] = useState(initialData?.averageRating || 0);
    const [totalReviews, setTotalReviews] = useState(initialData?.totalReviews || 0);
    const [loading, setLoading] = useState(!initialData);

    useEffect(() => {
        if (initialData) return;
        fetch("/api/reviews")
            .then((res) => res.json())
            .then((data) => {
                setReviews(data.reviews || []);
                setAverageRating(data.averageRating || 0);
                setTotalReviews(data.totalReviews || data.reviews?.length || 0);
            })
            .catch(() => undefined)
            .finally(() => setLoading(false));
    }, [initialData]);

    if (loading || reviews.length === 0) return null;

    const withText = reviews.filter((r) => r.comment && r.comment.trim().length > 0);
    const display = (withText.length >= 3 ? withText : reviews).slice(0, 6);

    return (
        <section className={`section ${styles.section}`} id="reviews" aria-labelledby="reviews-title">
            <div className={`container ${styles.inner}`}>
                <Reveal className={styles.summary}>
                    <span className="eyebrow">לקוחות מספרות</span>
                    <h2 id="reviews-title" className={`display ${styles.title}`}>
                        מה אומרות עליי
                    </h2>
                    <div className={styles.score}>
                        <span className={`display tabular ${styles.scoreValue}`}>{averageRating.toFixed(1)}</span>
                        <div className={styles.scoreMeta}>
                            <Stars value={averageRating} size={18} />
                            <span className={styles.scoreCount}>
                                מבוסס על {reviewCountLabel(totalReviews)} של לקוחות
                            </span>
                        </div>
                    </div>
                </Reveal>

                <div className={styles.list}>
                    {display.map((review, index) => (
                        <Reveal key={review.id} as="figure" className={styles.card} delay={Math.min(index, 5) * 70}>
                            <span className={`display ${styles.quoteMark}`} aria-hidden="true">
                                ”
                            </span>
                            <Stars value={review.rating} size={14} className={styles.cardStars} />
                            {review.comment ? (
                                <blockquote className={styles.comment}>{review.comment}</blockquote>
                            ) : (
                                <blockquote className={`${styles.comment} ${styles.commentMuted}`}>
                                    דירוג {review.rating} כוכבים
                                </blockquote>
                            )}
                            <figcaption className={styles.author}>
                                <span className={styles.name}>{review.name}</span>
                                <span className={styles.date}>{formatMonth(review.date)}</span>
                            </figcaption>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
