"use client";

import { BookingData } from "@/app/book/page";
import styles from "./NotesStep.module.css";

interface NotesStepProps {
    bookingData: BookingData;
    updateBookingData: (data: Partial<BookingData>) => void;
    onNext: () => void;
    onBack: () => void;
}

const MAX_CHARS = 300;

export default function NotesStep({
    bookingData,
    updateBookingData,
    onNext,
    onBack,
}: NotesStepProps) {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value.slice(0, MAX_CHARS);
        updateBookingData({ notes: value });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>הערות נוספות</h2>
                <p className={styles.subtitle}>יש משהו שחשוב לי לדעת?</p>
            </div>

            <div className={styles.field}>
                <label className={styles.label} htmlFor="notes">
                    הערות (אופציונלי)
                </label>
                <textarea
                    id="notes"
                    className={styles.textarea}
                    placeholder="למשל: אלרגיות, העדפות מיוחדות, בקשות..."
                    value={bookingData.notes}
                    onChange={handleChange}
                    rows={5}
                />
                <div className={styles.counter}>
                    {bookingData.notes.length}/{MAX_CHARS}
                </div>
            </div>

            <div className={styles.suggestions}>
                <p className={styles.suggestionsTitle}>הצעות:</p>
                <div className={styles.chips}>
                    {["יש לי אלרגיה", "אני בהריון", "עיצוב מיוחד", "אירוע קרוב"].map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            className={styles.chip}
                            onClick={() => {
                                const newNotes = bookingData.notes
                                    ? `${bookingData.notes}\n${suggestion}`
                                    : suggestion;
                                updateBookingData({ notes: newNotes.slice(0, MAX_CHARS) });
                            }}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.footer}>
                <button className="btn btn-secondary" onClick={onBack}>
                    חזרה
                </button>
                <button className="btn btn-primary" onClick={onNext}>
                    המשך לאישור
                </button>
            </div>
        </div>
    );
}
