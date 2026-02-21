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

// CORS headers for mobile app
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// OPTIONS handler for preflight requests
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/otp/send?phone=XXXXXXXXXX - Send OTP via SMS4Free (workaround for mobile POST issues)
export async function GET(request: NextRequest) {
    const phone = request.nextUrl.searchParams.get("phone");

    if (!phone) {
        return NextResponse.json({ error: "Phone number required" }, { status: 400, headers: corsHeaders });
    }

    try {
        const formattedPhone = formatPhone(phone);
        console.log(`[OTP SEND] Processing phone: ${formattedPhone}`);

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        const supabase = createAdminClient();

        // Rate-limit: reject if an OTP was sent within the last 30 seconds
        const { data: recent } = await supabase
            .from("otp_codes")
            .select("created_at")
            .eq("phone", formattedPhone)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (recent?.created_at) {
            const secondsAgo = (Date.now() - new Date(recent.created_at).getTime()) / 1000;
            if (secondsAgo < 30) {
                return NextResponse.json(
                    { error: `ניתן לשלוח קוד חדש בעוד ${Math.ceil(30 - secondsAgo)} שניות` },
                    { status: 429, headers: corsHeaders }
                );
            }
        }

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
            .select("key, value")
            .in("key", ["business_name", "sms_sender"]);

        type SettingRow = { key: string; value: string };
        const businessName = (settings as SettingRow[] | null)?.find(s => s.key === "business_name")?.value || "ליאת";
        const smsSettingValue = (settings as SettingRow[] | null)?.find(s => s.key === "sms_sender")?.value;
        const sender = smsSettingValue && smsSettingValue.trim() ? smsSettingValue.trim() : businessName;

        // Send SMS
        await sendSms({
            sender,
            recipients: formattedPhone,
            msg: `קוד האימות שלך הוא: ${otp}\n\n@liat-nails.art #${otp}`,
        });


        return NextResponse.json({ success: true, message: "OTP sent" }, { headers: corsHeaders });
    } catch (error) {
        console.error("Error sending OTP:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to send OTP" },
            { status: 500, headers: corsHeaders }
        );
    }
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

        // Rate-limit: reject if an OTP was sent within the last 30 seconds
        const { data: recent } = await supabase
            .from("otp_codes")
            .select("created_at")
            .eq("phone", formattedPhone)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (recent?.created_at) {
            const secondsAgo = (Date.now() - new Date(recent.created_at).getTime()) / 1000;
            if (secondsAgo < 30) {
                return NextResponse.json(
                    { error: `ניתן לשלוח קוד חדש בעוד ${Math.ceil(30 - secondsAgo)} שניות` },
                    { status: 429 }
                );
            }
        }

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
            .select("key, value")
            .in("key", ["business_name", "sms_sender"]);

        const businessName = settings?.find(s => s.key === "business_name")?.value || "ליאת";
        const smsSettingValue = settings?.find(s => s.key === "sms_sender")?.value;
        const sender = smsSettingValue && smsSettingValue.trim() ? smsSettingValue.trim() : businessName;

        // Send SMS
        await sendSms({
            sender,
            recipients: formattedPhone,
            msg: `קוד האימות שלך הוא: ${otp}\n\n@liat-nails.art #${otp}`,
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
