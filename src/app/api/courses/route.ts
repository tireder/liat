import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/database.types";

// GET /api/courses - Get all active courses with enrollment count
export async function GET() {
    try {
        const supabase = await getSupabase();

        // Get courses
        const { data: courses, error: coursesError } = await supabase
            .from("courses")
            .select("*")
            .eq("active", true)
            .order("date", { ascending: true });

        if (coursesError) throw coursesError;

        // Get registration counts
        const { data: counts, error: countsError } = await supabase
            .from("course_registrations")
            .select("course_id")
            .eq("status", "confirmed");

        if (countsError) throw countsError;

        // Count registrations per course
        const enrollmentMap: Record<string, number> = {};
        counts?.forEach((reg) => {
            enrollmentMap[reg.course_id] = (enrollmentMap[reg.course_id] || 0) + 1;
        });

        // Add enrollment count to courses
        const coursesWithEnrollment = courses?.map((course) => ({
            ...course,
            enrolled: enrollmentMap[course.id] || 0,
        }));

        return NextResponse.json(coursesWithEnrollment);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return NextResponse.json(
            { error: "Failed to fetch courses" },
            { status: 500 }
        );
    }
}

// POST /api/courses - Create a new course (admin only)
export async function POST(request: Request) {
    try {
        const supabase = await getSupabase();
        const body = await request.json();
        const { name, description, date, duration, price, capacity } = body;

        if (!name || !date || !duration || price === undefined || !capacity) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("courses")
            .insert({ name, description, date, duration, price, capacity })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Error creating course:", error);
        return NextResponse.json(
            { error: "Failed to create course" },
            { status: 500 }
        );
    }
}
