import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/sms4free";

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

// Send notification when admin changes booking status
async function sendAdminChangeNotification(
    supabase: ReturnType<typeof createAdminClient>,
    booking: {
        date: string;
        start_time: string;
        client: { phone: string; name?: string };
        service: { name: string };
        status: string;
    },
    previousStatus: string
) {
    try {
        const { data: settings } = await supabase
            .from("settings")
            .select("key, value")
            .in("key", ["phone", "business_name", "sms_sender"]);

        const artistPhone = settings?.find(s => s.key === "phone")?.value;
        const businessName = settings?.find(s => s.key === "business_name")?.value || "ליאת";
        const smsSettingValue = settings?.find(s => s.key === "sms_sender")?.value;
        const smsSender = smsSettingValue && smsSettingValue.trim() ? smsSettingValue.trim() : businessName;

        const clientPhone = formatPhone(booking.client.phone);
        const clientName = booking.client.name || clientPhone;
        const dateFormatted = formatDateHebrew(booking.date);

        let customerMsg = "";

        if (booking.status === "cancelled" && previousStatus !== "cancelled") {
            customerMsg = `שלום ${clientName},
התור שלך בוטל:
${booking.service.name}
${dateFormatted} בשעה ${booking.start_time}

לקביעת תור חדש: ${process.env.NEXT_PUBLIC_SITE_URL || "https://liat-nine.vercel.app"}/book

${businessName}`;
        } else if (booking.status === "confirmed" && previousStatus === "pending") {
            customerMsg = `שלום ${clientName},
התור שלך אושר! ✓
${booking.service.name}
${dateFormatted} בשעה ${booking.start_time}

${businessName}`;
        }

        // Send to customer if message exists
        if (customerMsg) {
            await sendSms({
                sender: smsSender,
                recipients: clientPhone,
                msg: customerMsg,
            });
        }
    } catch (error) {
        console.error("Error sending admin change notification:", error);
    }
}

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
        const { bookingId, status, notes, previousStatus } = body;

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
            details: { previous_status: previousStatus, notes },
        });

        // Send SMS notification
        if (data && previousStatus && previousStatus !== status) {
            sendAdminChangeNotification(supabase, data, previousStatus);
        }

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
