import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import AccessibilityWidget from "@/components/ui/AccessibilityWidget";
import PwaPrompt from "@/components/ui/PwaPrompt";
import MyBookingsWidget from "@/components/ui/MyBookingsWidget";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1a1a2e",
};

export const metadata: Metadata = {
  title: "ליאת | nail artist",
  description: "ליאת - מומחית לציפורניים. קביעת תורים וקורסים מקצועיים",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ליארט",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    title: "ליארט | סלון ציפורניים",
    description: "סלון ציפורניים מקצועי - קביעת תורים וקורסים",
    locale: "he_IL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.variable} antialiased`}>
        {children}
        <AccessibilityWidget />
        <PwaPrompt />
        <MyBookingsWidget />
      </body>
    </html>
  );
}
