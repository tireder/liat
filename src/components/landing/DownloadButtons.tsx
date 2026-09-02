"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function DownloadButtons() {
    const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | null>(null);

    useEffect(() => {
        // Basic user agent detection
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        if (/android/i.test(userAgent)) {
            setPlatform("android");
        } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
            setPlatform("ios");
        } else {
            setPlatform("desktop");
        }
    }, []);

    // Avoid hydration mismatch by not rendering until platform is known
    if (!platform) return <div className="h-14" />; // Placeholder height

    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end items-center mt-8">
            {(platform === "ios" || platform === "desktop") && (
                <button
                    className="transition-transform hover:scale-105 active:scale-95"
                    onClick={() => alert("App Store link coming soon!")}
                    aria-label="Download on the App Store"
                >
                    <Image
                        src="/images/apple.png"
                        alt="Download on the App Store"
                        width={280}
                        height={83}
                        className="h-[170] w-auto"
                        unoptimized
                    />
                </button>
            )}

            {(platform === "android" || platform === "desktop") && (
                <button
                    className="transition-transform hover:scale-105 active:scale-95"
                    onClick={() => alert("Google Play link coming soon!")}
                    aria-label="Get it on Google Play"
                >
                    <Image
                        src="/images/google.png"
                        alt="Get it on Google Play"
                        width={280}
                        height={83}
                        className="h-[187px] w-auto"
                        unoptimized
                    />
                </button>
            )}
        </div>
    );
}
