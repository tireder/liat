import Link from "next/link";
import { CalendarIcon } from "@/components/icons";

export default function NotFound() {
    return (
        <main
            id="main"
            style={{
                minHeight: "100dvh",
                display: "grid",
                placeItems: "center",
                padding: "2rem var(--container-padding)",
                background: "var(--bg)",
                textAlign: "center",
            }}
        >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", maxWidth: 520 }}>
                <span className="eyebrow">404</span>
                <h1 className="display" style={{ fontSize: "clamp(2rem, 6vw, 3.2rem)" }}>
                    העמוד הזה לא נמצא
                </h1>
                <p style={{ color: "var(--ink-muted)", lineHeight: 1.7 }}>
                    ייתכן שהקישור השתנה או שהעמוד הוסר. אפשר לחזור לדף הבית או לקבוע תור ישירות.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", marginTop: "0.5rem" }}>
                    <Link href="/" className="btn btn-secondary">
                        לדף הבית
                    </Link>
                    <Link href="/book" className="btn btn-primary">
                        <CalendarIcon size={16} />
                        קביעת תור
                    </Link>
                </div>
            </div>
        </main>
    );
}
