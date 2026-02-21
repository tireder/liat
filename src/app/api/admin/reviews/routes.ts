import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/reviews - Get all reviews for moderation
export async function GET() {
    try {
        const supabase = createAdminClient();

        const { data: reviews, error } = await supabase
            .from("reviews")
            .select(`
                id,
                rating,
                comment,
                approved,
                public,
                created_at,
                client:clients(name, phone),
                booking:bookings(date, service:services(name))
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json(reviews || []);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}

// PUT /api/admin/reviews - Update review (approve/reject)
export async function PUT(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { id, approved, public: isPublic } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Review ID required" }, { status: 400 });
        }

        const updateData: Record<string, boolean> = {};
        if (approved !== undefined) updateData.approved = approved;
        if (isPublic !== undefined) updateData.public = isPublic;

        const { data, error } = await supabase
            .from("reviews")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating review:", error);
        return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
    }
}

// DELETE /api/admin/reviews - Delete a review
export async function DELETE(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Review ID required" }, { status: 400 });
        }

        const { error } = await supabase
            .from("reviews")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting review:", error);
        return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
    }
}
