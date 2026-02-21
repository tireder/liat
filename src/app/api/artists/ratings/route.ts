import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/artists/ratings - Get all artists with their average ratings
export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient();

        // Get all active artists with their service assignments
        const { data: artists, error: artistsError } = await supabase
            .from("nail_artists")
            .select("id, name, sort_order")
            .eq("active", true)
            .order("sort_order", { ascending: true });

        if (artistsError) {
            console.error("Error fetching artists:", artistsError);
            throw artistsError;
        }

        // Get artist-service assignments
        const { data: artistServices, error: servicesError } = await supabase
            .from("artist_services")
            .select("artist_id, service_id");

        if (servicesError) {
            console.error("Error fetching artist services:", servicesError);
            throw servicesError;
        }

        // Get all approved reviews with artist_id
        const { data: reviews, error: reviewsError } = await supabase
            .from("reviews")
            .select("artist_id, rating")
            .eq("approved", true);

        if (reviewsError) {
            console.error("Error fetching reviews:", reviewsError);
            throw reviewsError;
        }

        // Calculate ratings per artist
        const artistRatings = (artists || []).map((artist) => {
            // Count services for this artist
            const servicesCount = (artistServices || []).filter(
                (as) => as.artist_id === artist.id
            ).length;

            // Get reviews for this artist
            const artistReviews = (reviews || []).filter(
                (r) => r.artist_id === artist.id
            );

            // Calculate average rating
            const totalReviews = artistReviews.length;
            const averageRating = totalReviews > 0
                ? artistReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
                : 0;

            return {
                id: artist.id,
                name: artist.name,
                averageRating: Math.round(averageRating * 10) / 10,
                totalReviews,
                servicesCount,
            };
        });

        return NextResponse.json({ artists: artistRatings });
    } catch (error) {
        console.error("Error fetching artist ratings:", error);
        return NextResponse.json(
            { error: "Failed to fetch artist ratings" },
            { status: 500 }
        );
    }
}
