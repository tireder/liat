"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import styles from "./AccessibilityWidget.module.css";

interface AccessibilitySettings {
    fontSize: number; // 0 = normal, 1 = large, 2 = extra large
    highContrast: boolean;
    grayscale: boolean;
    linkHighlight: boolean;
}

const defaultSettings: AccessibilitySettings = {
    fontSize: 0,
    highContrast: false,
    grayscale: false,
    linkHighlight: false,
};

export default function AccessibilityWidget() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

    // Hide on admin pages
    const isAdminPage = pathname?.startsWith("/admin");

    if (isAdminPage) {
        return null;
    }

    // Load settings from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("accessibility");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSettings(parsed);
                applySettings(parsed);
            } catch { /* ignore */ }
        }
    }, []);

    // Apply settings to document
    const applySettings = (s: AccessibilitySettings) => {
        const html = document.documentElement;

        // Font size
        html.classList.remove("font-large", "font-xlarge");
        if (s.fontSize === 1) html.classList.add("font-large");
        if (s.fontSize === 2) html.classList.add("font-xlarge");

        // High contrast
        html.classList.toggle("high-contrast", s.highContrast);

        // Grayscale
        html.classList.toggle("grayscale", s.grayscale);

        // Link highlight
        html.classList.toggle("link-highlight", s.linkHighlight);
    };

    const updateSetting = <K extends keyof AccessibilitySettings>(
        key: K,
        value: AccessibilitySettings[K]
    ) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        applySettings(newSettings);
        localStorage.setItem("accessibility", JSON.stringify(newSettings));
    };

    const resetAll = () => {
        setSettings(defaultSettings);
        applySettings(defaultSettings);
        localStorage.removeItem("accessibility");
    };

    const increaseFontSize = () => {
        if (settings.fontSize < 2) {
            updateSetting("fontSize", settings.fontSize + 1 as 0 | 1 | 2);
        }
    };

    const decreaseFontSize = () => {
        if (settings.fontSize > 0) {
            updateSetting("fontSize", settings.fontSize - 1 as 0 | 1 | 2);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                className={styles.floatingBtn}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="תפריט נגישות"
                aria-expanded={isOpen}
            >
                <AccessibilityIcon />
            </button>

            {/* Menu */}
            {isOpen && (
                <>
                    <div className={styles.overlay} onClick={() => setIsOpen(false)} />
                    <div className={styles.menu} role="dialog" aria-label="הגדרות נגישות">
                        <div className={styles.menuHeader}>
                            <h3>נגישות</h3>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setIsOpen(false)}
                                aria-label="סגור"
                            >
                                ✕
                            </button>
                        </div>

                        <div className={styles.menuContent}>
                            {/* Font Size */}
                            <div className={styles.option}>
                                <span className={styles.optionLabel}>גודל טקסט</span>
                                <div className={styles.fontControls}>
                                    <button
                                        onClick={decreaseFontSize}
                                        disabled={settings.fontSize === 0}
                                        aria-label="הקטן טקסט"
                                    >
                                        א-
                                    </button>
                                    <span>{settings.fontSize === 0 ? "רגיל" : settings.fontSize === 1 ? "גדול" : "גדול מאוד"}</span>
                                    <button
                                        onClick={increaseFontSize}
                                        disabled={settings.fontSize === 2}
                                        aria-label="הגדל טקסט"
                                    >
                                        א+
                                    </button>
                                </div>
                            </div>

                            {/* High Contrast */}
                            <button
                                className={`${styles.toggleOption} ${settings.highContrast ? styles.active : ""}`}
                                onClick={() => updateSetting("highContrast", !settings.highContrast)}
                            >
                                <span>ניגודיות גבוהה</span>
                                <span className={styles.toggleIndicator}>{settings.highContrast ? "פעיל" : "כבוי"}</span>
                            </button>

                            {/* Grayscale */}
                            <button
                                className={`${styles.toggleOption} ${settings.grayscale ? styles.active : ""}`}
                                onClick={() => updateSetting("grayscale", !settings.grayscale)}
                            >
                                <span>גווני אפור</span>
                                <span className={styles.toggleIndicator}>{settings.grayscale ? "פעיל" : "כבוי"}</span>
                            </button>

                            {/* Link Highlight */}
                            <button
                                className={`${styles.toggleOption} ${settings.linkHighlight ? styles.active : ""}`}
                                onClick={() => updateSetting("linkHighlight", !settings.linkHighlight)}
                            >
                                <span>הדגשת קישורים</span>
                                <span className={styles.toggleIndicator}>{settings.linkHighlight ? "פעיל" : "כבוי"}</span>
                            </button>

                            {/* Reset */}
                            <button className={styles.resetBtn} onClick={resetAll}>
                                איפוס הכל
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

function AccessibilityIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="4" r="2" fill="currentColor" />
            <path d="M12 6V10M12 10L8 22M12 10L16 22M12 10H7M12 10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
