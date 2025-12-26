import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/courses/[id]/register - Register for a course
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: courseId } = await params;
        const supabase = createAdminClient();
        const body = await request.json();
        const { name, phone } = body;

        if (!name || !phone) {
            return NextResponse.json(
                { error: "נא למלא שם וטלפון" },
                { status: 400 }
            );
        }

        // Get course details
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("*")
            .eq("id", courseId)
            .single();

        if (courseError || !course) {
            return NextResponse.json(
                { error: "קורס לא נמצא" },
                { status: 404 }
            );
        }

        // Check capacity
        const { count: enrolledCount } = await supabase
            .from("course_registrations")
            .select("*", { count: "exact", head: true })
            .eq("course_id", courseId)
            .eq("status", "confirmed");

        if (enrolledCount !== null && enrolledCount >= course.capacity) {
            return NextResponse.json(
                { error: "הקורס מלא" },
                { status: 400 }
            );
        }

        // Find or create client
        let { data: client } = await supabase
            .from("clients")
            .select("*")
            .eq("phone", phone)
            .single();

        if (!client) {
            const { data: newClient, error: clientError } = await supabase
                .from("clients")
                .insert({ phone, name })
                .select()
                .single();

            if (clientError) {
                console.error("Error creating client:", clientError);
                throw clientError;
            }
            client = newClient;
        } else {
            // Update name if it's different
            if (name && name !== client.name) {
                await supabase
                    .from("clients")
                    .update({ name })
                    .eq("id", client.id);
            }
        }

        // Check if already registered
        const { data: existingReg } = await supabase
            .from("course_registrations")
            .select("*")
            .eq("client_id", client.id)
            .eq("course_id", courseId)
            .single();

        if (existingReg) {
            if (existingReg.status === "cancelled") {
                // Reactivate registration
                const { error: updateError } = await supabase
                    .from("course_registrations")
                    .update({ status: "confirmed", updated_at: new Date().toISOString() })
                    .eq("id", existingReg.id);

                if (updateError) throw updateError;

                return NextResponse.json({
                    success: true,
                    message: "ההרשמה הופעלה מחדש",
                    registration: { ...existingReg, status: "confirmed" },
                });
            }
            return NextResponse.json(
                { error: "כבר נרשמת לקורס זה" },
                { status: 400 }
            );
        }

        // Create registration
        const { data: registration, error: regError } = await supabase
            .from("course_registrations")
            .insert({
                client_id: client.id,
                course_id: courseId,
                status: "confirmed",
            })
            .select()
            .single();

        if (regError) {
            console.error("Error creating registration:", regError);
            throw regError;
        }

        return NextResponse.json({
            success: true,
            registration,
        }, { status: 201 });
    } catch (error) {
        console.error("Error registering for course:", error);
        return NextResponse.json(
            { error: "שגיאה בהרשמה" },
            { status: 500 }
        );
    }
}
