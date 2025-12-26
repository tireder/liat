import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/clients - Get all clients
export async function GET() {
    try {
        const supabase = createAdminClient();

        const { data: clients, error } = await supabase
            .from("clients")
            .select(`
                id,
                phone,
                name,
                created_at,
                bookings:bookings(count)
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform to include booking count
        const clientsWithCount = clients?.map(c => ({
            id: c.id,
            phone: c.phone,
            name: c.name,
            created_at: c.created_at,
            booking_count: c.bookings?.[0]?.count || 0,
        })) || [];

        return NextResponse.json(clientsWithCount);
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
    }
}

// DELETE /api/admin/clients - Delete a client
export async function DELETE(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("id");

        if (!clientId) {
            return NextResponse.json({ error: "Client ID required" }, { status: 400 });
        }

        const { error } = await supabase
            .from("clients")
            .delete()
            .eq("id", clientId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting client:", error);
        return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
    }
}
