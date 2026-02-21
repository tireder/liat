import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/work-photos - Get all work photos
export async function GET() {
    try {
        const supabase = createAdminClient();

        const { data: photos, error } = await supabase
            .from("work_photos")
            .select(`
                *,
                client:clients(name),
                booking:bookings(date, service:services(name))
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json(photos || []);
    } catch (error) {
        console.error("Error fetching work photos:", error);
        return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
    }
}

// POST /api/admin/work-photos - Upload new work photo pair
export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const formData: any = await request.formData();

        const beforeFile = formData.get("before") as File | null;
        const afterFile = formData.get("after") as File | null;
        const clientId = formData.get("clientId") as string | null;
        const bookingId = formData.get("bookingId") as string | null;
        const description = formData.get("description") as string || "";
        const isPublic = formData.get("public") === "true";

        if (!beforeFile || !afterFile) {
            return NextResponse.json({ error: "Both before and after images required" }, { status: 400 });
        }

        // Upload before image
        const beforeExt = beforeFile.name.split(".").pop();
        const beforeFilename = `before_${Date.now()}.${beforeExt}`;
        const { data: beforeUpload, error: beforeError } = await supabase.storage
            .from("work-photos")
            .upload(beforeFilename, beforeFile, { cacheControl: "3600" });
        if (beforeError) throw beforeError;
        const { data: beforeUrl } = supabase.storage.from("work-photos").getPublicUrl(beforeUpload.path);

        // Upload after image
        const afterExt = afterFile.name.split(".").pop();
        const afterFilename = `after_${Date.now()}.${afterExt}`;
        const { data: afterUpload, error: afterError } = await supabase.storage
            .from("work-photos")
            .upload(afterFilename, afterFile, { cacheControl: "3600" });
        if (afterError) throw afterError;
        const { data: afterUrl } = supabase.storage.from("work-photos").getPublicUrl(afterUpload.path);

        // Create work photo record
        const { data: photo, error: insertError } = await supabase
            .from("work_photos")
            .insert({
                before_url: beforeUrl.publicUrl,
                after_url: afterUrl.publicUrl,
                client_id: clientId || null,
                booking_id: bookingId || null,
                description: description || null,
                public: isPublic,
            })
            .select()
            .single();

        if (insertError) throw insertError;

        return NextResponse.json(photo, { status: 201 });
    } catch (error) {
        console.error("Error uploading work photo:", error);
        return NextResponse.json({ error: "Failed to upload photos" }, { status: 500 });
    }
}

// PUT /api/admin/work-photos - Update work photo
export async function PUT(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { id, description, public: isPublic } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (description !== undefined) updateData.description = description;
        if (isPublic !== undefined) updateData.public = isPublic;

        const { data, error } = await supabase
            .from("work_photos")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating work photo:", error);
        return NextResponse.json({ error: "Failed to update photo" }, { status: 500 });
    }
}

// DELETE /api/admin/work-photos - Delete work photo
export async function DELETE(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
        }

        // Get photo URLs to delete from storage
        const { data: photo } = await supabase
            .from("work_photos")
            .select("before_url, after_url")
            .eq("id", id)
            .single();

        if (photo) {
            // Extract filenames and delete from storage
            const beforeFilename = photo.before_url?.split("/").pop();
            const afterFilename = photo.after_url?.split("/").pop();
            if (beforeFilename) await supabase.storage.from("work-photos").remove([beforeFilename]);
            if (afterFilename) await supabase.storage.from("work-photos").remove([afterFilename]);
        }

        const { error } = await supabase.from("work_photos").delete().eq("id", id);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting work photo:", error);
        return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
    }
}
