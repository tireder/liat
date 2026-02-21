"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from "react";
import styles from "./Toast.module.css";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    exiting?: boolean;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            timersRef.current.forEach(timer => clearTimeout(timer));
        };
    }, []);

    const removeToast = useCallback((id: string) => {
        // First mark as exiting for animation
        setToasts((prev) => prev.map((t) =>
            t.id === id ? { ...t, exiting: true } : t
        ));

        // Then remove after animation
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
    }, []);

    const showToast = useCallback((message: string, type: ToastType = "info", duration: number = 3000) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-remove after duration
        const timer = setTimeout(() => {
            removeToast(id);
            timersRef.current.delete(id);
        }, duration);

        timersRef.current.set(id, timer);
    }, [removeToast]);

    const handleDismiss = (id: string) => {
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
        removeToast(id);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={styles.container}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`${styles.toast} ${styles[toast.type]} ${toast.exiting ? styles.exiting : ""}`}
                        onClick={() => handleDismiss(toast.id)}
                        role="alert"
                        aria-live="polite"
                    >
                        <span className={styles.icon}>
                            {toast.type === "success" && "✓"}
                            {toast.type === "error" && "✕"}
                            {toast.type === "info" && "ℹ"}
                            {toast.type === "warning" && "⚠"}
                        </span>
                        <span className={styles.message}>{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
