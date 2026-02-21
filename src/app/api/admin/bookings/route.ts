import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/sms4free";
import { notifyReviewRequest } from "@/lib/notifications";

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

לקביעת תור חדש: ${process.env.NEXT_PUBLIC_SITE_URL || "https://www.liat-nails.art"}/book

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
        const period = searchParams.get("period"); // "week" or "month"
        const artistId = searchParams.get("artistId");

        let query = supabase
            .from("bookings")
            .select(`
                *,
                client:clients(id, name, phone),
                service:services(id, name, duration, price)
            `)
            .order("date", { ascending: true })
            .order("start_time", { ascending: true });

        // Filter by period (week or month)
        if (period === "week") {
            const today = new Date();
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            query = query
                .gte("date", weekStart.toISOString().split("T")[0])
                .lt("date", weekEnd.toISOString().split("T")[0])
                .in("status", ["confirmed", "pending", "pending_change"]);
        } else if (period === "month") {
            const today = new Date();
            const year = today.getFullYear();
            const monthStr = String(today.getMonth() + 1).padStart(2, '0');
            const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
            const lastDayStr = String(lastDay).padStart(2, '0');
            query = query
                .gte("date", `${year}-${monthStr}-01`)
                .lte("date", `${year}-${monthStr}-${lastDayStr}`);
        }

        // Filter by status
        if (status && status !== "all") {
            query = query.eq("status", status);
        }

        // Filter by date range (manual override)
        if (startDate) {
            query = query.gte("date", startDate);
        }
        if (endDate) {
            query = query.lte("date", endDate);
        }

        // Filter by artist
        if (artistId) {
            query = query.eq("artist_id", artistId);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching bookings:", error);
            throw error;
        }

        // Format data for period requests (dashboard popup)
        if (period) {
            interface BookingData {
                id: string;
                date: string;
                start_time: string;
                status: string;
                client: { name: string | null; phone: string } | null;
                service: { name: string } | null;
            }
            const formatted = (data as BookingData[] | null)?.map(b => ({
                id: b.id,
                date: b.date,
                time: b.start_time,
                client: b.client?.name || b.client?.phone || "לקוח",
                phone: b.client?.phone || "",
                service: b.service?.name || "שירות",
                status: b.status,
            })) || [];
            return NextResponse.json(formatted);
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
            // Log admin notification duration
            console.time('sendAdminChangeNotification');
            await sendAdminChangeNotification(supabase, data, previousStatus);
            console.timeEnd('sendAdminChangeNotification');

            // If status changed to "completed", send review request push notification
            if (status === "completed" && data.client) {
                try {
                    const clientData = data.client as unknown as { id: string; phone: string; name?: string } | null;

                    if (clientData?.id) {
                        // Generate review token
                        const reviewToken = `${bookingId}-${Date.now().toString(36)}`;

                        // Save token to booking
                        await supabase
                            .from("bookings")
                            .update({ review_token: reviewToken })
                            .eq("id", bookingId);

                        // Send push notification for review
                        const pushSent = await notifyReviewRequest(
                            clientData.id,
                            bookingId,
                            reviewToken,
                            data.service?.name || "הטיפול"
                        );

                        if (!pushSent) {
                            console.log("[Review] Push notification not sent - user may not have app notifications enabled");
                        } else {
                            console.log("[Review] Push notification sent successfully");
                        }
                    }
                } catch (reviewError) {
                    console.error("Error sending review notification:", reviewError);
                    // Don't fail the request if review notification fails
                }
            }
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
