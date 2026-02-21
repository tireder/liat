import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/nail-colors - Fetch all nail colors
export async function GET() {
    try {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("nail_colors")
            .select("*")
            .eq("active", true)
            .order("sort_order", { ascending: true });

        if (error) throw error;

        return NextResponse.json(data || []);
    } catch (error) {
        console.error("Error fetching nail colors:", error);
        return NextResponse.json({ error: "Failed to fetch colors" }, { status: 500 });
    }
}

// POST /api/admin/nail-colors - Add new color
export async function POST(request: NextRequest) {
    try {
        const { name, hex_color, brand } = await request.json();

        if (!name || !hex_color) {
            return NextResponse.json({ error: "Name and color required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Get max sort_order
        const { data: maxOrder } = await supabase
            .from("nail_colors")
            .select("sort_order")
            .order("sort_order", { ascending: false })
            .limit(1)
            .single();

        const { data, error } = await supabase
            .from("nail_colors")
            .insert({
                name,
                hex_color,
                brand: brand || null,
                sort_order: (maxOrder?.sort_order || 0) + 1,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error adding nail color:", error);
        return NextResponse.json({ error: "Failed to add color" }, { status: 500 });
    }
}

// PUT /api/admin/nail-colors - Update color
export async function PUT(request: NextRequest) {
    try {
        const { id, name, hex_color, brand, sort_order, active } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Color ID required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        const updates: Record<string, unknown> = {};
        if (name !== undefined) updates.name = name;
        if (hex_color !== undefined) updates.hex_color = hex_color;
        if (brand !== undefined) updates.brand = brand;
        if (sort_order !== undefined) updates.sort_order = sort_order;
        if (active !== undefined) updates.active = active;

        const { data, error } = await supabase
            .from("nail_colors")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating nail color:", error);
        return NextResponse.json({ error: "Failed to update color" }, { status: 500 });
    }
}

// DELETE /api/admin/nail-colors - Delete color
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Color ID required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { error } = await supabase
            .from("nail_colors")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting nail color:", error);
        return NextResponse.json({ error: "Failed to delete color" }, { status: 500 });
    }
}
