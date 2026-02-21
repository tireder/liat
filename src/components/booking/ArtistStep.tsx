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

    useEffect(() => {
        async function fetchArtists() {
            try {
                const res = await fetch("/api/artists");
                if (res.ok) {
                    const data = await res.json();
                    setArtists(data);

                    // If only one artist, auto-select and skip
                    if (data.length === 1) {
                        updateBookingData({
                            artistId: data[0].id,
                            artistName: data[0].name,
                        });
                        onNext();
                    }
                }
            } catch (error) {
                console.error("Error fetching artists:", error);
            }
            setLoading(false);
        }
        fetchArtists();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleSelect(artist: ArtistData) {
        updateBookingData({
            artistId: artist.id,
            artistName: artist.name,
        });
        // Auto-advance after a short delay for UX
        setTimeout(() => onNext(), 200);
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <p className={styles.title}>טוען...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>בחרי אמנית</h2>
            <p className={styles.subtitle}>בחרי את האמנית הרצויה לטיפול</p>

            <div className={styles.artistList}>
                {artists.map((artist) => (
                    <div
                        key={artist.id}
                        className={`${styles.artistCard} ${bookingData.artistId === artist.id ? styles.selected : ""}`}
                        onClick={() => handleSelect(artist)}
                    >
                        <div className={styles.artistAvatar}>💅</div>
                        <div className={styles.artistInfo}>
                            <div className={styles.artistName}>{artist.name}</div>
                            <div className={styles.artistServices}>
                                {artist.serviceIds.length} שירותים זמינים
                            </div>
                        </div>
                        <div className={styles.checkmark}>
                            {bookingData.artistId === artist.id && <CheckIcon size={14} />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
