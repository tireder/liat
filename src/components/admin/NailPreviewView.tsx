"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./NailPreviewView.module.css";

interface NailColor {
    id: string;
    name: string;
    hex_color: string;
    brand: string | null;
}

interface ColorManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onColorsChange: () => void;
}

export function ColorManager({ isOpen, onClose, onColorsChange }: ColorManagerProps) {
    const [colors, setColors] = useState<NailColor[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingColor, setEditingColor] = useState<NailColor | null>(null);
    const [formData, setFormData] = useState({ name: "", hex_color: "#FF0000", brand: "" });
    const [saving, setSaving] = useState(false);

    const fetchColors = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/nail-colors");
            if (res.ok) {
                const data = await res.json();
                setColors(data);
            }
        } catch (error) {
            console.error("Error fetching colors:", error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isOpen) fetchColors();
    }, [isOpen, fetchColors]);

    function openAddForm() {
        setEditingColor(null);
        setFormData({ name: "", hex_color: "#FF0000", brand: "" });
    }

    function openEditForm(color: NailColor) {
        setEditingColor(color);
        setFormData({
            name: color.name,
            hex_color: color.hex_color,
            brand: color.brand || "",
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.name || !formData.hex_color) return;

        setSaving(true);
        try {
            const method = editingColor ? "PUT" : "POST";
            const body = editingColor
                ? { id: editingColor.id, ...formData }
                : formData;

            const res = await fetch("/api/admin/nail-colors", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                await fetchColors();
                onColorsChange();
                setFormData({ name: "", hex_color: "#FF0000", brand: "" });
                setEditingColor(null);
            }
        } catch (error) {
            console.error("Error saving color:", error);
        }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("למחוק את הצבע?")) return;
        try {
            const res = await fetch(`/api/admin/nail-colors?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                await fetchColors();
                onColorsChange();
            }
        } catch (error) {
            console.error("Error deleting color:", error);
        }
    }

    if (!isOpen) return null;

    return (
        <div className={styles.managerOverlay} onClick={onClose}>
            <div className={styles.managerModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.managerHeader}>
                    <h2>ניהול צבעים</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.managerContent}>
                    {/* Add/Edit Form */}
                    <form onSubmit={handleSubmit} className={styles.colorForm}>
                        <div className={styles.formRow}>
                            <input
                                type="color"
                                value={formData.hex_color}
                                onChange={(e) => setFormData(f => ({ ...f, hex_color: e.target.value }))}
                                className={styles.colorPicker}
                            />
                            <input
                                type="text"
                                placeholder="שם הצבע"
                                value={formData.name}
                                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                                className={styles.textInput}
                                required
                            />
                            <input
                                type="text"
                                placeholder="מותג (אופציונלי)"
                                value={formData.brand}
                                onChange={(e) => setFormData(f => ({ ...f, brand: e.target.value }))}
                                className={styles.textInput}
                            />
                            <button type="submit" className={styles.addBtn} disabled={saving}>
                                {editingColor ? "עדכון" : "הוסף"}
                            </button>
                        </div>
                    </form>

                    {/* Color List */}
                    {loading ? (
                        <div className={styles.loading}>טוען...</div>
                    ) : (
                        <div className={styles.colorList}>
                            {colors.map((color) => (
                                <div key={color.id} className={styles.colorItem}>
                                    <div
                                        className={styles.colorSwatch}
                                        style={{ backgroundColor: color.hex_color }}
                                    />
                                    <div className={styles.colorInfo}>
                                        <span className={styles.colorName}>{color.name}</span>
                                        {color.brand && (
                                            <span className={styles.colorBrand}>{color.brand}</span>
                                        )}
                                    </div>
                                    <div className={styles.colorActions}>
                                        <button
                                            className={styles.editBtn}
                                            onClick={() => openEditForm(color)}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDelete(color.id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {colors.length === 0 && (
                                <p className={styles.emptyMessage}>אין צבעים. הוסיפי את הצבעים הראשונים!</p>
                            )}
                        </div>
                    )}
                </div>

                <button className={styles.addNewBtn} onClick={openAddForm}>
                    + הוסף צבע חדש
                </button>
            </div>
        </div>
    );
}

export default function NailPreviewView() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const handsRef = useRef<any>(null);
    const animationIdRef = useRef<number>(0);
    const facingModeRef = useRef<"user" | "environment">("environment");
    const selectedColorRef = useRef<NailColor | null>(null);

    const [colors, setColors] = useState<NailColor[]>([]);
    const [selectedColor, setSelectedColor] = useState<NailColor | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [handDetected, setHandDetected] = useState(false);
    const [showManager, setShowManager] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    // Keep ref in sync with state
    useEffect(() => {
        selectedColorRef.current = selectedColor;
    }, [selectedColor]);

    // Fetch colors
    const fetchColors = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/nail-colors");
            if (res.ok) {
                const data = await res.json();
                setColors(data);
                if (data.length > 0 && !selectedColorRef.current) {
                    setSelectedColor(data[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching colors:", error);
        }
    }, []);

    useEffect(() => {
        fetchColors();
    }, [fetchColors]);

    // Initialize camera
    const initCamera = useCallback(async (mode: "user" | "environment") => {
        try {
            // Stop existing stream
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setCameraError(null);
        } catch (error) {
            console.error("Camera error:", error);
            setCameraError("לא ניתן לגשת למצלמה. אנא אשרי גישה.");
        }
    }, []);

    // Initialize camera on mount (back camera only)
    useEffect(() => {
        initCamera("environment");

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []); // Only on mount

    // Initialize MediaPipe Hands (only once)
    useEffect(() => {
        async function initMediaPipe() {
            try {
                const { Hands } = await import("@mediapipe/hands");

                const hands = new Hands({
                    locateFile: (file: string) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                    },
                });

                hands.setOptions({
                    maxNumHands: 2,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });

                hands.onResults(onResults);
                handsRef.current = hands;

                setIsLoading(false);

                // Process frames
                function processFrame() {
                    if (videoRef.current && handsRef.current && videoRef.current.readyState >= 2) {
                        handsRef.current.send({ image: videoRef.current }).catch(() => {
                            // Ignore errors during camera switching
                        });
                    }
                    animationIdRef.current = requestAnimationFrame(processFrame);
                }
                processFrame();
            } catch (error) {
                console.error("MediaPipe error:", error);
                setIsLoading(false);
            }
        }

        function onResults(results: any) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            if (!canvas || !video || video.videoWidth === 0) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw video (use ref for current facingMode)
            ctx.save();
            if (facingModeRef.current === "user") {
                ctx.scale(-1, 1);
                ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            } else {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            }
            ctx.restore();

            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                setHandDetected(true);

                // Draw color overlay on fingertips (use ref for current color)
                const color = selectedColorRef.current;
                if (color) {
                    results.multiHandLandmarks.forEach((landmarks: any) => {
                        // Fingertip, DIP, and PIP joint for better nail positioning
                        // [tip, dip, pip, isThumb]
                        const fingerData = [
                            { tip: 4, dip: 3, pip: 2, isThumb: true },
                            { tip: 8, dip: 7, pip: 6, isThumb: false },
                            { tip: 12, dip: 11, pip: 10, isThumb: false },
                            { tip: 16, dip: 15, pip: 14, isThumb: false },
                            { tip: 20, dip: 19, pip: 18, isThumb: false },
                        ];

                        fingerData.forEach(({ tip: tipIdx, dip: dipIdx, pip: pipIdx, isThumb }) => {
                            const tip = landmarks[tipIdx];
                            const dip = landmarks[dipIdx];
                            const pip = landmarks[pipIdx];

                            // Nail is on top of fingertip, between tip and DIP
                            // Position nail center halfway between tip and DIP
                            const nailCenterX = (tip.x * 0.5 + dip.x * 0.5) * canvas.width;
                            const nailCenterY = (tip.y * 0.5 + dip.y * 0.5) * canvas.height;

                            let x = nailCenterX;
                            let y = nailCenterY;

                            if (facingModeRef.current === "user") {
                                x = canvas.width - x;
                            }

                            // Calculate finger direction for nail rotation
                            const dx = tip.x - dip.x;
                            const dy = tip.y - dip.y;
                            const angle = Math.atan2(dy, dx) + Math.PI / 2;

                            // Calculate finger segment length for sizing
                            const segmentLen = Math.sqrt(dx * dx + dy * dy) * canvas.width;

                            // Estimate finger width from PIP-DIP distance
                            const pipDx = dip.x - pip.x;
                            const pipDy = dip.y - pip.y;
                            const fingerWidth = Math.sqrt(pipDx * pipDx + pipDy * pipDy) * canvas.width;

                            // Nail dimensions - larger for better visibility
                            let nailWidth, nailHeight;
                            if (isThumb) {
                                nailWidth = Math.max(14, Math.min(22, fingerWidth * 0.7));
                                nailHeight = Math.max(16, Math.min(24, segmentLen * 0.55));
                            } else {
                                nailWidth = Math.max(10, Math.min(18, fingerWidth * 0.6));
                                nailHeight = Math.max(12, Math.min(20, segmentLen * 0.5));
                            }

                            // Draw nail base (slightly darker, for depth)
                            ctx.save();
                            ctx.globalAlpha = 0.5;
                            ctx.fillStyle = color.hex_color;
                            ctx.beginPath();
                            ctx.ellipse(x, y + 2, nailWidth + 2, nailHeight + 2, angle, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.restore();

                            // Draw main nail color
                            ctx.save();
                            ctx.globalAlpha = 0.8;
                            ctx.fillStyle = color.hex_color;
                            ctx.beginPath();
                            ctx.ellipse(x, y, nailWidth, nailHeight, angle, 0, Math.PI * 2);
                            ctx.fill();

                            // Add glossy shine effect (top-left highlight)
                            const shineOffsetX = Math.cos(angle - Math.PI / 4) * nailWidth * 0.25;
                            const shineOffsetY = Math.sin(angle - Math.PI / 4) * nailHeight * 0.25;
                            ctx.globalAlpha = 0.4;
                            ctx.fillStyle = "#FFFFFF";
                            ctx.beginPath();
                            ctx.ellipse(
                                x + shineOffsetX,
                                y + shineOffsetY,
                                nailWidth * 0.35,
                                nailHeight * 0.3,
                                angle,
                                0,
                                Math.PI * 2
                            );
                            ctx.fill();
                            ctx.restore();
                        });
                    });
                }
            } else {
                setHandDetected(false);
            }
        }

        initMediaPipe();

        return () => {
            if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
            if (handsRef.current) handsRef.current.close();
        };
    }, []); // Only on mount

    function handleColorSelect(color: NailColor, index: number) {
        // If same color is tapped again, capture photo (Instagram-style)
        if (selectedColor?.id === color.id) {
            capturePhoto();
            return;
        }
        setSelectedColor(color);
        // Don't scroll - let user control the scroll position
    }

    // Capture photo function
    function capturePhoto() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
    }

    function downloadPhoto() {
        if (!capturedImage) return;

        const link = document.createElement('a');
        link.download = `nail-preview-${Date.now()}.png`;
        link.href = capturedImage;
        link.click();
    }

    function closePreview() {
        setCapturedImage(null);
    }

    return (
        <div className={styles.container}>
            {/* Camera View */}
            <div className={styles.cameraContainer}>
                {cameraError ? (
                    <div className={styles.error}>
                        <span>📷</span>
                        <p>{cameraError}</p>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={styles.video}
                            style={{ display: "none" }}
                        />
                        <canvas ref={canvasRef} className={styles.canvas} />

                        {isLoading && (
                            <div className={styles.loadingOverlay}>
                                <div className={styles.spinner} />
                                <p>טוען זיהוי יד...</p>
                            </div>
                        )}

                        {!isLoading && !handDetected && (
                            <div className={styles.hint}>
                                ✋ הראי את היד למצלמה
                            </div>
                        )}
                    </>
                )}

                {/* Top toolbar */}
                <div className={styles.toolbar}>
                    <button className={styles.toolbarBtn} onClick={() => setShowManager(true)} title="ניהול צבעים">
                        ⚙️
                    </button>
                </div>
            </div>

            {/* Instagram-style color picker */}
            <div className={styles.colorPickerContainer}>
                {selectedColor && (
                    <div className={styles.selectedColorLabel}>
                        <span className={styles.colorName}>{selectedColor.name}</span>
                        {selectedColor.brand && (
                            <span className={styles.brandName}>{selectedColor.brand}</span>
                        )}
                    </div>
                )}

                <div className={styles.colorScroll} ref={scrollRef}>
                    <div className={styles.colorTrack}>
                        {colors.map((color, index) => (
                            <button
                                key={color.id}
                                className={`${styles.colorSwatch} ${selectedColor?.id === color.id ? styles.selected : ""}`}
                                style={{ backgroundColor: color.hex_color }}
                                onClick={() => handleColorSelect(color, index)}
                                title={color.name}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Color Manager Modal */}
            <ColorManager
                isOpen={showManager}
                onClose={() => setShowManager(false)}
                onColorsChange={fetchColors}
            />

            {/* Captured Image Preview Modal */}
            {capturedImage && (
                <div className={styles.managerOverlay} onClick={closePreview}>
                    <div className={styles.captureModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.managerHeader}>
                            <h2>תצוגה מקדימה</h2>
                            <button className={styles.closeBtn} onClick={closePreview}>✕</button>
                        </div>
                        <img src={capturedImage} alt="Nail preview" className={styles.capturedImage} />
                        <div className={styles.captureActions}>
                            <button className={styles.downloadBtn} onClick={downloadPhoto}>
                                📥 הורד תמונה
                            </button>
                            <button className={styles.retakeBtn} onClick={closePreview}>
                                🔄 צלם שוב
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
