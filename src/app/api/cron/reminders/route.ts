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
        day: "numeric",
        month: "long",
    });
}

interface BookingWithRelations {
    id: string;
    date: string;
    start_time: string;
    reminder_sent: string | null;
    client: { name: string | null; phone: string } | null;
    service: { name: string } | null;
}

// GET /api/cron/reminders - Send reminder SMS 24h before appointments
export async function GET(request: NextRequest) {
    // Verify cron secret (Vercel sends this automatically)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = createAdminClient();
        const now = new Date();

        // Calculate tomorrow's date range (24h from now)
        const tomorrow = new Date(now);
        tomorrow.setHours(now.getHours() + 24);
        const tomorrowDate = tomorrow.toISOString().split("T")[0];

        // Get settings
        const { data: settings } = await supabase
            .from("settings")
            .select("key, value")
            .in("key", ["business_name", "phone", "sms_sender"]);

        const businessName = settings?.find((s: { key: string; value: string }) => s.key === "business_name")?.value || "ליאת";
        const smsSettingValue = settings?.find((s: { key: string; value: string }) => s.key === "sms_sender")?.value;
        const smsSender = smsSettingValue && smsSettingValue.trim() ? smsSettingValue.trim() : businessName;

        // Get bookings for tomorrow that are confirmed and haven't received reminders
        const { data: bookings, error } = await supabase
            .from("bookings")
            .select(`
                id,
                date,
                start_time,
                reminder_sent,
                client:clients(name, phone),
                service:services(name)
            `)
            .eq("date", tomorrowDate)
            .eq("status", "confirmed")
            .is("reminder_sent", null);

        if (error) {
            console.error("Error fetching bookings for reminders:", error);
            return NextResponse.json({
                success: false,
                error: error.message,
            }, { status: 500 });
        }

        let sentCount = 0;
        const results: { bookingId: string; success: boolean; error?: string }[] = [];

        // Send reminders
        const bookingList = (bookings || []) as unknown as BookingWithRelations[];
        for (const booking of bookingList) {
            try {
                const clientPhone = formatPhone(booking.client?.phone || "");
                const clientName = booking.client?.name || clientPhone;
                const dateFormatted = formatDateHebrew(booking.date);

                const message = `שלום ${clientName}! 🌸
תזכורת לתור שלך מחר:
${booking.service?.name}
${dateFormatted} בשעה ${booking.start_time}

לצפייה בתורים: ${process.env.NEXT_PUBLIC_SITE_URL || "https://www.liat-nails.art"}/my-bookings

נתראה! 💅
${businessName}`;

                await sendSms({
                    sender: smsSender,
                    recipients: clientPhone,
                    msg: message,
                });

                // Mark as reminder sent
                await supabase
                    .from("bookings")
                    .update({ reminder_sent: new Date().toISOString() })
                    .eq("id", booking.id);

                sentCount++;
                results.push({ bookingId: booking.id, success: true });
            } catch (err) {
                console.error(`Error sending reminder for booking ${booking.id}:`, err);
                results.push({
                    bookingId: booking.id,
                    success: false,
                    error: err instanceof Error ? err.message : "Unknown error"
                });
            }
        }

        // Log the run
        await supabase.from("alive").upsert({
            id: 2,
            timestamp: now.toISOString(),
            log: `Reminders sent: ${sentCount}/${bookingList.length}`,
        }, { onConflict: "id" });

        console.log(`Reminder cron: sent ${sentCount}/${bookingList.length} reminders`);
        return NextResponse.json({
            success: true,
            totalBookings: bookingList.length,
            sentCount,
            results,
            timestamp: now.toISOString(),
        });
    } catch (error) {
        console.error("Reminder cron error:", error);
        return NextResponse.json({
            success: false,
            error: "Reminder cron failed",
        }, { status: 500 });
    }
}
