import { NextRequest, NextResponse } from "next/server";
import { getSupabase, BookingStatus } from "@/lib/database.types";

// Allowed state transitions
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    confirmed: ["pending_change", "cancelled", "completed", "no_show"],
    pending: ["confirmed", "cancelled"],
    pending_change: ["confirmed", "cancelled"],
    cancelled: [],
    completed: [],
    no_show: [],
};

type Params = { params: Promise<{ id: string }> };

// GET /api/bookings/[id]
export async function GET(request: NextRequest, context: Params) {
    try {
        const supabase = await getSupabase();
        const { id } = await context.params;

        const { data, error } = await supabase
            .from("bookings")
            .select(`*, client:clients(*), service:services(*), logs:booking_logs(*)`)
            .eq("id", id)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching booking:", error);
        return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
    }
}

// PATCH /api/bookings/[id] - Update status or request reschedule
export async function PATCH(request: NextRequest, context: Params) {
    try {
        const supabase = await getSupabase();
        const { id } = await context.params;
        const body = await request.json();
        const { status, requestedDate, requestedTime, actor = "client" } = body;

        const { data: booking, error: fetchError } = await supabase
            .from("bookings")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Handle reschedule request
        if (requestedDate && requestedTime) {
            const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`);
            const hoursUntilBooking = (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

            if (hoursUntilBooking < 24) {
                // Needs admin approval
                const { data: updated, error } = await supabase
                    .from("bookings")
                    .update({
                        status: "pending_change",
                        requested_date: requestedDate,
                        requested_time: requestedTime,
                    })
                    .eq("id", id)
                    .select()
                    .single();

                if (error) throw error;

                await supabase.from("booking_logs").insert({
                    booking_id: id,
                    action: "reschedule_requested",
                    actor,
                    details: { requestedDate, requestedTime },
                });

                return NextResponse.json({ ...updated, pending: true });
            } else {
                // Auto-approve
                const { data: updated, error } = await supabase
                    .from("bookings")
                    .update({
                        date: requestedDate,
                        start_time: requestedTime,
                        requested_date: null,
                        requested_time: null,
                    })
                    .eq("id", id)
                    .select()
                    .single();

                if (error) throw error;

                await supabase.from("booking_logs").insert({
                    booking_id: id,
                    action: "rescheduled",
                    actor,
                    details: { newDate: requestedDate, newTime: requestedTime },
                });

                return NextResponse.json(updated);
            }
        }

        // Handle status change
        if (status) {
            const currentStatus = booking.status as BookingStatus;
            const allowedNextStates = ALLOWED_TRANSITIONS[currentStatus];

            if (!allowedNextStates.includes(status)) {
                return NextResponse.json(
                    { error: `Cannot transition from ${currentStatus} to ${status}` },
                    { status: 400 }
                );
            }

            const { data: updated, error } = await supabase
                .from("bookings")
                .update({ status })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            await supabase.from("booking_logs").insert({
                booking_id: id,
                action: `status_changed_to_${status}`,
                actor,
            });

            return NextResponse.json(updated);
        }

        return NextResponse.json({ error: "No valid update provided" }, { status: 400 });
    } catch (error) {
        console.error("Error updating booking:", error);
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }
}

// DELETE /api/bookings/[id]
export async function DELETE(request: NextRequest, context: Params) {
    try {
        const supabase = await getSupabase();
        const { id } = await context.params;
        const { searchParams } = new URL(request.url);
        const actor = searchParams.get("actor") || "client";

        const { data: updated, error } = await supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        await supabase.from("booking_logs").insert({
            booking_id: id,
            action: "cancelled",
            actor,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error cancelling booking:", error);
        return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
    }
}
