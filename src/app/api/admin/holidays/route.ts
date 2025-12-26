import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/holidays - Get all blocked slots
export async function GET() {
    try {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("blocked_slots")
            .select("*")
            .order("date", { ascending: true });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching holidays:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

// POST /api/admin/holidays - Add a blocked slot
export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { date, start_time, end_time, all_day, reason } = body;

        if (!date) {
            return NextResponse.json({ error: "Date is required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("blocked_slots")
            .insert({
                date,
                start_time: all_day ? null : start_time,
                end_time: all_day ? null : end_time,
                all_day: all_day ?? true,
                reason,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Error adding holiday:", error);
        return NextResponse.json({ error: "Failed to add" }, { status: 500 });
    }
}

// DELETE /api/admin/holidays - Remove a blocked slot
export async function DELETE(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const { error } = await supabase
            .from("blocked_slots")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing holiday:", error);
        return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
    }
}
