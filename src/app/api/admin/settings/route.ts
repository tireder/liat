import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/settings
export async function GET() {
    try {
        const supabase = createAdminClient();

        const [{ data: settings, error: settingsError }, { data: operatingHours, error: hoursError }] = await Promise.all([
            supabase.from("settings").select("*"),
            supabase.from("operating_hours").select("*").order("day_of_week"),
        ]);

        if (settingsError) console.error("Settings error:", settingsError);
        if (hoursError) console.error("Hours error:", hoursError);

        const settingsMap: Record<string, string> = {};
        settings?.forEach((s: { key: string; value: string }) => {
            settingsMap[s.key] = s.value;
        });

        return NextResponse.json({ settings: settingsMap, operatingHours: operatingHours || [] });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

// PUT /api/admin/settings
export async function PUT(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { settings, operatingHours } = body;

        // Update settings
        if (settings && typeof settings === "object") {
            for (const [key, value] of Object.entries(settings)) {
                // Check if exists
                const { data: existing } = await supabase
                    .from("settings")
                    .select("key")
                    .eq("key", key)
                    .single();

                if (existing) {
                    const { error } = await supabase
                        .from("settings")
                        .update({ value: String(value), updated_at: new Date().toISOString() })
                        .eq("key", key);
                    if (error) console.error("Update setting error:", error);
                } else {
                    const { error } = await supabase
                        .from("settings")
                        .insert({ key, value: String(value) });
                    if (error) console.error("Insert setting error:", error);
                }
            }
        }

        // Update operating hours
        if (operatingHours && Array.isArray(operatingHours)) {
            for (const hours of operatingHours) {
                const { data: existing } = await supabase
                    .from("operating_hours")
                    .select("id")
                    .eq("day_of_week", hours.day_of_week)
                    .single();

                if (existing) {
                    const { error } = await supabase
                        .from("operating_hours")
                        .update({
                            open_time: hours.open_time,
                            close_time: hours.close_time,
                            active: hours.active ?? true,
                        })
                        .eq("day_of_week", hours.day_of_week);
                    if (error) console.error("Update hours error:", error);
                } else {
                    const { error } = await supabase
                        .from("operating_hours")
                        .insert({
                            day_of_week: hours.day_of_week,
                            open_time: hours.open_time,
                            close_time: hours.close_time,
                            active: hours.active ?? true,
                        });
                    if (error) console.error("Insert hours error:", error);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
