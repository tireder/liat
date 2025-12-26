import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/database.types";

// GET /api/bookings/available - Get available time slots for a date
export async function GET(request: NextRequest) {
    try {
        const supabase = await getSupabase();
        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get("date");
        const serviceId = searchParams.get("serviceId");

        if (!dateStr) {
            return NextResponse.json({ error: "Date is required" }, { status: 400 });
        }

        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();

        // Get operating hours
        const { data: hours } = await supabase
            .from("operating_hours")
            .select("*")
            .eq("day_of_week", dayOfWeek)
            .single();

        if (!hours || !hours.active || !hours.open_time || !hours.close_time) {
            return NextResponse.json({ slots: [], closed: true });
        }

        // Get blocked slots
        const { data: blockedSlots } = await supabase
            .from("blocked_slots")
            .select("*")
            .eq("date", dateStr);

        const allDayBlocked = blockedSlots?.some((b) => b.all_day);
        if (allDayBlocked) {
            return NextResponse.json({ slots: [], blocked: true });
        }

        // Get service duration
        let serviceDuration = 60;
        if (serviceId) {
            const { data: service } = await supabase
                .from("services")
                .select("duration")
                .eq("id", serviceId)
                .single();
            if (service) serviceDuration = service.duration;
        }

        // Get existing bookings
        const { data: existingBookings } = await supabase
            .from("bookings")
            .select("start_time, end_time")
            .eq("date", dateStr)
            .in("status", ["confirmed", "pending", "pending_change"]);

        // Generate time slots
        const slots: string[] = [];
        const [openHour, openMin] = hours.open_time.split(":").map(Number);
        const [closeHour, closeMin] = hours.close_time.split(":").map(Number);
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;
        const buffer = 15;

        for (let time = openMinutes; time + serviceDuration <= closeMinutes; time += 30) {
            const slotHour = Math.floor(time / 60);
            const slotMin = time % 60;
            const startTime = `${slotHour.toString().padStart(2, "0")}:${slotMin.toString().padStart(2, "0")}`;

            const endMinutes = time + serviceDuration;
            const endHour = Math.floor(endMinutes / 60);
            const endMin = endMinutes % 60;
            const endTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;

            // Check conflicts
            const hasConflict = existingBookings?.some((booking) => {
                const [bEndH, bEndM] = booking.end_time.split(":").map(Number);
                const bufferedEnd = `${Math.floor((bEndH * 60 + bEndM + buffer) / 60).toString().padStart(2, "0")}:${((bEndH * 60 + bEndM + buffer) % 60).toString().padStart(2, "0")}`;
                return (
                    (startTime >= booking.start_time && startTime < bufferedEnd) ||
                    (endTime > booking.start_time && endTime <= booking.end_time)
                );
            });

            const isBlocked = blockedSlots?.some((b) => {
                if (b.all_day) return true;
                if (!b.start_time || !b.end_time) return false;
                return startTime >= b.start_time && startTime < b.end_time;
            });

            if (!hasConflict && !isBlocked) slots.push(startTime);
        }

        return NextResponse.json({ slots, date: dateStr });
    } catch (error) {
        console.error("Error fetching available slots:", error);
        return NextResponse.json({ error: "Failed to fetch available slots" }, { status: 500 });
    }
}
