import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/sms4free";

// Helper to format phone
function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("972")) {
        return "0" + cleaned.slice(3);
    }
    if (cleaned.startsWith("0")) {
        return cleaned;
    }
    return "0" + cleaned;
}

// Helper to format date
function formatDateHebrew(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("he-IL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// Send course registration notifications
async function sendCourseNotifications(
    supabase: ReturnType<typeof createAdminClient>,
    course: { title: string; start_date: string; location?: string },
    clientPhone: string,
    clientName: string
) {
    try {
        // Get settings
        const { data: settings } = await supabase
            .from("settings")
            .select("key, value")
            .in("key", ["phone", "business_name", "sms_sender"]);

        const artistPhone = settings?.find(s => s.key === "phone")?.value;
        const businessName = settings?.find(s => s.key === "business_name")?.value || "ליאת";
        const smsSettingValue = settings?.find(s => s.key === "sms_sender")?.value;
        const smsSender = smsSettingValue && smsSettingValue.trim() ? smsSettingValue.trim() : businessName;

        const dateFormatted = formatDateHebrew(course.start_date);
        const formattedClientPhone = formatPhone(clientPhone);

        // Send notification to artist
        if (artistPhone) {
            const artistMsg = `הרשמה לקורס! 📚
${course.title}
${dateFormatted}
${clientName} - ${formattedClientPhone}`;

            await sendSms({
                sender: smsSender,
                recipients: formatPhone(artistPhone),
                msg: artistMsg,
            });
        }

        // Send confirmation to customer
        const customerMsg = `שלום ${clientName}! 💅
נרשמת לקורס: ${course.title}
📅 ${dateFormatted}
${course.location ? `📍 ${course.location}` : ""}

${businessName}`;

        await sendSms({
            sender: smsSender,
            recipients: formattedClientPhone,
            msg: customerMsg,
        });
    } catch (error) {
        console.error("Error sending course notifications:", error);
    }
}

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
        const formattedPhone = formatPhone(phone);
        let { data: client } = await supabase
            .from("clients")
            .select("*")
            .eq("phone", formattedPhone)
            .single();

        if (!client) {
            const { data: newClient, error: clientError } = await supabase
                .from("clients")
                .insert({ phone: formattedPhone, name })
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

                // Send SMS notifications
                sendCourseNotifications(supabase, course, phone, name);

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

        // Send SMS notifications
        sendCourseNotifications(supabase, course, phone, name);

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
