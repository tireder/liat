import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/courses - Get all courses with enrollment counts for admin
export async function GET() {
    try {
        const supabase = createAdminClient();

        // Get all courses (including inactive)
        const { data: courses, error: coursesError } = await supabase
            .from("courses")
            .select("*")
            .order("date", { ascending: true });

        if (coursesError) {
            console.error("Error fetching courses:", coursesError);
            throw coursesError;
        }

        // Get registration counts
        const { data: counts, error: countsError } = await supabase
            .from("course_registrations")
            .select("course_id, status");

        if (countsError) {
            console.error("Error fetching counts:", countsError);
        }

        // Count registrations per course
        const enrollmentMap: Record<string, { confirmed: number; cancelled: number; waitlist: number }> = {};
        counts?.forEach((reg) => {
            if (!enrollmentMap[reg.course_id]) {
                enrollmentMap[reg.course_id] = { confirmed: 0, cancelled: 0, waitlist: 0 };
            }
            if (reg.status === "confirmed") {
                enrollmentMap[reg.course_id].confirmed++;
            } else if (reg.status === "cancelled") {
                enrollmentMap[reg.course_id].cancelled++;
            } else if (reg.status === "waitlist") {
                enrollmentMap[reg.course_id].waitlist++;
            }
        });

        // Add enrollment data to courses
        const coursesWithEnrollment = courses?.map((course) => ({
            ...course,
            enrolled: enrollmentMap[course.id]?.confirmed || 0,
            waitlist: enrollmentMap[course.id]?.waitlist || 0,
        }));

        return NextResponse.json(coursesWithEnrollment || []);
    } catch (error) {
        console.error("Error in admin courses:", error);
        return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
    }
}

// POST /api/admin/courses - Create a new course
export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { name, description, date, duration, price, capacity, active, location, schedule_info, whatsapp_group_link } = body;

        if (!name || !date || !duration || price === undefined || !capacity) {
            return NextResponse.json(
                { error: "Missing required fields: name, date, duration, price, capacity" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("courses")
            .insert({
                name,
                description: description || null,
                date,
                duration,
                price: parseFloat(price),
                capacity: parseInt(capacity),
                active: active !== false,
                location: location || null,
                schedule_info: schedule_info || null,
                whatsapp_group_link: whatsapp_group_link || null
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating course:", error);
            throw error;
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Error creating course:", error);
        return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
    }
}

// PUT /api/admin/courses - Update a course
export async function PUT(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { id, name, description, date, duration, price, capacity, active, location, schedule_info, whatsapp_group_link } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing course id" }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (date !== undefined) updateData.date = date;
        if (duration !== undefined) updateData.duration = duration;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (capacity !== undefined) updateData.capacity = parseInt(capacity);
        if (active !== undefined) updateData.active = active;
        if (location !== undefined) updateData.location = location;
        if (schedule_info !== undefined) updateData.schedule_info = schedule_info;
        if (whatsapp_group_link !== undefined) updateData.whatsapp_group_link = whatsapp_group_link;

        const { data, error } = await supabase
            .from("courses")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error updating course:", error);
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating course:", error);
        return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
    }
}

// DELETE /api/admin/courses - Delete a course
export async function DELETE(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("id");

        if (!courseId) {
            return NextResponse.json({ error: "Missing course id" }, { status: 400 });
        }

        // Check if course has registrations
        const { data: registrations } = await supabase
            .from("course_registrations")
            .select("id")
            .eq("course_id", courseId)
            .limit(1);

        if (registrations && registrations.length > 0) {
            return NextResponse.json(
                { error: "לא ניתן למחוק קורס עם נרשמים. השבתי אותו במקום." },
                { status: 400 }
            );
        }

        const { error } = await supabase.from("courses").delete().eq("id", courseId);

        if (error) {
            console.error("Error deleting course:", error);
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting course:", error);
        return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
    }
}
