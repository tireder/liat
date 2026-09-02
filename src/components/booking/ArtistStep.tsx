"use client";

import { useState, useEffect } from "react";
import { CheckIcon } from "@/components/icons";
import styles from "./ArtistStep.module.css";

interface ArtistData {
    id: string;
    name: string;
    sort_order: number;
    serviceIds: string[];
}

interface ArtistStepProps {
    bookingData: {
        artistId?: string | null;
        artistName?: string;
    };
    updateBookingData: (data: { artistId: string; artistName: string }) => void;
    onNext: () => void;
}

export default function ArtistStep({ bookingData, updateBookingData, onNext }: ArtistStepProps) {
    const [artists, setArtists] = useState<ArtistData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchArtists() {
            try {
                const res = await fetch("/api/artists");
                if (!res.ok) throw new Error("artists");
                const data = await res.json();
                setArtists(data);

                // A single artist needs no choice — move straight on
                if (data.length === 1) {
                    updateBookingData({ artistId: data[0].id, artistName: data[0].name });
                    onNext();
                    return;
                }
            } catch (err) {
                console.error("Error fetching artists:", err);
                setError("לא הצלחנו לטעון את רשימת האמניות. נסי לרענן.");
            }
            setLoading(false);
        }
        fetchArtists();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleSelect(artist: ArtistData) {
        updateBookingData({ artistId: artist.id, artistName: artist.name });
        setTimeout(() => onNext(), 180);
    }

    if (loading) {
        return (
            <div className={styles.container} aria-busy="true">
                <p className={styles.subtitle}>טוענת...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={`display ${styles.title}`}>אצל מי תרצי להתפנק?</h2>
                <p className={styles.subtitle}>בחרי את האמנית לטיפול</p>
            </div>

            {error && <p className="field-error" role="alert">{error}</p>}

            <div className={styles.list} role="radiogroup" aria-label="אמניות">
                {artists.map((artist) => {
                    const selected = bookingData.artistId === artist.id;
                    return (
                        <button
                            key={artist.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            className={`${styles.card} ${selected ? styles.selected : ""}`}
                            onClick={() => handleSelect(artist)}
                        >
                            <span className={`display ${styles.avatar}`} aria-hidden="true">
                                {artist.name.trim().charAt(0)}
                            </span>
                            <span className={styles.info}>
                                <span className={styles.name}>{artist.name}</span>
                                <span className={styles.services}>
                                    <span className="tabular">{artist.serviceIds.length}</span> טיפולים זמינים
                                </span>
                            </span>
                            <span className={styles.check} aria-hidden="true">
                                <CheckIcon size={14} />
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
