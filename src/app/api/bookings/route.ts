import { NextResponse } from "next/server";
import { getSupabase, Booking, BookingStatus } from "@/lib/database.types";

// GET /api/bookings - Get bookings (with optional filters)
export async function GET(request: Request) {
    try {
        const supabase = await getSupabase();
        const { searchParams } = new URL(request.url);
        const date = searchParams.get("date");
        const status = searchParams.get("status") as BookingStatus | null;
        const clientId = searchParams.get("clientId");

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
        const supabase = await getSupabase();
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
        let { data: client } = await supabase
            .from("clients")
            .select("*")
            .eq("phone", phone)
            .single();

        if (!client) {
            const { data: newClient, error: clientError } = await supabase
                .from("clients")
                .insert({ phone, name })
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
            details: { phone, serviceId, date, startTime },
        });

        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        console.error("Error creating booking:", error);
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 }
        );
    }
}
