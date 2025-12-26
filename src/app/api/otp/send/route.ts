import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/sms4free";

// Generate 6-digit OTP code
function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Format phone number for Israeli format
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

// POST /api/otp/send - Send OTP via SMS4Free
export async function POST(request: NextRequest) {
    try {
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: "Phone number required" }, { status: 400 });
        }

        const formattedPhone = formatPhone(phone);
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        const supabase = createAdminClient();

        // Delete any existing OTP for this phone
        await supabase
            .from("otp_codes")
            .delete()
            .eq("phone", formattedPhone);

        // Insert new OTP
        const { error: insertError } = await supabase
            .from("otp_codes")
            .insert({
                phone: formattedPhone,
                code: otp,
                expires_at: expiresAt.toISOString(),
                attempts: 0,
            });

        if (insertError) {
            console.error("Error storing OTP:", insertError);
            throw insertError;
        }

        // Get sender name from settings
        const { data: settings } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "business_name")
            .single();

        const sender = settings?.value || "Liart";

        // Send SMS
        await sendSms({
            sender,
            recipients: formattedPhone,
            msg: `קוד האימות שלך הוא: ${otp}`,
        });

        return NextResponse.json({ success: true, message: "OTP sent" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to send OTP" },
            { status: 500 }
        );
    }
}
