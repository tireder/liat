import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/services - Get all services for admin
export async function GET() {
    try {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("services")
            .select("*")
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true });

        if (error) {
            console.error("Error fetching services:", error);
            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error("Error in admin services:", error);
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
}

// POST /api/admin/services - Create a new service
export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { name, description, duration, price, active, sort_order, reminder_days } = body;

        if (!name || !duration || price === undefined) {
            return NextResponse.json(
                { error: "Missing required fields: name, duration, price" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("services")
            .insert({
                name,
                description: description || null,
                duration: parseInt(duration),
                price: parseFloat(price),
                active: active !== false,
                sort_order: sort_order || 0,
                reminder_days: reminder_days ? parseInt(reminder_days) : null,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating service:", error);
            throw error;
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Error creating service:", error);
        return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
    }
}

// PUT /api/admin/services - Update a service
export async function PUT(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { id, name, description, duration, price, active, sort_order, reminder_days } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing service id" }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (duration !== undefined) updateData.duration = parseInt(duration);
        if (price !== undefined) updateData.price = parseFloat(price);
        if (active !== undefined) updateData.active = active;
        if (sort_order !== undefined) updateData.sort_order = sort_order;
        if (reminder_days !== undefined) updateData.reminder_days = reminder_days ? parseInt(reminder_days) : null;

        const { data, error } = await supabase
            .from("services")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error updating service:", error);
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating service:", error);
        return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
    }
}

// DELETE /api/admin/services - Delete a service
export async function DELETE(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const serviceId = searchParams.get("id");

        if (!serviceId) {
            return NextResponse.json({ error: "Missing service id" }, { status: 400 });
        }

        // Check if service has any bookings
        const { data: bookings } = await supabase
            .from("bookings")
            .select("id")
            .eq("service_id", serviceId)
            .limit(1);

        if (bookings && bookings.length > 0) {
            return NextResponse.json(
                { error: "Cannot delete service with existing bookings. Deactivate it instead." },
                { status: 400 }
            );
        }

        const { error } = await supabase.from("services").delete().eq("id", serviceId);

        if (error) {
            console.error("Error deleting service:", error);
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting service:", error);
        return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
    }
}
