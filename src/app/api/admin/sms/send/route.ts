import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/sms4free";

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

// POST /api/admin/sms/send - Send SMS to clients
export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { message, clientIds, sendToAll } = await request.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Get business name for sender
        const { data: settings } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "business_name")
            .single();

        const sender = settings?.value || "Liart";

        let recipients: string[] = [];

        if (sendToAll) {
            // Get all client phones
            const { data: clients, error } = await supabase
                .from("clients")
                .select("phone");

            if (error) throw error;

            recipients = clients?.map(c => formatPhone(c.phone)) || [];
        } else if (clientIds && clientIds.length > 0) {
            // Get selected client phones
            const { data: clients, error } = await supabase
                .from("clients")
                .select("phone")
                .in("id", clientIds);

            if (error) throw error;

            recipients = clients?.map(c => formatPhone(c.phone)) || [];
        }

        if (recipients.length === 0) {
            return NextResponse.json({ error: "No recipients selected" }, { status: 400 });
        }

        // Send SMS (recipients joined with semicolon for bulk)
        const result = await sendSms({
            sender,
            recipients: recipients.join(";"),
            msg: message,
        });

        // Log the SMS send (table might not exist)
        try {
            await supabase.from("sms_logs").insert({
                message,
                recipient_count: recipients.length,
                sent_at: new Date().toISOString(),
            });
        } catch {
            // Ignore if table doesn't exist
        }

        return NextResponse.json({
            success: true,
            sent_to: recipients.length,
            result,
        });
    } catch (error) {
        console.error("Error sending SMS:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to send SMS" },
            { status: 500 }
        );
    }
}
