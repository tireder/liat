import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

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

// GET /api/bookings/my - Get bookings for a phone number
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get("phone");

        if (!phone) {
            return NextResponse.json({ error: "Phone required" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const formattedPhone = formatPhone(phone);

        // Get client
        const { data: client } = await supabase
            .from("clients")
            .select("id, name, phone")
            .eq("phone", formattedPhone)
            .single();

        if (!client) {
            return NextResponse.json({ client: null, bookings: [] });
        }

        // Get bookings
        const { data: bookings, error } = await supabase
            .from("bookings")
            .select(`
                *,
                service:services(name, price, duration)
            `)
            .eq("client_id", client.id)
            .order("date", { ascending: false })
            .order("start_time", { ascending: false });

        if (error) throw error;

        // Get course registrations
        const { data: courseRegistrations } = await supabase
            .from("course_registrations")
            .select(`
                *,
                course:courses(id, title, description, start_date, location, price)
            `)
            .eq("client_id", client.id)
            .order("created_at", { ascending: false });

        return NextResponse.json({
            client: {
                id: client.id,
                name: client.name,
                phone: client.phone,
            },
            bookings: bookings || [],
            courseRegistrations: courseRegistrations || [],
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
}

// PUT /api/bookings/my - Update client name
export async function PUT(request: NextRequest) {
    try {
        const { phone, name } = await request.json();

        if (!phone || !name) {
            return NextResponse.json({ error: "Phone and name required" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const formattedPhone = formatPhone(phone);

        // Update or create client with name
        const { data: existingClient } = await supabase
            .from("clients")
            .select("id")
            .eq("phone", formattedPhone)
            .single();

        if (existingClient) {
            // Update existing client
            const { error } = await supabase
                .from("clients")
                .update({ name })
                .eq("id", existingClient.id);

            if (error) throw error;
        } else {
            // Create new client
            const { error } = await supabase
                .from("clients")
                .insert({ phone: formattedPhone, name });

            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating client:", error);
        return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
    }
}
