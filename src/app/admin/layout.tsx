import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "ניהול | ליאת",
    description: "פאנל ניהול - ליאת nail artist",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
