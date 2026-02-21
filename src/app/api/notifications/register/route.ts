import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("972")) return "0" + cleaned.slice(3);
    if (cleaned.startsWith("0")) return cleaned;
    return "0" + cleaned;
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// POST /api/notifications/register – Register a push token for a client
// Body (or query params for GET): { phone, token, platform }
export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { phone, token, platform } = await request.json();

        if (!phone || !token || !platform) {
            return NextResponse.json(
                { error: "phone, token, and platform are required" },
                { status: 400, headers: corsHeaders }
            );
        }

        if (!["ios", "android", "web"].includes(platform)) {
            return NextResponse.json(
                { error: "platform must be ios, android, or web" },
                { status: 400, headers: corsHeaders }
            );
        }

        const normalizedPhone = formatPhone(phone);

        // Find client
        const { data: client } = await supabase
            .from("clients")
            .select("id")
            .eq("phone", normalizedPhone)
            .single();

        if (!client) {
            return NextResponse.json(
                { error: "Client not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        // Upsert push token (reactivate if previously deactivated)
        const { error } = await supabase
            .from("push_tokens")
            .upsert(
                {
                    client_id: client.id,
                    token,
                    platform,
                    active: true,
                },
                { onConflict: "client_id,token" }
            );

        if (error) throw error;

        // Enable app notifications for this client
        await supabase
            .from("clients")
            .update({ app_notifications_enabled: true })
            .eq("id", client.id);

        return NextResponse.json(
            { success: true, message: "Push token registered" },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error("Error registering push token:", error);
        return NextResponse.json(
            { error: "Failed to register push token" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// GET /api/notifications/register?phone=...&token=...&platform=... (mobile workaround)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const token = searchParams.get("token");
    const platform = searchParams.get("platform");

    if (!phone || !token || !platform) {
        return NextResponse.json(
            { error: "phone, token, and platform are required" },
            { status: 400, headers: corsHeaders }
        );
    }

    try {
        const supabase = createAdminClient();
        const normalizedPhone = formatPhone(phone);

        const { data: client } = await supabase
            .from("clients")
            .select("id")
            .eq("phone", normalizedPhone)
            .single();

        if (!client) {
            return NextResponse.json(
                { error: "Client not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        const { error } = await supabase
            .from("push_tokens")
            .upsert(
                {
                    client_id: client.id,
                    token,
                    platform,
                    active: true,
                },
                { onConflict: "client_id,token" }
            );

        if (error) throw error;

        await supabase
            .from("clients")
            .update({ app_notifications_enabled: true })
            .eq("id", client.id);

        return NextResponse.json(
            { success: true, message: "Push token registered" },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error("Error registering push token:", error);
        return NextResponse.json(
            { error: "Failed to register push token" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// DELETE /api/notifications/register – Unregister a push token
export async function DELETE(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { phone, token } = await request.json();

        if (!phone || !token) {
            return NextResponse.json(
                { error: "phone and token are required" },
                { status: 400, headers: corsHeaders }
            );
        }

        const normalizedPhone = formatPhone(phone);

        const { data: client } = await supabase
            .from("clients")
            .select("id")
            .eq("phone", normalizedPhone)
            .single();

        if (!client) {
            return NextResponse.json(
                { error: "Client not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        // Deactivate token
        await supabase
            .from("push_tokens")
            .update({ active: false })
            .eq("client_id", client.id)
            .eq("token", token);

        // Check if client still has any active tokens
        const { data: remainingTokens } = await supabase
            .from("push_tokens")
            .select("id")
            .eq("client_id", client.id)
            .eq("active", true)
            .limit(1);

        if (!remainingTokens || remainingTokens.length === 0) {
            await supabase
                .from("clients")
                .update({ app_notifications_enabled: false })
                .eq("id", client.id);
        }

        return NextResponse.json(
            { success: true, message: "Push token unregistered" },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error("Error unregistering push token:", error);
        return NextResponse.json(
            { error: "Failed to unregister push token" },
            { status: 500, headers: corsHeaders }
        );
    }
}
