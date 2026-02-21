import { NextResponse } from "next/server";

const association = {
    applinks: {
        apps: [],
        details: [
            {
                appIDs: ["TEAM_ID.art.liat-nails.app"],
                components: [
                    { "/": "/my-bookings*", comment: "My bookings deep link" },
                    { "/": "/review/*", comment: "Review deep link" },
                    { "/": "/book*", comment: "Book appointment deep link" },
                    { "/": "/courses*", comment: "Courses deep link" },
                    { "/": "/gallery*", comment: "Gallery deep link" },
                ],
            },
        ],
    },
};

export async function GET() {
    return NextResponse.json(association, {
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=86400",
        },
    });
}
