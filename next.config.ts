import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only treat .ts/.tsx files as pages — prevents css-tree's page.js
  // (inside app/node_modules) from being discovered as a Next.js page.
  pageExtensions: ['ts', 'tsx'],
  // Fix: stop Next.js from walking up to C:\Users\Michael and treating it
  // as the workspace root (due to a stray package-lock.json there).
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
  // Exclude the Expo mobile app directory and its node_modules from tracing
  outputFileTracingExcludes: {
    "*": ["./app/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "ypqydvvybvyrlqrwydpc.supabase.co",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Allow CORS for API routes from mobile app
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin, User-Agent" },
        ],
      },
    ];
  },
};

export default nextConfig;
