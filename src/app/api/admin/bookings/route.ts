import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/bookings - Get all bookings with filters for admin
export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        let query = supabase
            .from("bookings")
            .select(`
                *,
                client:clients(id, name, phone),
                service:services(id, name, duration, price)
            `)
            .order("date", { ascending: true })
            .order("start_time", { ascending: true });

        // Filter by status
        if (status && status !== "all") {
            query = query.eq("status", status);
        }

        // Filter by date range
        if (startDate) {
            query = query.gte("date", startDate);
        }
        if (endDate) {
            query = query.lte("date", endDate);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching bookings:", error);
            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error("Error in admin bookings:", error);
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
}

// PATCH /api/admin/bookings - Update booking status
export async function PATCH(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { bookingId, status, notes } = body;

        if (!bookingId || !status) {
            return NextResponse.json(
                { error: "Missing bookingId or status" },
                { status: 400 }
            );
        }

        const updateData: { status: string; notes?: string; updated_at: string } = {
            status,
            updated_at: new Date().toISOString(),
        };

        if (notes !== undefined) {
            updateData.notes = notes;
        }

        const { data, error } = await supabase
            .from("bookings")
            .update(updateData)
            .eq("id", bookingId)
            .select(`
                *,
                client:clients(id, name, phone),
                service:services(id, name, duration, price)
            `)
            .single();

        if (error) {
            console.error("Error updating booking:", error);
            throw error;
        }

        // Log the action
        await supabase.from("booking_logs").insert({
            booking_id: bookingId,
            action: `status_changed_to_${status}`,
            actor: "admin",
            details: { previous_status: body.previousStatus, notes },
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating booking:", error);
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }
}

// DELETE /api/admin/bookings - Delete a booking
export async function DELETE(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get("id");

        if (!bookingId) {
            return NextResponse.json({ error: "Missing booking id" }, { status: 400 });
        }

        // First delete related logs
        await supabase.from("booking_logs").delete().eq("booking_id", bookingId);

        // Then delete the booking
        const { error } = await supabase.from("bookings").delete().eq("id", bookingId);

        if (error) {
            console.error("Error deleting booking:", error);
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting booking:", error);
        return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
    }
}
