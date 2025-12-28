import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/sms4free";

// Allowed state transitions
type BookingStatus = "confirmed" | "pending" | "pending_change" | "cancelled" | "completed" | "no_show";

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    confirmed: ["pending_change", "cancelled", "completed", "no_show"],
    pending: ["confirmed", "cancelled"],
    pending_change: ["confirmed", "cancelled"],
    cancelled: [],
    completed: [],
    no_show: [],
};

// Helper functions
function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("972")) return "0" + cleaned.slice(3);
    if (cleaned.startsWith("0")) return cleaned;
    return "0" + cleaned;
}

function formatDateHebrew(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("he-IL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// Send notification when booking is changed/cancelled
async function sendBookingChangeNotification(
    supabase: ReturnType<typeof createAdminClient>,
    booking: {
        date: string;
        start_time: string;
        client: { phone: string; name?: string };
        service: { name: string };
    },
    changeType: "cancelled" | "changed" | "confirmed",
    newDate?: string,
    newTime?: string
) {
    try {
        const { data: settings } = await supabase
            .from("settings")
            .select("key, value")
            .in("key", ["phone", "business_name", "sms_sender"]);

        const artistPhone = settings?.find(s => s.key === "phone")?.value;
        const businessName = settings?.find(s => s.key === "business_name")?.value || "ליאת";
        const smsSender = settings?.find(s => s.key === "sms_sender")?.value || businessName;

        const clientPhone = formatPhone(booking.client.phone);
        const clientName = booking.client.name || clientPhone;
        const dateFormatted = formatDateHebrew(booking.date);

        let customerMsg = "";
        let artistMsg = "";

        if (changeType === "cancelled") {
            customerMsg = `שלום ${clientName},
התור שלך בוטל:
${booking.service.name}
${dateFormatted} בשעה ${booking.start_time}

לקביעת תור חדש: ${process.env.NEXT_PUBLIC_SITE_URL || "https://liat-nine.vercel.app"}/book

${businessName}`;

            artistMsg = `תור בוטל ❌
${booking.service.name}
${dateFormatted} בשעה ${booking.start_time}
${clientName} - ${clientPhone}`;
        } else if (changeType === "changed" && newDate && newTime) {
            const newDateFormatted = formatDateHebrew(newDate);
            customerMsg = `שלום ${clientName},
התור שלך הועבר:
${booking.service.name}
📅 ${newDateFormatted} בשעה ${newTime}

${businessName}`;

            artistMsg = `תור הועבר 📅
${booking.service.name}
${clientName} - ${clientPhone}
תאריך חדש: ${newDateFormatted} ${newTime}`;
        } else if (changeType === "confirmed") {
            customerMsg = `שלום ${clientName},
התור שלך אושר! ✓
${booking.service.name}
${dateFormatted} בשעה ${booking.start_time}

${businessName}`;

            artistMsg = `תור אושר ✓
${booking.service.name}
${dateFormatted} בשעה ${booking.start_time}
${clientName} - ${clientPhone}`;
        }

        // Send to customer
        if (customerMsg) {
            await sendSms({
                sender: smsSender,
                recipients: clientPhone,
                msg: customerMsg,
            });
        }

        // Send to artist
        if (artistMsg && artistPhone) {
            await sendSms({
                sender: smsSender,
                recipients: formatPhone(artistPhone),
                msg: artistMsg,
            });
        }
    } catch (error) {
        console.error("Error sending booking change notification:", error);
    }
}

type Params = { params: Promise<{ id: string }> };

// GET /api/bookings/[id]
export async function GET(request: NextRequest, context: Params) {
    try {
        const supabase = createAdminClient();
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
        const supabase = createAdminClient();
        const { id } = await context.params;
        const body = await request.json();
        const { status, requestedDate, requestedTime, actor = "client" } = body;

        const { data: booking, error: fetchError } = await supabase
            .from("bookings")
            .select(`*, client:clients(*), service:services(*)`)
            .eq("id", id)
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Handle reschedule request - support both formats
        // Admin format: changeType, newDate, newTime
        // Client format: requestedDate, requestedTime
        const rescheduleDate = body.newDate || body.requestedDate;
        const rescheduleTime = body.newTime || body.requestedTime;
        const isAdminReschedule = body.changeType === "changed";

        if (rescheduleDate && rescheduleTime) {
            const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`);
            const hoursUntilBooking = (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

            // Admin reschedule bypasses 24h restriction
            if (hoursUntilBooking < 24 && !isAdminReschedule) {
                // Needs admin approval
                const { data: updated, error } = await supabase
                    .from("bookings")
                    .update({
                        status: "pending_change",
                        requested_date: rescheduleDate,
                        requested_time: rescheduleTime,
                    })
                    .eq("id", id)
                    .select()
                    .single();

                if (error) throw error;

                await supabase.from("booking_logs").insert({
                    booking_id: id,
                    action: "reschedule_requested",
                    actor,
                    details: { requestedDate: rescheduleDate, requestedTime: rescheduleTime },
                });

                return NextResponse.json({ ...updated, pending: true });
            } else {
                // Auto-approve (or admin reschedule)
                const { data: updated, error } = await supabase
                    .from("bookings")
                    .update({
                        date: rescheduleDate,
                        start_time: rescheduleTime,
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
                    actor: isAdminReschedule ? "admin" : actor,
                    details: { newDate: rescheduleDate, newTime: rescheduleTime },
                });

                // Send notifications
                sendBookingChangeNotification(supabase, booking, "changed", rescheduleDate, rescheduleTime);

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

            // Send notifications for status changes
            if (status === "cancelled") {
                sendBookingChangeNotification(supabase, booking, "cancelled");
            } else if (status === "confirmed" && currentStatus === "pending") {
                sendBookingChangeNotification(supabase, booking, "confirmed");
            }

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
        const supabase = createAdminClient();
        const { id } = await context.params;
        const { searchParams } = new URL(request.url);
        const actor = searchParams.get("actor") || "client";

        // Get booking with client and service info for notification
        const { data: booking, error: fetchError } = await supabase
            .from("bookings")
            .select(`*, client:clients(*), service:services(*)`)
            .eq("id", id)
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

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

        // Send cancellation notifications
        sendBookingChangeNotification(supabase, booking, "cancelled");

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error cancelling booking:", error);
        return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
    }
}
