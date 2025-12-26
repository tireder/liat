import { NextResponse } from "next/server";
import { getSupabase, Service } from "@/lib/database.types";

// GET /api/services - Get all active services
export async function GET() {
    try {
        const supabase = await getSupabase();

        const { data, error } = await supabase
            .from("services")
            .select("*")
            .eq("active", true)
            .order("sort_order", { ascending: true });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json(
            { error: "Failed to fetch services" },
            { status: 500 }
        );
    }
}

// POST /api/services - Create a new service (admin only)
export async function POST(request: Request) {
    try {
        const supabase = await getSupabase();
        const body = await request.json();
        const { name, description, duration, price } = body;

        if (!name || !duration || price === undefined) {
            return NextResponse.json(
                { error: "Missing required fields: name, duration, price" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("services")
            .insert({ name, description, duration, price })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Error creating service:", error);
        return NextResponse.json(
            { error: "Failed to create service" },
            { status: 500 }
        );
    }
}
