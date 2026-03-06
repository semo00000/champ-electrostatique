import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // No "standalone" output — Appwrite Sites runs Next.js natively from .next/
  // Acknowledge turbopack for next dev (serwist uses webpack, so build with --webpack)
  turbopack: {},
  // Prevent node-appwrite from being bundled into client code
  serverExternalPackages: ["node-appwrite"],
  // Allow simulation iframes from same origin
  async headers() {
    return [
      {
        source: "/simulations/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
