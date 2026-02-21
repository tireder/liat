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

// CORS headers for mobile app
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Shared OTP verification logic
async function verifyOtp(phone: string, code: string): Promise<NextResponse> {
    try {
        const formattedPhone = formatPhone(phone);
        const supabase = createAdminClient();

        // Get OTP record
        const { data: otpRecord, error: fetchError } = await supabase
            .from("otp_codes")
            .select("*")
            .eq("phone", formattedPhone)
            .single();

        if (fetchError || !otpRecord) {
            return NextResponse.json({ error: "קוד לא נמצא. נסי לשלוח שוב." }, { status: 400, headers: corsHeaders });
        }

        // Check if expired
        if (new Date(otpRecord.expires_at) < new Date()) {
            await supabase.from("otp_codes").delete().eq("phone", formattedPhone);
            return NextResponse.json({ error: "הקוד פג תוקף. נסי לשלוח שוב." }, { status: 400, headers: corsHeaders });
        }

        // Check attempts (max 3)
        if (otpRecord.attempts >= 3) {
            await supabase.from("otp_codes").delete().eq("phone", formattedPhone);
            return NextResponse.json({ error: "יותר מדי ניסיונות. נסי לשלוח קוד חדש." }, { status: 400, headers: corsHeaders });
        }

        // Verify code
        if (otpRecord.code !== code) {
            // Increment attempts
            await supabase
                .from("otp_codes")
                .update({ attempts: otpRecord.attempts + 1 })
                .eq("phone", formattedPhone);

            return NextResponse.json({ error: "קוד שגוי" }, { status: 400, headers: corsHeaders });
        }

        // Success - delete OTP record
        await supabase.from("otp_codes").delete().eq("phone", formattedPhone);

        // Check if client exists
        const { data: existingClient, error: clientError } = await supabase
            .from("clients")
            .select("id, name")
            .eq("phone", formattedPhone)
            .single();

        console.log('[OTP Verify] Phone:', formattedPhone, 'Existing client:', existingClient, 'Error:', clientError);

        const isNewClient = !existingClient;

        console.log('[OTP Verify] isNewClient:', isNewClient);

        return NextResponse.json({
            success: true,
            verified: true,
            isNewClient,
            clientName: existingClient?.name || null
        }, { headers: corsHeaders });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return NextResponse.json(
            { error: "שגיאה באימות הקוד" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// OPTIONS handler for preflight requests
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/otp/verify?phone=XXX&code=XXX - Verify OTP (workaround for mobile POST issues)
export async function GET(request: NextRequest) {
    const phone = request.nextUrl.searchParams.get("phone");
    const code = request.nextUrl.searchParams.get("code");

    if (!phone || !code) {
        return NextResponse.json({ error: "Phone and code required" }, { status: 400, headers: corsHeaders });
    }

    return verifyOtp(phone, code);
}

// POST /api/otp/verify - Verify OTP code
export async function POST(request: NextRequest) {
    try {
        const { phone, code } = await request.json();

        if (!phone || !code) {
            return NextResponse.json({ error: "Phone and code required" }, { status: 400, headers: corsHeaders });
        }

        return verifyOtp(phone, code);
    } catch (error) {
        console.error("Error parsing request:", error);
        return NextResponse.json(
            { error: "Invalid request" },
            { status: 400, headers: corsHeaders }
        );
    }
}
