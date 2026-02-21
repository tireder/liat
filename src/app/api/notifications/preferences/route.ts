import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

// GET /api/notifications/preferences?phone=... – Get notification preferences
// GET /api/notifications/preferences?phone=...&action=update&key=value – Update (mobile GET workaround)
export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get("phone");
        const action = searchParams.get("action");

        if (!phone) {
            return NextResponse.json(
                { error: "Phone required" },
                { status: 400, headers: corsHeaders }
            );
        }

        const normalizedPhone = formatPhone(phone);

        // UPDATE via GET (mobile workaround for Vercel POST blocking)
        if (action === "update") {
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

            const updateData: Record<string, boolean> = {};
            const boolParam = (key: string) => {
                const val = searchParams.get(key);
                if (val === "true") return true;
                if (val === "false") return false;
                return undefined;
            };

            const appNotif = boolParam("app_notifications_enabled");
            const smsMkt = boolParam("sms_marketing");
            const smsRev = boolParam("sms_reviews");
            const smsRet = boolParam("sms_return_reminders");

            if (appNotif !== undefined) updateData.app_notifications_enabled = appNotif;
            if (smsMkt !== undefined) updateData.sms_marketing = smsMkt;
            if (smsRev !== undefined) updateData.sms_reviews = smsRev;
            if (smsRet !== undefined) updateData.sms_return_reminders = smsRet;

            // If disabling app notifications, also deactivate all push tokens
            if (appNotif === false) {
                await supabase
                    .from("push_tokens")
                    .update({ active: false })
                    .eq("client_id", client.id);
            }

            const { error } = await supabase
                .from("clients")
                .update(updateData)
                .eq("id", client.id);

            if (error) throw error;

            return NextResponse.json(
                { success: true, message: "ההעדפות עודכנו בהצלחה" },
                { headers: corsHeaders }
            );
        }

        // DEFAULT: Read preferences
        const { data: client } = await supabase
            .from("clients")
            .select("app_notifications_enabled, sms_marketing, sms_reviews, sms_return_reminders")
            .eq("phone", normalizedPhone)
            .single();

        if (!client) {
            return NextResponse.json(
                { error: "Client not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json({
            app_notifications_enabled: client.app_notifications_enabled ?? false,
            sms_marketing: client.sms_marketing ?? true,
            sms_reviews: client.sms_reviews ?? true,
            sms_return_reminders: client.sms_return_reminders ?? true,
        }, { headers: corsHeaders });
    } catch (error) {
        console.error("Error getting notification preferences:", error);
        return NextResponse.json(
            { error: "Failed to get preferences" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// POST /api/notifications/preferences – Update notification preferences
export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { phone, app_notifications_enabled, sms_marketing, sms_reviews, sms_return_reminders } = body;

        if (!phone) {
            return NextResponse.json(
                { error: "Phone required" },
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

        const updateData: Record<string, boolean> = {};
        if (app_notifications_enabled !== undefined) updateData.app_notifications_enabled = app_notifications_enabled;
        if (sms_marketing !== undefined) updateData.sms_marketing = sms_marketing;
        if (sms_reviews !== undefined) updateData.sms_reviews = sms_reviews;
        if (sms_return_reminders !== undefined) updateData.sms_return_reminders = sms_return_reminders;

        // If disabling app notifications, also deactivate all push tokens
        if (app_notifications_enabled === false) {
            await supabase
                .from("push_tokens")
                .update({ active: false })
                .eq("client_id", client.id);
        }

        const { error } = await supabase
            .from("clients")
            .update(updateData)
            .eq("id", client.id);

        if (error) throw error;

        return NextResponse.json(
            { success: true, message: "ההעדפות עודכנו בהצלחה" },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error("Error updating notification preferences:", error);
        return NextResponse.json(
            { error: "Failed to update preferences" },
            { status: 500, headers: corsHeaders }
        );
    }
}
