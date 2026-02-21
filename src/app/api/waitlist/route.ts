import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/waitlist - Join the waitlist
export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { phone, name, serviceId, preferredDate, preferredTimes } = await request.json();

        if (!phone || !preferredDate) {
            return NextResponse.json({ error: "Phone and preferred date are required" }, { status: 400 });
        }

        // Clean phone number
        const cleanPhone = phone.replace(/\D/g, "");
        const normalizedPhone = cleanPhone.startsWith("972")
            ? "0" + cleanPhone.slice(3)
            : cleanPhone.startsWith("0") ? cleanPhone : "0" + cleanPhone;

        // Find or create client
        let clientId: string;
        const { data: existingClient } = await supabase
            .from("clients")
            .select("id")
            .eq("phone", normalizedPhone)
            .single();

        if (existingClient) {
            clientId = existingClient.id;
            // Update name if provided
            if (name) {
                await supabase.from("clients").update({ name }).eq("id", clientId);
            }
        } else {
            const { data: newClient, error: clientError } = await supabase
                .from("clients")
                .insert({ phone: normalizedPhone, name: name || null })
                .select("id")
                .single();
            if (clientError || !newClient) {
                throw new Error("Failed to create client");
            }
            clientId = newClient.id;
        }

        // Check if already on waitlist for this date
        const { data: existing } = await supabase
            .from("waitlist")
            .select("id")
            .eq("client_id", clientId)
            .eq("preferred_date", preferredDate)
            .eq("status", "waiting")
            .single();

        if (existing) {
            return NextResponse.json({ error: "Already on waitlist for this date" }, { status: 400 });
        }

        // Add to waitlist
        const { data: entry, error } = await supabase
            .from("waitlist")
            .insert({
                client_id: clientId,
                service_id: serviceId || null,
                preferred_date: preferredDate,
                preferred_times: preferredTimes || null,
                status: "waiting",
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: "נוספת לרשימת ההמתנה! נודיע לך כשיתפנה מקום.",
            entry
        }, { status: 201 });
    } catch (error) {
        console.error("Error joining waitlist:", error);
        return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
    }
}

// GET /api/waitlist - Check waitlist status by phone
export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get("phone");

        if (!phone) {
            return NextResponse.json({ error: "Phone required" }, { status: 400 });
        }

        // Normalize phone
        const cleanPhone = phone.replace(/\D/g, "");
        const normalizedPhone = cleanPhone.startsWith("972")
            ? "0" + cleanPhone.slice(3)
            : cleanPhone.startsWith("0") ? cleanPhone : "0" + cleanPhone;

        // Find client
        const { data: client } = await supabase
            .from("clients")
            .select("id")
            .eq("phone", normalizedPhone)
            .single();

        if (!client) {
            return NextResponse.json({ entries: [] });
        }

        // Get active waitlist entries
        const { data: entries } = await supabase
            .from("waitlist")
            .select(`
                id,
                preferred_date,
                preferred_times,
                status,
                created_at,
                service:services(name)
            `)
            .eq("client_id", client.id)
            .eq("status", "waiting")
            .order("preferred_date", { ascending: true });

        return NextResponse.json({ entries: entries || [] });
    } catch (error) {
        console.error("Error checking waitlist:", error);
        return NextResponse.json({ error: "Failed to check waitlist" }, { status: 500 });
    }
}
