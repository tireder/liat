import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getSupabase } from "@/lib/database.types";

// GET /api/bootstrap - Combined endpoint for app initialization
// Returns settings, services, artists, and courses in a single request
// Reduces initial app load from 3-4 API calls to 1
export async function GET() {
    try {
        const supabaseAdmin = createAdminClient();
        const supabase = await getSupabase();

        // Run all queries in parallel for maximum speed
        const [
            { data: settingsRows, error: settingsError },
            { data: operatingHours, error: hoursError },
            { data: services, error: servicesError },
            { data: artists, error: artistsError },
            { data: artistAssignments, error: assignmentsError },
            { data: courses, error: coursesError },
            { data: registrationCounts, error: countsError },
            { data: reviews, error: reviewsError },
        ] = await Promise.all([
            supabaseAdmin.from("settings").select("*"),
            supabaseAdmin.from("operating_hours").select("*").order("day_of_week"),
            supabase.from("services").select("*").eq("active", true).order("sort_order", { ascending: true }),
            supabaseAdmin.from("nail_artists").select("id, name, sort_order").eq("active", true).order("sort_order", { ascending: true }),
            supabaseAdmin.from("artist_services").select("artist_id, service_id"),
            supabase.from("courses").select("*").eq("active", true).order("date", { ascending: true }),
            supabase.from("course_registrations").select("course_id").eq("status", "confirmed"),
            supabase.from("reviews").select("artist_id, rating").eq("approved", true),
        ]);

        // Log errors but don't fail the whole request
        if (settingsError) console.error("Bootstrap: settings error:", settingsError);
        if (hoursError) console.error("Bootstrap: hours error:", hoursError);
        if (servicesError) console.error("Bootstrap: services error:", servicesError);
        if (artistsError) console.error("Bootstrap: artists error:", artistsError);
        if (assignmentsError) console.error("Bootstrap: assignments error:", assignmentsError);
        if (coursesError) console.error("Bootstrap: courses error:", coursesError);
        if (countsError) console.error("Bootstrap: counts error:", countsError);
        if (reviewsError) console.error("Bootstrap: reviews error:", reviewsError);

        // Build settings map
        const settingsMap: Record<string, string> = {};
        settingsRows?.forEach((s: { key: string; value: string }) => {
            settingsMap[s.key] = s.value;
        });

        const settings = {
            phone: settingsMap.phone || "",
            address: settingsMap.address || "",
            whatsapp: settingsMap.whatsapp || settingsMap.phone || "",
            cancelHoursBefore: parseInt(settingsMap.cancel_hours_before || "24"),
            bufferMinutes: parseInt(settingsMap.buffer_minutes || "15"),
            operatingHours: (operatingHours || []).map((h: { day_of_week: number; open_time: string | null; close_time: string | null; active: boolean }) => ({
                dayOfWeek: h.day_of_week,
                openTime: h.open_time,
                closeTime: h.close_time,
                active: h.active,
            })),
        };

        // Build artists with their service IDs and ratings
        const artistsWithServices = (artists || []).map((artist) => {
            const serviceIds = (artistAssignments || [])
                .filter((a) => a.artist_id === artist.id)
                .map((a) => a.service_id);
            
            // Calculate artist rating
            const artistReviews = (reviews || []).filter((r) => r.artist_id === artist.id);
            const totalReviews = artistReviews.length;
            const averageRating = totalReviews > 0
                ? artistReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
                : 0;
            
            return {
                ...artist,
                serviceIds,
                averageRating: Math.round(averageRating * 10) / 10,
                totalReviews,
            };
        });

        // Build courses with enrollment counts
        const enrollmentMap: Record<string, number> = {};
        registrationCounts?.forEach((reg) => {
            enrollmentMap[reg.course_id] = (enrollmentMap[reg.course_id] || 0) + 1;
        });

        const coursesWithEnrollment = (courses || []).map((course) => ({
            ...course,
            enrolled: enrollmentMap[course.id] || 0,
        }));

        return NextResponse.json({
            settings,
            services: services || [],
            artists: artistsWithServices,
            courses: coursesWithEnrollment,
            _ts: Date.now(), // Timestamp for cache freshness checks
        });
    } catch (error) {
        console.error("Bootstrap error:", error);
        return NextResponse.json(
            { error: "Failed to load app data" },
            { status: 500 }
        );
    }
}
