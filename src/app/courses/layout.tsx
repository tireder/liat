import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "קורסים | ליאת",
    description: "קורסים מקצועיים לציפורניים - ליאת nail artist",
};

export default function CoursesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
