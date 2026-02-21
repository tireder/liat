import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/sms4free";

// Helper function to format phone
function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("972")) return "0" + cleaned.slice(3);
    if (cleaned.startsWith("0")) return cleaned;
    return "0" + cleaned;
}

// GET /api/cron/return-reminders - Send reminder SMS to clients X days after their last booking
// Call this endpoint from an external cron service (e.g., cron-job.org)
// Recommended schedule: Daily at 10:00 AM
export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient();

        // Verify cron secret for security
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get("secret");
        const isTest = searchParams.get("test") === "true";

        // In production, verify the secret
        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET && !isTest) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get all services with reminder_days configured
        const { data: services } = await supabase
            .from("services")
            .select("id, name, reminder_days")
            .not("reminder_days", "is", null)
            .eq("active", true);

        if (!services || services.length === 0) {
            return NextResponse.json({ message: "No services with reminders configured", sent: 0 });
        }

        // Get business name and SMS sender from settings
        const { data: settings } = await supabase
            .from("settings")
            .select("key, value")
            .in("key", ["business_name", "sms_sender", "phone"]);

        const businessName = settings?.find(s => s.key === "business_name")?.value || "הסלון";
        const smsSender = settings?.find(s => s.key === "sms_sender")?.value || businessName;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.liat-nails.art";

        const sentReminders: { clientPhone: string; serviceName: string }[] = [];
        const errors: string[] = [];

        // For each service, find clients who need reminders
        for (const service of services) {
            if (!service.reminder_days) continue;

            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - service.reminder_days);
            const targetDateStr = targetDate.toISOString().split("T")[0];

            // Find completed bookings from exactly reminder_days ago
            const { data: bookings } = await supabase
                .from("bookings")
                .select(`
                    id,
                    date,
                    client:clients(id, phone, name)
                `)
                .eq("service_id", service.id)
                .eq("date", targetDateStr)
                .eq("status", "completed");

            if (!bookings || bookings.length === 0) continue;

            for (const booking of bookings) {
                // Handle joined client data - Supabase returns object for single join
                const clientData = booking.client as unknown as { id: string; phone: string; name: string | null } | { id: string; phone: string; name: string | null }[] | null;
                const client = Array.isArray(clientData) ? clientData[0] : clientData;
                if (!client) continue;

                // Check if client has opted out of return reminder SMS
                const { data: clientPrefs } = await supabase
                    .from("clients")
                    .select("sms_return_reminders")
                    .eq("id", client.id)
                    .single();

                if (clientPrefs?.sms_return_reminders === false) {
                    continue; // Client opted out
                }

                // Check if reminder was already sent
                const { data: existingLog } = await supabase
                    .from("reminder_logs")
                    .select("id")
                    .eq("client_id", client.id)
                    .eq("service_id", service.id)
                    .eq("booking_id", booking.id)
                    .single();

                if (existingLog) continue; // Already sent

                // Send SMS
                const clientName = client.name || "לקוח/ה יקר/ה";
                const clientPhone = formatPhone(client.phone);
                const message = `שלום ${clientName}! 👋
עבר זמן מאז הביקור האחרון שלך ב${businessName}.
מזמינה אותך לקבוע תור חדש ל${service.name}!

${siteUrl}/book

להסרה מרשימת התפוצה:
${siteUrl}/unsubscribe?phone=${encodeURIComponent(clientPhone)}`;

                try {
                    if (!isTest) {
                        await sendSms({
                            sender: smsSender,
                            recipients: clientPhone,
                            msg: message,
                        });
                    }

                    // Log the sent reminder
                    await supabase.from("reminder_logs").insert({
                        client_id: client.id,
                        service_id: service.id,
                        booking_id: booking.id,
                    });

                    sentReminders.push({
                        clientPhone: client.phone,
                        serviceName: service.name,
                    });
                } catch (smsError) {
                    console.error("Error sending reminder SMS:", smsError);
                    errors.push(`Failed to send to ${client.phone}: ${smsError}`);
                }
            }
        }

        return NextResponse.json({
            success: true,
            sent: sentReminders.length,
            reminders: isTest ? sentReminders : undefined,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error("Error in return-reminders cron:", error);
        return NextResponse.json({ error: "Failed to process reminders" }, { status: 500 });
    }
}
