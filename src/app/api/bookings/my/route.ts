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

// GET /api/bookings/my - Get bookings for a phone number OR update client name (GET workaround for mobile)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get("phone");
        const name = searchParams.get("name");
        const action = searchParams.get("action");

        if (!phone) {
            return NextResponse.json({ error: "Phone required" }, { status: 400, headers: corsHeaders });
        }

        const supabase = createAdminClient();
        const formattedPhone = formatPhone(phone);

        // Handle update action (GET workaround for mobile)
        if (action === "update" && name) {
            console.log('[Bookings My GET] Updating client:', formattedPhone, 'with name:', name);

            // Update or create client with name
            const { data: existingClient } = await supabase
                .from("clients")
                .select("id")
                .eq("phone", formattedPhone)
                .single();

            if (existingClient) {
                // Update existing client
                console.log('[Bookings My GET] Updating existing client:', existingClient.id);
                const { error } = await supabase
                    .from("clients")
                    .update({ name })
                    .eq("id", existingClient.id);

                if (error) throw error;
            } else {
                // Create new client
                console.log('[Bookings My GET] Creating new client');
                const { error } = await supabase
                    .from("clients")
                    .insert({ phone: formattedPhone, name });

                if (error) throw error;
            }

            console.log('[Bookings My GET] Success');
            return NextResponse.json({ success: true }, { headers: corsHeaders });
        }

        // Get client
        const { data: client } = await supabase
            .from("clients")
            .select("id, name, phone")
            .eq("phone", formattedPhone)
            .single();

        if (!client) {
            return NextResponse.json({ client: null, bookings: [] }, { headers: corsHeaders });
        }

        // Get bookings
        const { data: bookings, error } = await supabase
            .from("bookings")
            .select(`
                *,
                service:services(id, name, price, duration)
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
                course:courses(id, name, description, date, price, duration, capacity, location, schedule_info, whatsapp_group_link)
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
        }, { headers: corsHeaders });
    } catch (error) {
        console.error("Error fetching/updating bookings:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500, headers: corsHeaders });
    }
}

// CORS headers for mobile app
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// OPTIONS handler for preflight requests
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// PUT /api/bookings/my - Update client name
export async function PUT(request: NextRequest) {
    try {
        const { phone, name } = await request.json();

        if (!phone || !name) {
            return NextResponse.json({ error: "Phone and name required" }, { status: 400, headers: corsHeaders });
        }

        const supabase = createAdminClient();
        const formattedPhone = formatPhone(phone);

        console.log('[Bookings My PUT] Updating client:', formattedPhone, 'with name:', name);

        // Update or create client with name
        const { data: existingClient } = await supabase
            .from("clients")
            .select("id")
            .eq("phone", formattedPhone)
            .single();

        if (existingClient) {
            // Update existing client
            console.log('[Bookings My PUT] Updating existing client:', existingClient.id);
            const { error } = await supabase
                .from("clients")
                .update({ name })
                .eq("id", existingClient.id);

            if (error) throw error;
        } else {
            // Create new client
            console.log('[Bookings My PUT] Creating new client');
            const { error } = await supabase
                .from("clients")
                .insert({ phone: formattedPhone, name });

            if (error) throw error;
        }

        console.log('[Bookings My PUT] Success');
        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        console.error("[Bookings My PUT] Error:", error);
        return NextResponse.json({ error: "Failed to update client" }, { status: 500, headers: corsHeaders });
    }
}
