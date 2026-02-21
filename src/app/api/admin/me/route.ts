import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

// GET /api/admin/me - Get current user's artist profile and role
export async function GET() {
    try {
        const serverClient = await createClient();
        const { data: { user } } = await serverClient.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const supabase = createAdminClient();
        const { data: artist, error } = await supabase
            .from("nail_artists")
            .select("id, name, phone, role, active, calendar_token")
            .eq("auth_user_id", user.id)
            .single();

        if (error || !artist) {
            return NextResponse.json({ error: "Artist profile not found" }, { status: 404 });
        }

        return NextResponse.json({
            artistId: artist.id,
            name: artist.name,
            phone: artist.phone,
            role: artist.role,
            calendarToken: artist.calendar_token,
        });
    } catch (error) {
        console.error("Error fetching artist profile:", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}
