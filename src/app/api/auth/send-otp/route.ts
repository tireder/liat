import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// In production, use Supabase Auth or a proper SMS service
// This is a simplified OTP flow for demonstration

// Temporary in-memory OTP storage (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// POST /api/auth/send-otp - Send OTP to phone number
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone } = body;

        if (!phone) {
            return NextResponse.json(
                { error: "Phone number is required" },
                { status: 400 }
            );
        }

        // Normalize phone number
        const normalizedPhone = phone.replace(/[^0-9+]/g, "");

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with 5-minute expiry
        const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "5");
        otpStore.set(normalizedPhone, {
            otp,
            expiresAt: Date.now() + expiryMinutes * 60 * 1000,
        });

        // In production, send SMS via Twilio, Vonage, etc.
        // Log OTP for development only
        if (process.env.NODE_ENV === "development") {
            console.log(`[DEV] OTP for ${normalizedPhone}: ${otp}`);
        }

        return NextResponse.json({
            success: true,
            message: "OTP sent successfully",
            // Only include OTP in development for testing
            ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
        });
    } catch (error) {
        console.error("Error sending OTP:", error);
        return NextResponse.json(
            { error: "Failed to send OTP" },
            { status: 500 }
        );
    }
}

// PUT /api/auth/send-otp - Verify OTP
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, otp } = body;

        if (!phone || !otp) {
            return NextResponse.json(
                { error: "Phone and OTP are required" },
                { status: 400 }
            );
        }

        const normalizedPhone = phone.replace(/[^0-9+]/g, "");
        const storedData = otpStore.get(normalizedPhone);

        if (!storedData) {
            return NextResponse.json(
                { error: "OTP not found or expired" },
                { status: 400 }
            );
        }

        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(normalizedPhone);
            return NextResponse.json(
                { error: "OTP expired" },
                { status: 400 }
            );
        }

        if (storedData.otp !== otp) {
            return NextResponse.json(
                { error: "Invalid OTP" },
                { status: 400 }
            );
        }

        // OTP verified - clean up
        otpStore.delete(normalizedPhone);

        // Find or create client using Supabase
        const supabase = createAdminClient();

        let { data: client } = await supabase
            .from("clients")
            .select("*")
            .eq("phone", normalizedPhone)
            .single();

        if (!client) {
            const { data: newClient, error } = await supabase
                .from("clients")
                .insert({ phone: normalizedPhone })
                .select()
                .single();

            if (error) {
                console.error("Error creating client:", error);
                throw error;
            }
            client = newClient;
        }

        // In production, create a proper session/JWT here
        // For now, return client data
        return NextResponse.json({
            success: true,
            client: {
                id: client.id,
                phone: client.phone,
                name: client.name,
            },
        });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return NextResponse.json(
            { error: "Failed to verify OTP" },
            { status: 500 }
        );
    }
}
