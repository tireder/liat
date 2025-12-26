import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

interface BookingRow {
    id: string;
    start_time: string;
    status: string;
    date: string;
    requested_date: string | null;
    requested_time: string | null;
    client: { name: string | null; phone: string } | null;
    service: { name: string } | null;
}

// GET /api/admin/dashboard
export async function GET() {
    try {
        const supabase = createAdminClient();

        const today = new Date().toISOString().split("T")[0];
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        // Today's bookings
        const { data: todayBookings, error: todayError } = await supabase
            .from("bookings")
            .select(`*, client:clients(name, phone), service:services(name)`)
            .eq("date", today)
            .in("status", ["confirmed", "pending", "pending_change"])
            .order("start_time");

        if (todayError) console.error("Today bookings error:", todayError);

        // Pending approvals
        const { data: pendingApprovals, error: pendingError } = await supabase
            .from("bookings")
            .select(`*, client:clients(name, phone)`)
            .eq("status", "pending_change");

        if (pendingError) console.error("Pending error:", pendingError);

        // Week stats
        const { data: weekBookings, error: weekError } = await supabase
            .from("bookings")
            .select("status")
            .gte("date", weekStart.toISOString().split("T")[0])
            .lt("date", weekEnd.toISOString().split("T")[0]);

        if (weekError) console.error("Week error:", weekError);

        const weekStats = { total: 0, confirmed: 0, completed: 0, cancelled: 0, pending: 0 };
        weekBookings?.forEach((b: { status: string }) => {
            weekStats.total++;
            if (b.status === "confirmed") weekStats.confirmed++;
            if (b.status === "completed") weekStats.completed++;
            if (b.status === "cancelled") weekStats.cancelled++;
            if (b.status === "pending" || b.status === "pending_change") weekStats.pending++;
        });

        return NextResponse.json({
            todayBookings: (todayBookings as BookingRow[] | null)?.map((b) => ({
                id: b.id,
                time: b.start_time,
                client: b.client?.name || b.client?.phone || "לקוח",
                phone: b.client?.phone || "",
                service: b.service?.name || "שירות",
                status: b.status,
            })) || [],
            pendingApprovals: (pendingApprovals as BookingRow[] | null)?.map((b) => ({
                id: b.id,
                client: b.client?.name || b.client?.phone || "לקוח",
                originalDate: b.date,
                requestedDate: b.requested_date,
                requestedTime: b.requested_time,
                type: b.requested_date ? "reschedule" : "cancel",
            })) || [],
            weekStats,
        });
    } catch (error) {
        console.error("Error fetching dashboard:", error);
        return NextResponse.json({
            error: "Failed to fetch dashboard",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

// POST /api/admin/dashboard - Approve/deny requests
export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { bookingId, action } = await request.json();

        if (!bookingId || !action) {
            return NextResponse.json({ error: "bookingId and action required" }, { status: 400 });
        }

        const { data: booking, error: fetchError } = await supabase
            .from("bookings")
            .select("*")
            .eq("id", bookingId)
            .single();

        if (fetchError) console.error("Fetch booking error:", fetchError);

        if (!booking || booking.status !== "pending_change") {
            return NextResponse.json({ error: "Invalid booking" }, { status: 400 });
        }

        if (action === "approve" && booking.requested_date) {
            const { error } = await supabase
                .from("bookings")
                .update({
                    date: booking.requested_date,
                    start_time: booking.requested_time,
                    status: "confirmed",
                    requested_date: null,
                    requested_time: null,
                })
                .eq("id", bookingId);

            if (error) console.error("Update error:", error);

            await supabase.from("booking_logs").insert({
                booking_id: bookingId,
                action: "reschedule_approved",
                actor: "admin",
            });
        } else {
            const { error } = await supabase
                .from("bookings")
                .update({ status: "confirmed", requested_date: null, requested_time: null })
                .eq("id", bookingId);

            if (error) console.error("Update error:", error);

            await supabase.from("booking_logs").insert({
                booking_id: bookingId,
                action: "reschedule_denied",
                actor: "admin",
            });
        }

        return NextResponse.json({ success: true, action });
    } catch (error) {
        console.error("Error handling approval:", error);
        return NextResponse.json({
            error: "Failed to process",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
