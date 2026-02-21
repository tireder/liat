import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/reviews - Get public reviews OR submit review (GET for mobile workaround)
export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        
        // Check if this is a review submission (mobile workaround)
        const token = searchParams.get("token");
        const rating = searchParams.get("rating");
        const comment = searchParams.get("comment");
        
        if (token && rating) {
            // This is a review submission via GET (mobile workaround)
            const ratingNum = parseInt(rating, 10);
            
            if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
                return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
            }
            
            // Find booking by review token (include artist_id)
            const { data: booking, error: bookingError } = await supabase
                .from("bookings")
                .select("id, client_id, artist_id, status")
                .eq("review_token", token)
                .single();
            
            if (bookingError || !booking) {
                return NextResponse.json({ error: "Invalid or expired review link" }, { status: 400 });
            }
            
            // Check if review already exists
            const { data: existingReview } = await supabase
                .from("reviews")
                .select("id")
                .eq("booking_id", booking.id)
                .single();
            
            if (existingReview) {
                return NextResponse.json({ error: "Review already submitted for this booking" }, { status: 400 });
            }
            
            // Create review (include artist_id from booking)
            const { data: review, error: reviewError } = await supabase
                .from("reviews")
                .insert({
                    booking_id: booking.id,
                    client_id: booking.client_id,
                    artist_id: booking.artist_id,
                    rating: ratingNum,
                    comment: comment?.trim() || null,
                    public: true,
                })
                .select()
                .single();
            
            if (reviewError) throw reviewError;
            
            // Clear the review token
            await supabase
                .from("bookings")
                .update({ review_token: null })
                .eq("id", booking.id);
            
            return NextResponse.json({ success: true, review }, { status: 201 });
        }
        
        // Regular GET - return list of reviews
        const { data: reviews, error } = await supabase
            .from("reviews")
            .select(`
                id,
                rating,
                comment,
                created_at,
                client:clients(name)
            `)
            .eq("public", true)
            .eq("approved", true)
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) throw error;

        // Format reviews for public display (hide full names)
        const formatted = reviews?.map(r => {
            const clientData = r.client as unknown as { name: string | null } | null;
            const name = clientData?.name || "לקוח/ה";
            // Show only first name for privacy
            const firstName = name.split(" ")[0];
            return {
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                name: firstName,
                date: r.created_at,
            };
        }) || [];

        // Calculate average rating
        const avgRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        return NextResponse.json({
            reviews: formatted,
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: reviews?.length || 0,
        });
    } catch (error) {
        console.error("Error in reviews API:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}

// POST /api/reviews - Submit a new review (traditional method)
export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { token, rating, comment } = await request.json();

        if (!token || !rating) {
            return NextResponse.json({ error: "Token and rating required" }, { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
        }

        // Find booking by review token (include artist_id)
        const { data: booking, error: bookingError } = await supabase
            .from("bookings")
            .select("id, client_id, artist_id, status")
            .eq("review_token", token)
            .single();

        if (bookingError || !booking) {
            return NextResponse.json({ error: "Invalid or expired review link" }, { status: 400 });
        }

        // Check if review already exists
        const { data: existingReview } = await supabase
            .from("reviews")
            .select("id")
            .eq("booking_id", booking.id)
            .single();

        if (existingReview) {
            return NextResponse.json({ error: "Review already submitted for this booking" }, { status: 400 });
        }

        // Create review (include artist_id from booking)
        const { data: review, error: reviewError } = await supabase
            .from("reviews")
            .insert({
                booking_id: booking.id,
                client_id: booking.client_id,
                artist_id: booking.artist_id,
                rating,
                comment: comment?.trim() || null,
                public: true,
            })
            .select()
            .single();

        if (reviewError) throw reviewError;

        // Clear the review token
        await supabase
            .from("bookings")
            .update({ review_token: null })
            .eq("id", booking.id);

        return NextResponse.json({ success: true, review }, { status: 201 });
    } catch (error) {
        console.error("Error submitting review:", error);
        return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }
}
