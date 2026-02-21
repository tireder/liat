import { NextResponse } from "next/server";

const assetLinks = [
    {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
            namespace: "android_app",
            package_name: "art.liatnails.app",
            sha256_cert_fingerprints: [
                "REPLACE_WITH_YOUR_SHA256_FINGERPRINT",
            ],
        },
    },
];

export async function GET() {
    return NextResponse.json(assetLinks, {
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=86400",
        },
    });
}
