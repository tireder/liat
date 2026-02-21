import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

interface Params {
    params: Promise<{ id: string }>;
}

// GET /api/admin/clients/[id]/notes - Get all notes for a client
export async function GET(request: NextRequest, context: Params) {
    try {
        const supabase = createAdminClient();
        const { id } = await context.params;

        const { data, error } = await supabase
            .from("client_notes")
            .select("*")
            .eq("client_id", id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching client notes:", error);
            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error("Error in client notes:", error);
        return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
    }
}

// POST /api/admin/clients/[id]/notes - Add a new note
export async function POST(request: NextRequest, context: Params) {
    try {
        const supabase = createAdminClient();
        const { id } = await context.params;
        const { note } = await request.json();

        if (!note || !note.trim()) {
            return NextResponse.json({ error: "Note is required" }, { status: 400 });
        }

        // Add to notes history
        const { data, error } = await supabase
            .from("client_notes")
            .insert({
                client_id: id,
                note: note.trim(),
                created_by: "admin",
            })
            .select()
            .single();

        if (error) {
            console.error("Error adding client note:", error);
            throw error;
        }

        // Also update the main notes field on client (for quick reference)
        await supabase
            .from("clients")
            .update({ notes: note.trim(), updated_at: new Date().toISOString() })
            .eq("id", id);

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Error adding client note:", error);
        return NextResponse.json({ error: "Failed to add note" }, { status: 500 });
    }
}
