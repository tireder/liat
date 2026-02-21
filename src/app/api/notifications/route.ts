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

// GET /api/notifications?phone=...&limit=...&unreadOnly=... – Get notification history
// GET /api/notifications?phone=...&action=markAllRead – Mark all as read (mobile GET workaround)
// GET /api/notifications?phone=...&action=markRead&ids=id1,id2 – Mark specific as read
export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get("phone");
        const action = searchParams.get("action");
        const limit = parseInt(searchParams.get("limit") || "20");
        const unreadOnly = searchParams.get("unreadOnly") === "true";

        if (!phone) {
            return NextResponse.json(
                { error: "Phone required" },
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

        // Mark all as read (mobile GET workaround)
        if (action === "markAllRead") {
            await supabase
                .from("notifications")
                .update({ read: true })
                .eq("client_id", client.id)
                .eq("read", false);

            return NextResponse.json({ success: true }, { headers: corsHeaders });
        }

        // Mark specific notifications as read (mobile GET workaround)
        if (action === "markRead") {
            const ids = searchParams.get("ids")?.split(",").filter(Boolean);
            if (ids && ids.length > 0) {
                await supabase
                    .from("notifications")
                    .update({ read: true })
                    .eq("client_id", client.id)
                    .in("id", ids);
            }
            return NextResponse.json({ success: true }, { headers: corsHeaders });
        }

        // DEFAULT: List notifications
        let query = supabase
            .from("notifications")
            .select("id, type, title, body, data, read, sent_at")
            .eq("client_id", client.id)
            .order("sent_at", { ascending: false })
            .limit(limit);

        if (unreadOnly) {
            query = query.eq("read", false);
        }

        const { data: notifications, error } = await query;
        if (error) throw error;

        // Get unread count
        const { count } = await supabase
            .from("notifications")
            .select("id", { count: "exact", head: true })
            .eq("client_id", client.id)
            .eq("read", false);

        return NextResponse.json({
            notifications: notifications || [],
            unreadCount: count || 0,
        }, { headers: corsHeaders });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// POST /api/notifications – Mark notifications as read
// Body: { phone, notificationIds: string[] } or { phone, markAllRead: true }
export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { phone, notificationIds, markAllRead } = await request.json();

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

        if (markAllRead) {
            await supabase
                .from("notifications")
                .update({ read: true })
                .eq("client_id", client.id)
                .eq("read", false);
        } else if (notificationIds && Array.isArray(notificationIds)) {
            await supabase
                .from("notifications")
                .update({ read: true })
                .eq("client_id", client.id)
                .in("id", notificationIds);
        } else {
            return NextResponse.json(
                { error: "notificationIds or markAllRead required" },
                { status: 400, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            { success: true },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return NextResponse.json(
            { error: "Failed to update notifications" },
            { status: 500, headers: corsHeaders }
        );
    }
}
