import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/sms4free";

// Helper to format date for Hebrew display
function formatDateHebrew(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("he-IL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// Helper to format phone for Israeli format
function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("972")) {
        return "0" + cleaned.slice(3);
    }
    if (cleaned.startsWith("0")) {
        return cleaned;
    }
    return "0" + cleaned;
}

// Send booking notifications
async function sendBookingNotifications(
    supabase: ReturnType<typeof createAdminClient>,
    booking: {
        date: string;
        start_time: string;
        notes?: string | null;
        client: { phone: string; name?: string };
        service: { name: string };
    }
) {
    try {
        // Get settings
        const { data: settings } = await supabase
            .from("settings")
            .select("key, value")
            .in("key", ["phone", "business_name", "sms_sender"]);

        const artistPhone = settings?.find(s => s.key === "phone")?.value;
        const businessName = settings?.find(s => s.key === "business_name")?.value || "ליאת";
        const smsSettingValue = settings?.find(s => s.key === "sms_sender")?.value;
        const smsSender = smsSettingValue && smsSettingValue.trim() ? smsSettingValue.trim() : businessName;

        const dateFormatted = formatDateHebrew(booking.date);
        const clientPhone = formatPhone(booking.client.phone);
        const clientName = booking.client.name || clientPhone;

        // Send notification to artist
        if (artistPhone) {
            let artistMsg = `תור חדש! 📅
${booking.service.name}
${dateFormatted} בשעה ${booking.start_time}
${clientName} - ${clientPhone}`;

            // Add notes if present
            if (booking.notes) {
                artistMsg += `\n📝 ${booking.notes}`;
            }

            await sendSms({
                sender: smsSender,
                recipients: formatPhone(artistPhone),
                msg: artistMsg,
            });
        }

        // Send confirmation to customer
        const customerMsg = `שלום ${clientName}! 💅
התור שלך אושר:
${booking.service.name}
${dateFormatted} בשעה ${booking.start_time}

לביטול או שינוי: ${process.env.NEXT_PUBLIC_SITE_URL || "https://liat-nine.vercel.app"}/my-bookings

${businessName}`;

        await sendSms({
            sender: smsSender,
            recipients: clientPhone,
            msg: customerMsg,
        });
    } catch (error) {
        console.error("Error sending booking notifications:", error);
        // Don't throw - we don't want to fail the booking if SMS fails
    }
}

// GET /api/bookings - Get bookings (with optional filters)
export async function GET(request: Request) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const date = searchParams.get("date");
        const status = searchParams.get("status");
        const clientId = searchParams.get("clientId");
        const phone = searchParams.get("phone");

        let query = supabase
            .from("bookings")
            .select(`
                *,
                client:clients(*),
                service:services(*)
            `)
            .order("date", { ascending: true })
            .order("start_time", { ascending: true });

        if (date) query = query.eq("date", date);
        if (status) query = query.eq("status", status);
        if (clientId) query = query.eq("client_id", clientId);

        // Filter by phone (for customer portal)
        if (phone) {
            const { data: client } = await supabase
                .from("clients")
                .select("id")
                .eq("phone", formatPhone(phone))
                .single();

            if (client) {
                query = query.eq("client_id", client.id);
            } else {
                return NextResponse.json([]);
            }
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json(
            { error: "Failed to fetch bookings" },
            { status: 500 }
        );
    }
}

// POST /api/bookings - Create a new booking
export async function POST(request: Request) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { phone, name, serviceId, date, startTime, notes } = body;

        if (!phone || !serviceId || !date || !startTime) {
            return NextResponse.json(
                { error: "Missing required fields: phone, serviceId, date, startTime" },
                { status: 400 }
            );
        }

        // Get service to calculate end time
        const { data: service, error: serviceError } = await supabase
            .from("services")
            .select("*")
            .eq("id", serviceId)
            .single();

        if (serviceError || !service) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        // Calculate end time
        const [hours, minutes] = startTime.split(":").map(Number);
        const endMinutes = hours * 60 + minutes + service.duration;
        const endHour = Math.floor(endMinutes / 60);
        const endMin = endMinutes % 60;
        const endTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;

        // Check for conflicts
        const { data: existing } = await supabase
            .from("bookings")
            .select("id")
            .eq("date", date)
            .in("status", ["confirmed", "pending"])
            .or(`and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime})`);

        if (existing && existing.length > 0) {
            return NextResponse.json({ error: "Time slot is not available" }, { status: 409 });
        }

        // Find or create client
        const formattedPhone = formatPhone(phone);
        let { data: client } = await supabase
            .from("clients")
            .select("*")
            .eq("phone", formattedPhone)
            .single();

        if (!client) {
            const { data: newClient, error: clientError } = await supabase
                .from("clients")
                .insert({ phone: formattedPhone, name: name || formattedPhone })
                .select()
                .single();
            if (clientError) throw clientError;
            client = newClient;
        }

        // Create booking
        const { data: booking, error: bookingError } = await supabase
            .from("bookings")
            .insert({
                client_id: client.id,
                service_id: serviceId,
                date,
                start_time: startTime,
                end_time: endTime,
                notes,
                status: "confirmed",
            })
            .select(`*, client:clients(*), service:services(*)`)
            .single();

        if (bookingError) throw bookingError;

        // Create audit log
        await supabase.from("booking_logs").insert({
            booking_id: booking.id,
            action: "created",
            actor: "client",
            details: { phone: formattedPhone, serviceId, date, startTime },
        });

        // Send SMS notifications (async, don't wait)
        sendBookingNotifications(supabase, booking);

        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        console.error("Error creating booking:", error);
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 }
        );
    }
}
