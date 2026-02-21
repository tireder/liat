import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "קביעת תור | ליאת",
    description: "קביעת תור לטיפול ציפורניים אצל ליאת",
};

export default function BookingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
