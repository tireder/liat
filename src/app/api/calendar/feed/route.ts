import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

function formatIcalDate(dateStr: string, timeStr: string): string {
    // Input: dateStr "YYYY-MM-DD", timeStr "HH:MM"
    // Output: "YYYYMMDDTHHMM00"
    const date = dateStr.replace(/-/g, "");
    const time = timeStr.replace(/:/g, "") + "00";
    return `${date}T${time}`;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return new NextResponse("Missing token", { status: 401 });
        }

        const supabase = createAdminClient();

        // Verify token
        const { data: setting } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "calendar_token")
            .single();

        if (!setting || setting.value !== token) {
            return new NextResponse("Invalid token", { status: 403 });
        }

        // Fetch bookings
        const { data: bookings } = await supabase
            .from("bookings")
            .select(`
                *,
                client:clients(name, phone),
                service:services(name, duration)
            `)
            .in("status", ["confirmed", "pending_change", "completed"]);

        if (!bookings) {
            return new NextResponse("No bookings found", { status: 404 });
        }

        // Generate ICS
        const lines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Liat Nails//Booking System//HE",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "X-WR-CALNAME:Liat Nails Bookings",
            "X-WR-TIMEZONE:Asia/Jerusalem",
        ];

        // Current timestamp for DTSTAMP
        const now = new Date();
        const dtStamp = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

        for (const booking of bookings) {
            const start = formatIcalDate(booking.date, booking.start_time);

            // Calculate end time
            const [h, m] = booking.start_time.split(":").map(Number);
            const duration = booking.service?.duration || 60;
            const endDateObj = new Date(new Date(`${booking.date}T${booking.start_time}`).getTime() + duration * 60000);

            // Format end date manually to match formatIcalDate style but from Object
            const endY = endDateObj.getFullYear();
            const endM = String(endDateObj.getMonth() + 1).padStart(2, "0");
            const endD = String(endDateObj.getDate()).padStart(2, "0");
            const endH = String(endDateObj.getHours()).padStart(2, "0");
            const endMin = String(endDateObj.getMinutes()).padStart(2, "0");

            const end = `${endY}${endM}${endD}T${endH}${endMin}00`;

            const summary = `${booking.service?.name} - ${booking.client?.name || booking.client?.phone}`;
            const description = `Phone: ${booking.client?.phone}\nNotes: ${booking.notes || ""}`;

            lines.push("BEGIN:VEVENT");
            lines.push(`UID:${booking.id}@liat-nails.art`);
            lines.push(`DTSTAMP:${dtStamp}`);
            lines.push(`DTSTART;TZID=Asia/Jerusalem:${start}`);
            lines.push(`DTEND;TZID=Asia/Jerusalem:${end}`);
            lines.push(`SUMMARY:${summary}`);
            lines.push(`DESCRIPTION:${description}`);
            lines.push(`STATUS:${booking.status === "confirmed" ? "CONFIRMED" : "TENTATIVE"}`);
            lines.push("END:VEVENT");
        }

        lines.push("END:VCALENDAR");

        const icsContent = lines.join("\r\n");

        return new NextResponse(icsContent, {
            headers: {
                "Content-Type": "text/calendar; charset=utf-8",
                "Content-Disposition": `attachment; filename="liat-bookings.ics"`,
            },
        });

    } catch (error) {
        console.error("Error generating calendar:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
