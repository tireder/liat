import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/sms4free";
import { notifyBookingEvent } from "@/lib/notifications";


// CORS headers for mobile app
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// OPTIONS handler for preflight requests
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

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
        artist_id?: string | null;
        client: { phone: string; name?: string };
        service: { name: string };
    }
) {
    try {
        const { data: settings } = await supabase
            .from("settings")
            .select("key, value")
            .in("key", ["phone", "business_name", "sms_sender"]);

        type SettingRow = { key: string; value: string };
        const businessName = (settings as SettingRow[] | null)?.find(s => s.key === "business_name")?.value || "ליאת";
        const smsSettingValue = (settings as SettingRow[] | null)?.find(s => s.key === "sms_sender")?.value;
        const smsSender = smsSettingValue && smsSettingValue.trim() ? smsSettingValue.trim() : "Liat";

        // Get artist phone - prefer artist-specific phone, fall back to global settings
        let artistPhone: string | undefined;
        if (booking.artist_id) {
            const { data: artist } = await supabase
                .from("nail_artists")
                .select("phone")
                .eq("id", booking.artist_id)
                .single();
            artistPhone = artist?.phone || undefined;
        }
        if (!artistPhone) {
            artistPhone = (settings as SettingRow[] | null)?.find(s => s.key === "phone")?.value;
        }

        const dateFormatted = formatDateHebrew(booking.date);
        const clientPhone = formatPhone(booking.client.phone);
        const clientName = booking.client.name || clientPhone;

        // Send notification to artist
        if (artistPhone) {
            let artistMsg = `תור חדש! 📅
${booking.service.name}
${dateFormatted} בשעה ${booking.start_time}
${clientName} - ${clientPhone}`;

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

לביטול או שינוי: ${process.env.NEXT_PUBLIC_SITE_URL || "https://www.liat-nails.art"}/my-bookings

${businessName}`;

        await sendSms({
            sender: smsSender,
            recipients: clientPhone,
            msg: customerMsg,
        });
    } catch (error) {
        console.error("Error sending booking notifications:", error);
    }
}

async function createBooking(
    phone: string,
    serviceId: string,
    date: string,
    startTime: string,
    name?: string,
    notes?: string,
    artistId?: string
): Promise<NextResponse> {
    const supabase = createAdminClient();

    // Get service to calculate end time
    const { data: service, error: serviceError } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .single();

    if (serviceError || !service) {
        return NextResponse.json(
            { error: "Service not found" },
            { status: 404, headers: corsHeaders }
        );
    }

    // Calculate end time
    const [hours, minutes] = startTime.split(":").map(Number);
    const endMinutes = hours * 60 + minutes + service.duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;

    // Check for conflicts (filter by artist if provided)
    let conflictQuery = supabase
        .from("bookings")
        .select("id")
        .eq("date", date)
        .in("status", ["confirmed", "pending"])
        .or(`and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime})`);

    if (artistId) {
        conflictQuery = conflictQuery.eq("artist_id", artistId);
    }

    const { data: existing } = await conflictQuery;

    if (existing && existing.length > 0) {
        return NextResponse.json(
            { error: "Time slot is not available" },
            { status: 409, headers: corsHeaders }
        );
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
        if (clientError) {
            return NextResponse.json(
                { error: "Failed to create client" },
                { status: 500, headers: corsHeaders }
            );
        }
        client = newClient;
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
            client_id: client.id,
            service_id: serviceId,
            artist_id: artistId || null,
            date,
            start_time: startTime,
            end_time: endTime,
            notes,
            status: "confirmed",
        })
        .select(`*, client:clients(*), service:services(*)`)
        .single();

    if (bookingError) {
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500, headers: corsHeaders }
        );
    }

    // Create audit log
    await supabase.from("booking_logs").insert({
        booking_id: booking.id,
        action: "created",
        actor: "client",
        details: { phone: formattedPhone, serviceId, date, startTime },
    });

    // Send SMS notifications (async)
    sendBookingNotifications(supabase, booking);

    // Send push notification to client if app notifications enabled
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.liat-nails.art";
    notifyBookingEvent(
        client.id,
        "APPOINTMENT_CREATED",
        "התור שלך אושר! 💅",
        `${service.name} - ${date} בשעה ${startTime}`,
        booking.id,
        `${siteUrl}/my-bookings`
    ).catch(err => console.error("Push notification error:", err));

    return NextResponse.json(
        { success: true, booking },
        { status: 201, headers: corsHeaders }
    );
}

// GET /api/bookings/create - Create booking via GET (mobile workaround)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date");
    const startTime = searchParams.get("startTime");
    const name = searchParams.get("name") || undefined;
    const notes = searchParams.get("notes") || undefined;

    if (!phone || !serviceId || !date || !startTime) {
        return NextResponse.json(
            { error: "Missing required fields: phone, serviceId, date, startTime" },
            { status: 400, headers: corsHeaders }
        );
    }

    try {
        return await createBooking(phone, serviceId, date, startTime, name, notes, searchParams.get("artistId") || undefined);
    } catch (error) {
        console.error("Error creating booking:", error);
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// POST /api/bookings/create - Create booking via POST (web)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, name, serviceId, date, startTime, notes, artistId } = body;

        if (!phone || !serviceId || !date || !startTime) {
            return NextResponse.json(
                { error: "Missing required fields: phone, serviceId, date, startTime" },
                { status: 400, headers: corsHeaders }
            );
        }

        return await createBooking(phone, serviceId, date, startTime, name, notes, artistId);
    } catch (error) {
        console.error("Error creating booking:", error);
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500, headers: corsHeaders }
        );
    }
}
