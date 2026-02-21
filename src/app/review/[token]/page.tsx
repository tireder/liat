"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function ReviewPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    async function submitReview() {
        if (rating === 0) {
            setError("נא לבחור דירוג");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, rating, comment }),
            });

            const data = await res.json();

            if (res.ok) {
                setSubmitted(true);
            } else {
                setError(data.error || "שגיאה בשליחת הביקורת");
            }
        } catch {
            setError("שגיאה בשליחת הביקורת");
        }
        setLoading(false);
    }

    if (submitted) {
        return (
            <div className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.successIcon}>✓</div>
                    <h1>תודה רבה! 💕</h1>
                    <p>הביקורת שלך התקבלה בהצלחה.</p>
                    <p className={styles.subtitle}>נשמח לראות אותך שוב!</p>

                    <Link href="/book" className={styles.bookBtn}>
                        קביעת תור חדש 💅
                    </Link>

                    <Link href="/" className={styles.homeLink}>
                        חזרה לעמוד הבית
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1>איך היה? 💅</h1>
                <p className={styles.subtitle}>נשמח לשמוע את דעתך על הביקור</p>

                {/* Star Rating */}
                <div className={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={`${styles.star} ${star <= (hoverRating || rating) ? styles.filled : ""}`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        >
                            ★
                        </button>
                    ))}
                </div>
                <p className={styles.ratingText}>
                    {rating === 0 ? "בחרי דירוג" :
                        rating === 5 ? "מושלם! 😍" :
                            rating === 4 ? "מצוין! 😊" :
                                rating === 3 ? "טוב 🙂" :
                                    rating === 2 ? "יכול להיות יותר טוב 😕" :
                                        "לא טוב 😢"}
                </p>

                {/* Comment */}
                <textarea
                    className={styles.commentInput}
                    placeholder="ספרי לנו עוד... (אופציונלי)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                />

                {error && <p className={styles.error}>{error}</p>}

                <button
                    className={styles.submitBtn}
                    onClick={submitReview}
                    disabled={loading || rating === 0}
                >
                    {loading ? "שולח..." : "שליחת ביקורת"}
                </button>

                <p className={styles.privacyNote}>
                    הביקורת תוצג באופן אנונימי (שם פרטי בלבד)
                </p>
            </div>
        </div>
    );
}
