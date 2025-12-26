import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

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

// POST /api/otp/verify - Verify OTP code
export async function POST(request: NextRequest) {
    try {
        const { phone, code } = await request.json();

        if (!phone || !code) {
            return NextResponse.json({ error: "Phone and code required" }, { status: 400 });
        }

        const formattedPhone = formatPhone(phone);
        const supabase = createAdminClient();

        // Get OTP record
        const { data: otpRecord, error: fetchError } = await supabase
            .from("otp_codes")
            .select("*")
            .eq("phone", formattedPhone)
            .single();

        if (fetchError || !otpRecord) {
            return NextResponse.json({ error: "קוד לא נמצא. נסי לשלוח שוב." }, { status: 400 });
        }

        // Check if expired
        if (new Date(otpRecord.expires_at) < new Date()) {
            await supabase.from("otp_codes").delete().eq("phone", formattedPhone);
            return NextResponse.json({ error: "הקוד פג תוקף. נסי לשלוח שוב." }, { status: 400 });
        }

        // Check attempts (max 3)
        if (otpRecord.attempts >= 3) {
            await supabase.from("otp_codes").delete().eq("phone", formattedPhone);
            return NextResponse.json({ error: "יותר מדי ניסיונות. נסי לשלוח קוד חדש." }, { status: 400 });
        }

        // Verify code
        if (otpRecord.code !== code) {
            // Increment attempts
            await supabase
                .from("otp_codes")
                .update({ attempts: otpRecord.attempts + 1 })
                .eq("phone", formattedPhone);

            return NextResponse.json({ error: "קוד שגוי" }, { status: 400 });
        }

        // Success - delete OTP record
        await supabase.from("otp_codes").delete().eq("phone", formattedPhone);

        // Create or update client record
        const { data: existingClient } = await supabase
            .from("clients")
            .select("id")
            .eq("phone", formattedPhone)
            .single();

        if (!existingClient) {
            await supabase.from("clients").insert({
                phone: formattedPhone,
                name: formattedPhone,
            });
        }

        return NextResponse.json({ success: true, verified: true });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return NextResponse.json(
            { error: "שגיאה באימות הקוד" },
            { status: 500 }
        );
    }
}
