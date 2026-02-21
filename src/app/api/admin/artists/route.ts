import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

// Helper to check if current user is owner
async function requireOwner() {
    const serverClient = await createClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) return null;

    const supabase = createAdminClient();
    const { data: artist } = await supabase
        .from("nail_artists")
        .select("id, role")
        .eq("auth_user_id", user.id)
        .single();

    if (!artist || artist.role !== "owner") return null;
    return artist;
}

// GET /api/admin/artists - List all artists (owner only)
export async function GET() {
    try {
        const owner = await requireOwner();
        if (!owner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const supabase = createAdminClient();
        const { data: artists, error } = await supabase
            .from("nail_artists")
            .select("*")
            .order("sort_order", { ascending: true });

        if (error) throw error;

        // Get service assignments
        const { data: assignments } = await supabase
            .from("artist_services")
            .select("artist_id, service_id");

        const result = (artists || []).map((artist) => ({
            ...artist,
            serviceIds: (assignments || [])
                .filter((a) => a.artist_id === artist.id)
                .map((a) => a.service_id),
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching artists:", error);
        return NextResponse.json({ error: "Failed to fetch artists" }, { status: 500 });
    }
}

// POST /api/admin/artists - Create a new artist (owner only)
export async function POST(request: NextRequest) {
    try {
        const owner = await requireOwner();
        if (!owner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const { name, phone, email, password, serviceIds } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields: name, email, password" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Create Supabase Auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (authError) {
            console.error("Error creating auth user:", authError);
            return NextResponse.json(
                { error: `Failed to create login: ${authError.message}` },
                { status: 400 }
            );
        }

        // Create nail_artists record
        const { data: artist, error: artistError } = await supabase
            .from("nail_artists")
            .insert({
                auth_user_id: authUser.user.id,
                name,
                phone: phone || null,
                role: "artist",
            })
            .select()
            .single();

        if (artistError) {
            // Cleanup: delete the auth user if artist creation fails
            await supabase.auth.admin.deleteUser(authUser.user.id);
            throw artistError;
        }

        // Assign services if provided
        if (serviceIds && serviceIds.length > 0) {
            const assignments = serviceIds.map((serviceId: string) => ({
                artist_id: artist.id,
                service_id: serviceId,
            }));

            await supabase.from("artist_services").insert(assignments);
        }

        return NextResponse.json(artist, { status: 201 });
    } catch (error) {
        console.error("Error creating artist:", error);
        return NextResponse.json({ error: "Failed to create artist" }, { status: 500 });
    }
}

// PUT /api/admin/artists - Update an artist (owner only)
export async function PUT(request: NextRequest) {
    try {
        const owner = await requireOwner();
        if (!owner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const { id, name, phone, active, serviceIds, newPassword } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing artist id" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Update artist record
        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (active !== undefined) updateData.active = active;

        if (Object.keys(updateData).length > 0) {
            const { error } = await supabase
                .from("nail_artists")
                .update(updateData)
                .eq("id", id);

            if (error) throw error;
        }

        // Update password if provided
        if (newPassword) {
            const { data: artist } = await supabase
                .from("nail_artists")
                .select("auth_user_id")
                .eq("id", id)
                .single();

            if (artist?.auth_user_id) {
                await supabase.auth.admin.updateUserById(artist.auth_user_id, {
                    password: newPassword,
                });
            }
        }

        // Update service assignments if provided
        if (serviceIds !== undefined) {
            // Remove existing
            await supabase.from("artist_services").delete().eq("artist_id", id);

            // Add new
            if (serviceIds.length > 0) {
                const assignments = serviceIds.map((serviceId: string) => ({
                    artist_id: id,
                    service_id: serviceId,
                }));
                await supabase.from("artist_services").insert(assignments);
            }
        }

        // Return updated artist
        const { data: updated } = await supabase
            .from("nail_artists")
            .select("*")
            .eq("id", id)
            .single();

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating artist:", error);
        return NextResponse.json({ error: "Failed to update artist" }, { status: 500 });
    }
}

// DELETE /api/admin/artists - Soft-delete an artist (owner only)
export async function DELETE(request: NextRequest) {
    try {
        const owner = await requireOwner();
        if (!owner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const artistId = searchParams.get("id");

        if (!artistId) {
            return NextResponse.json({ error: "Missing artist id" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Don't allow deleting owner
        const { data: artist } = await supabase
            .from("nail_artists")
            .select("role")
            .eq("id", artistId)
            .single();

        if (artist?.role === "owner") {
            return NextResponse.json({ error: "Cannot delete owner" }, { status: 400 });
        }

        // Soft delete - just deactivate
        const { error } = await supabase
            .from("nail_artists")
            .update({ active: false })
            .eq("id", artistId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting artist:", error);
        return NextResponse.json({ error: "Failed to delete artist" }, { status: 500 });
    }
}
