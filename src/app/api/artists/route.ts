import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/artists - Public list of active artists with their service IDs
export async function GET() {
    try {
        const supabase = createAdminClient();

        const { data: artists, error } = await supabase
            .from("nail_artists")
            .select("id, name, sort_order")
            .eq("active", true)
            .order("sort_order", { ascending: true });

        if (error) throw error;

        // Get service assignments for each artist
        const { data: assignments } = await supabase
            .from("artist_services")
            .select("artist_id, service_id");

        const artistsWithServices = (artists || []).map((artist) => ({
            ...artist,
            serviceIds: (assignments || [])
                .filter((a) => a.artist_id === artist.id)
                .map((a) => a.service_id),
        }));

        return NextResponse.json(artistsWithServices);
    } catch (error) {
        console.error("Error fetching artists:", error);
        return NextResponse.json({ error: "Failed to fetch artists" }, { status: 500 });
    }
}
