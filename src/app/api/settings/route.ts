import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export type SiteSettings = {
    phone: string;
    address: string;
    whatsapp: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    cancelHoursBefore: number;
    bufferMinutes: number;
    operatingHours: {
        dayOfWeek: number;
        openTime: string | null;
        closeTime: string | null;
        active: boolean;
    }[];
};

// GET /api/settings - Public endpoint for landing page
export async function GET() {
    try {
        const supabase = createAdminClient();

        const [{ data: settings, error: settingsError }, { data: operatingHours, error: hoursError }] = await Promise.all([
            supabase.from("settings").select("*"),
            supabase.from("operating_hours").select("*").order("day_of_week"),
        ]);

        if (settingsError) {
            console.error("Settings error:", settingsError);
        }
        if (hoursError) {
            console.error("Hours error:", hoursError);
        }

        // Convert settings array to map
        const settingsMap: Record<string, string> = {};
        settings?.forEach((s: { key: string; value: string }) => {
            settingsMap[s.key] = s.value;
        });

        // Build response with defaults
        const response: SiteSettings = {
            phone: settingsMap.phone || "050-123-4567",
            address: settingsMap.address || "רחוב הרצל 50, תל אביב",
            whatsapp: settingsMap.whatsapp || settingsMap.phone || "972501234567",
            instagram: settingsMap.instagram || "https://instagram.com",
            facebook: settingsMap.facebook || "https://facebook.com",
            tiktok: settingsMap.tiktok || "https://tiktok.com",
            cancelHoursBefore: parseInt(settingsMap.cancel_hours_before || "24"),
            bufferMinutes: parseInt(settingsMap.buffer_minutes || "15"),
            operatingHours: (operatingHours || []).map((h: { day_of_week: number; open_time: string | null; close_time: string | null; active: boolean }) => ({
                dayOfWeek: h.day_of_week,
                openTime: h.open_time,
                closeTime: h.close_time,
                active: h.active,
            })),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching public settings:", error);
        // Return defaults on error so the page still works
        return NextResponse.json({
            phone: "050-123-4567",
            address: "רחוב הרצל 50, תל אביב",
            whatsapp: "972501234567",
            instagram: "https://instagram.com",
            facebook: "https://facebook.com",
            tiktok: "https://tiktok.com",
            cancelHoursBefore: 24,
            bufferMinutes: 15,
            operatingHours: [],
        });
    }
}
