import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendPushNotification } from "@/lib/notifications";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("972")) return "0" + cleaned.slice(3);
    if (cleaned.startsWith("0")) return cleaned;
    return "0" + cleaned;
}

// GET /api/notifications/test?phone=0535300924&title=Test&body=Hello!
// Simple test endpoint to trigger a push notification
export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get("phone");
        const title = searchParams.get("title") || "🔔 בדיקת התראה";
        const body = searchParams.get("body") || "זוהי הודעת בדיקה מליאת נייל ארטיסט";

        if (!phone) {
            return NextResponse.json(
                { error: "Phone required. Usage: ?phone=0535300924&title=Test&body=Hello" },
                { status: 400, headers: corsHeaders }
            );
        }

        const normalizedPhone = formatPhone(phone);

        // Find client
        const { data: client } = await supabase
            .from("clients")
            .select("id, name, app_notifications_enabled")
            .eq("phone", normalizedPhone)
            .single();

        if (!client) {
            return NextResponse.json(
                { error: "Client not found for this phone" },
                { status: 404, headers: corsHeaders }
            );
        }

        // Check push tokens
        const { data: tokens } = await supabase
            .from("push_tokens")
            .select("id, token, platform, active")
            .eq("client_id", client.id);

        const activeTokens = tokens?.filter(t => t.active) || [];

        if (activeTokens.length === 0) {
            return NextResponse.json({
                error: "No active push tokens found",
                client: {
                    id: client.id,
                    name: client.name,
                    app_notifications_enabled: client.app_notifications_enabled,
                },
                tokens: tokens || [],
                hint: "Make sure the app has registered a push token first",
            }, { status: 400, headers: corsHeaders });
        }

        // Send the push notification
        const sent = await sendPushNotification({
            clientId: client.id,
            type: "APPOINTMENT_UPDATED",
            title,
            body,
            data: { deepLink: "/my-bookings" },
        });

        return NextResponse.json({
            success: sent,
            message: sent ? "Push notification sent!" : "Failed to send",
            client: {
                id: client.id,
                name: client.name,
                app_notifications_enabled: client.app_notifications_enabled,
            },
            activeTokens: activeTokens.length,
        }, { headers: corsHeaders });
    } catch (error) {
        console.error("Error sending test notification:", error);
        return NextResponse.json(
            { error: "Failed to send test notification", details: String(error) },
            { status: 500, headers: corsHeaders }
        );
    }
}
