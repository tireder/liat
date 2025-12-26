"use client";

import { useState, useEffect } from "react";
import { XIcon } from "@/components/icons";
import styles from "./PwaPrompt.module.css";

export default function PwaPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if already dismissed
        const isDismissed = localStorage.getItem("pwa_prompt_dismissed");
        if (isDismissed) {
            setDismissed(true);
            return;
        }

        // Check if already in PWA/standalone mode
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
        const isIOSStandalone = ("standalone" in window.navigator) && (window.navigator as Navigator & { standalone: boolean }).standalone;

        if (isStandalone || isIOSStandalone) {
            return;
        }

        // Check if mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            // Show prompt after a short delay
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setShowPrompt(false);
        setDismissed(true);
        // Dismiss for 7 days
        localStorage.setItem("pwa_prompt_dismissed", Date.now().toString());
    };

    const handleInstall = () => {
        // For iOS, open instructions
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isIOS) {
            alert("להוספה למסך הבית:\n\n1. לחצי על כפתור השיתוף (בתחתית המסך)\n2. גללי למטה ובחרי \"הוסף למסך הבית\"");
        } else {
            // For Android, show instructions
            alert("להוספה למסך הבית:\n\n1. לחצי על תפריט הדפדפן (שלוש נקודות)\n2. בחרי \"התקן אפליקציה\" או \"הוסף למסך הבית\"");
        }

        handleDismiss();
    };

    if (!showPrompt || dismissed) {
        return null;
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.prompt}>
                <button className={styles.closeBtn} onClick={handleDismiss}>
                    <XIcon size={20} />
                </button>

                <div className={styles.icon}>💅</div>

                <h3 className={styles.title}>הוסיפי לאפליקציות!</h3>
                <p className={styles.description}>
                    התקיני את האפליקציה למסך הבית לגישה מהירה ונוחה
                </p>

                <div className={styles.actions}>
                    <button className={styles.installBtn} onClick={handleInstall}>
                        הוסיפי לתליקציות
                    </button>
                    <button className={styles.laterBtn} onClick={handleDismiss}>
                        אולי אחר כך
                    </button>
                </div>
            </div>
        </div>
    );
}
