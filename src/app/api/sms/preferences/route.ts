import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/sms/preferences - Get SMS preferences by phone
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

        const { data: client } = await supabase
            .from("clients")
            .select("sms_marketing, sms_reviews, sms_return_reminders")
            .eq("phone", normalizedPhone)
            .single();

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        return NextResponse.json({
            sms_marketing: client.sms_marketing ?? true,
            sms_reviews: client.sms_reviews ?? true,
            sms_return_reminders: client.sms_return_reminders ?? true,
        });
    } catch (error) {
        console.error("Error getting SMS preferences:", error);
        return NextResponse.json({ error: "Failed to get preferences" }, { status: 500 });
    }
}

// POST /api/sms/preferences - Update SMS preferences
export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { phone, sms_marketing, sms_reviews, sms_return_reminders } = await request.json();

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
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        const updateData: Record<string, boolean> = {};
        if (sms_marketing !== undefined) updateData.sms_marketing = sms_marketing;
        if (sms_reviews !== undefined) updateData.sms_reviews = sms_reviews;
        if (sms_return_reminders !== undefined) updateData.sms_return_reminders = sms_return_reminders;

        const { error } = await supabase
            .from("clients")
            .update(updateData)
            .eq("id", client.id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "ההעדפות עודכנו בהצלחה" });
    } catch (error) {
        console.error("Error updating SMS preferences:", error);
        return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
    }
}
