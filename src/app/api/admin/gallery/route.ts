import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/gallery - Get all gallery images (including inactive)
export async function GET() {
    try {
        const supabase = createAdminClient();

        const { data: images, error } = await supabase
            .from("gallery_images")
            .select("*")
            .order("sort_order", { ascending: true });

        if (error) throw error;

        return NextResponse.json(images || []);
    } catch (error) {
        console.error("Error fetching gallery:", error);
        return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
    }
}

// POST /api/admin/gallery - Upload new image
export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const formData: any = await request.formData();
        const file = formData.get("file") as File;
        const alt = formData.get("alt") as string || "";
        const category = formData.get("category") as string || "general";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Generate unique filename
        const ext = file.name.split(".").pop();
        const filename = `gallery_${Date.now()}.${ext}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("gallery")
            .upload(filename, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from("gallery")
            .getPublicUrl(uploadData.path);

        // Get current max sort_order
        const { data: maxOrder } = await supabase
            .from("gallery_images")
            .select("sort_order")
            .order("sort_order", { ascending: false })
            .limit(1)
            .single();

        const newSortOrder = (maxOrder?.sort_order || 0) + 1;

        // Create gallery record
        const { data: image, error: insertError } = await supabase
            .from("gallery_images")
            .insert({
                url: urlData.publicUrl,
                alt: alt || null,
                category: category,
                sort_order: newSortOrder,
                active: true,
            })
            .select()
            .single();

        if (insertError) {
            console.error("Insert error:", insertError);
            throw insertError;
        }

        return NextResponse.json(image, { status: 201 });
    } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }
}

// PUT /api/admin/gallery - Update image
export async function PUT(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { id, alt, sort_order, active, category } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing image id" }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (alt !== undefined) updateData.alt = alt;
        if (sort_order !== undefined) updateData.sort_order = sort_order;
        if (active !== undefined) updateData.active = active;
        if (category !== undefined) updateData.category = category;

        const { data, error } = await supabase
            .from("gallery_images")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating image:", error);
        return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
    }
}

// DELETE /api/admin/gallery - Delete image
export async function DELETE(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const imageId = searchParams.get("id");

        if (!imageId) {
            return NextResponse.json({ error: "Missing image id" }, { status: 400 });
        }

        // Get image URL to delete from storage
        const { data: image } = await supabase
            .from("gallery_images")
            .select("url")
            .eq("id", imageId)
            .single();

        if (image?.url) {
            // Extract filename from URL
            const urlParts = image.url.split("/");
            const filename = urlParts[urlParts.length - 1];

            // Delete from storage
            await supabase.storage.from("gallery").remove([filename]);
        }

        // Delete from database
        const { error } = await supabase
            .from("gallery_images")
            .delete()
            .eq("id", imageId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting image:", error);
        return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }
}
