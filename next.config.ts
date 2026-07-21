import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Redirects and rewrites live here rather than in vercel.json so they are
  // versioned next to the routes they concern, and so `next dev` honours them.
  async redirects() {
    return [
      // The v1 Three.js portfolio is gone; its inbound links are not.
      { source: "/portfolio", destination: "/work", permanent: true },
      { source: "/portfolio/:path*", destination: "/work", permanent: true },
    ];
  },

  async rewrites() {
    return {
      beforeFiles: [],
      // `afterFiles` runs only when nothing on disk matched, so real assets
      // (/rideradar/assets/*.js) are served directly and never rewritten.
      afterFiles: [
        // Directory-index resolution for the preserved RideRadar pages.
        //
        // v1 was a static deploy with `cleanUrls: true` in vercel.json, which
        // resolved /rideradar/privacy to .../privacy/index.html. Next does not
        // do that for files under public/, so without these rules eBay's
        // registered compliance URLs 404 — verified, not theorised.
        { source: "/rideradar", destination: "/rideradar/index.html" },
        { source: "/rideradar/:path*", destination: "/rideradar/:path*/index.html" },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
