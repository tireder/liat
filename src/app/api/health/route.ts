import { NextResponse } from "next/server";

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

// GET /api/health - Simple health check endpoint
export async function GET() {
    return NextResponse.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        message: "API is working!"
    }, { headers: corsHeaders });
}

// POST /api/health - Test POST endpoint
export async function POST(request: Request) {
    try {
        const body = await request.json();
        return NextResponse.json({
            status: "ok",
            received: body,
            message: "POST is working!"
        }, { headers: corsHeaders });
    } catch {
        return NextResponse.json({
            status: "ok",
            message: "POST received (no body)"
        }, { headers: corsHeaders });
    }
}
