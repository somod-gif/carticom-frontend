import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

// Public API origin (browser calls). Empty NEXT_PUBLIC_API_URL means the app
// talks to its own origin and the vercel.json rewrite proxies /api/* instead.
const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
const apiOriginPattern = apiOrigin.length > 0 ? apiOrigin : null;

// Allow the backend origin plus the usual monitoring/analytics endpoints.
// localhost entries are development-only and stripped from production builds.
const isProduction = process.env.NODE_ENV === "production";
const devOrigins = isProduction
  ? []
  : ["http://localhost:8080", "ws://localhost:3000", "http://localhost:3000"];

const connectSrc = [
  "'self'",
  ...(apiOriginPattern ? [apiOriginPattern] : []),
  "https://*.sentry.io",
  "https://*.ingest.sentry.io",
  "https://*.vercel-insights.com",
  "https://vitals.vercel-insights.com",
  ...devOrigins,
];

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.sentry-cdn.com https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src ${connectSrc.join(" ")}`,
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.byteship.dev" },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { disable: true },
  disableLogger: true,
  automaticVercelMonitors: true,
});

