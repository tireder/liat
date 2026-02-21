import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/cron/keep-alive - Cron job to keep Supabase active
export async function GET(request: NextRequest) {
    // Verify cron secret (Vercel sends this automatically)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = createAdminClient();
        const now = new Date().toISOString();

        // Upsert into alive table
        const { error } = await supabase
            .from("alive")
            .upsert({
                id: 1,
                timestamp: now,
                log: `Keep-alive ping at ${now}`,
            }, { onConflict: "id" });

        if (error) {
            console.error("Keep-alive error:", error);
            return NextResponse.json({
                success: false,
                error: error.message,
                timestamp: now,
            }, { status: 500 });
        }

        console.log(`Keep-alive successful at ${now}`);
        return NextResponse.json({
            success: true,
            message: "Keep-alive ping successful",
            timestamp: now,
        });
    } catch (error) {
        console.error("Keep-alive error:", error);
        return NextResponse.json({
            success: false,
            error: "Keep-alive failed",
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
