import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/gallery - Get all active gallery images
export async function GET() {
    try {
        const supabase = createAdminClient();

        const { data: images, error } = await supabase
            .from("gallery_images")
            .select("*")
            .eq("active", true)
            .order("sort_order", { ascending: true });

        if (error) {
            console.error("Error fetching gallery:", error);
            throw error;
        }

        return NextResponse.json(images || []);
    } catch (error) {
        console.error("Gallery error:", error);
        return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
    }
}
