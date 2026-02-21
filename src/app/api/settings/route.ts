import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

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
    // Admin only fields
    calendar_token?: string;
    otp_method?: "supabase" | "sms4free";
    sms_sender?: string;
};

// GET /api/settings - Public (limited) or Admin (full)
export async function GET() {
    try {
        const supabaseAdmin = createAdminClient();
        const supabaseAuth = await createClient(); // For checking session

        // Check if user is authenticated (admin)
        const { data: { session } } = await supabaseAuth.auth.getSession();
        const isAdmin = !!session;

        const [{ data: settings, error: settingsError }, { data: operatingHours, error: hoursError }] = await Promise.all([
            supabaseAdmin.from("settings").select("*"),
            supabaseAdmin.from("operating_hours").select("*").order("day_of_week"),
        ]);

        if (settingsError) console.error("Settings error:", settingsError);
        if (hoursError) console.error("Hours error:", hoursError);

        // Convert settings array to map
        const settingsMap: Record<string, string> = {};
        settings?.forEach((s: { key: string; value: string }) => {
            settingsMap[s.key] = s.value;
        });

        // Build response
        const response: SiteSettings = {
            phone: settingsMap.phone || "",
            address: settingsMap.address || "",
            whatsapp: settingsMap.whatsapp || settingsMap.phone || "",
            instagram: settingsMap.instagram || "",
            facebook: settingsMap.facebook || "",
            tiktok: settingsMap.tiktok || "",
            cancelHoursBefore: parseInt(settingsMap.cancel_hours_before || "24"),
            bufferMinutes: parseInt(settingsMap.buffer_minutes || "15"),
            operatingHours: (operatingHours || []).map((h: { day_of_week: number; open_time: string | null; close_time: string | null; active: boolean }) => ({
                dayOfWeek: h.day_of_week,
                openTime: h.open_time,
                closeTime: h.close_time,
                active: h.active,
            })),
        };

        if (isAdmin) {
            response.calendar_token = settingsMap.calendar_token || "";
            response.otp_method = (settingsMap.otp_method as "supabase" | "sms4free") || "sms4free";
            response.sms_sender = settingsMap.sms_sender || "";
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching settings:", error);
        // Return public defaults
        return NextResponse.json({
            phone: "",
            address: "",
            whatsapp: "",
            instagram: "",
            facebook: "",
            tiktok: "",
            cancelHoursBefore: 24,
            bufferMinutes: 15,
            operatingHours: [],
        });
    }
}

// POST /api/settings - Update settings (Admin only)
export async function POST(req: NextRequest) {
    try {
        const supabaseAuth = await createClient();
        const { data: { session } } = await supabaseAuth.auth.getSession();

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const supabase = createAdminClient();

        // Update settings table
        // Handles flat key-values including operatingHours special case
        const updates = [];
        const settingsKeys = [
            "phone", "address", "whatsapp", "instagram", "facebook", "tiktok",
            "cancel_hours_before", "buffer_minutes", "calendar_token", "otp_method", "sms_sender"
        ];

        // Map camelCase to snake_case where needed or custom logic
        const keyMap: Record<string, string> = {
            cancelHoursBefore: "cancel_hours_before",
            bufferMinutes: "buffer_minutes",
            calendarToken: "calendar_token",
            otpMethod: "otp_method",
            smsSender: "sms_sender"
        };

        for (const [key, value] of Object.entries(body)) {
            if (key === "operatingHours") continue; // Handled separately

            const dbKey = keyMap[key] || key;
            if (settingsKeys.includes(dbKey)) {
                updates.push(
                    supabase.from("settings").upsert({ key: dbKey, value: String(value) })
                );
            }
        }

        if (updates.length > 0) {
            await Promise.all(updates);
        }

        // Update operating hours
        if (body.operatingHours && Array.isArray(body.operatingHours)) {
            const hoursUpdates = body.operatingHours.map((h: any) => ({
                day_of_week: h.dayOfWeek,
                open_time: h.openTime || null,
                close_time: h.closeTime || null,
                active: h.active
            }));

            await supabase.from("operating_hours").upsert(hoursUpdates, { onConflict: "day_of_week" });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating settings:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
