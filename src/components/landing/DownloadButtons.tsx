"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";
import styles from "./DownloadButtons.module.css";

type Platform = "ios" | "android" | "desktop";

export default function DownloadButtons() {
    const [platform, setPlatform] = useState<Platform | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        function detect() {
            const ua = navigator.userAgent || navigator.vendor || "";
            if (/android/i.test(ua)) setPlatform("android");
            else if (/iPad|iPhone|iPod/.test(ua)) setPlatform("ios");
            else setPlatform("desktop");
        }
        detect();
    }, []);

    // Reserve height until the platform is known to avoid layout shift
    if (!platform) return <div className={styles.placeholder} aria-hidden="true" />;

    const showIos = platform === "ios" || platform === "desktop";
    const showAndroid = platform === "android" || platform === "desktop";

    return (
        <div className={styles.row}>
            {showIos && (
                <button
                    type="button"
                    className={styles.badge}
                    onClick={() => showToast("הקישור ל-App Store יתפרסם בקרוב", "info")}
                    aria-label="הורדה מ-App Store"
                >
                    <Image src="/images/apple.png" alt="" width={280} height={83} className={styles.badgeImg} unoptimized />
                </button>
            )}
            {showAndroid && (
                <button
                    type="button"
                    className={styles.badge}
                    onClick={() => showToast("הקישור ל-Google Play יתפרסם בקרוב", "info")}
                    aria-label="הורדה מ-Google Play"
                >
                    <Image src="/images/google.png" alt="" width={280} height={83} className={styles.badgeImg} unoptimized />
                </button>
            )}
        </div>
    );
}
