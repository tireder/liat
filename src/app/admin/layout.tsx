import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#1a1a2e",
};

export const metadata: Metadata = {
    title: "ניהול | ליאת ציפורנים",
    description: "פאנל ניהול - ליאת ציפורנים",
    manifest: "/manifest-admin.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "ליאת - ניהול",
    },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
