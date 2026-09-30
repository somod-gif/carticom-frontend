// ============================================================
// CARTICOM — Public site configuration
// ============================================================
// Single source of truth for the public application URL and the API base URL.
// Both come from NEXT_PUBLIC_* environment variables (inlined at build time).
// The fallbacks are the production values so a build with a missing variable
// still points at production instead of localhost.

/** Canonical public web app URL. No trailing slash. */
export const APP_URL = normalize(process.env.NEXT_PUBLIC_APP_URL, "https://carticom.cv");

/**
 * API base URL used by the browser.
 * Empty string means "same origin" — requests then go to `/api/v1/...` on the
 * app's own domain and are proxied to the backend by the `vercel.json` rewrite.
 */
export const API_URL = trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL ?? "");

/** Builds an absolute app URL from a path (e.g. `/store/amakas-looks`). */
export function appUrl(path = ""): string {
  if (!path) return APP_URL;
  return `${APP_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function normalize(value: string | undefined, fallback: string): string {
  const resolved = (value ?? "").trim();
  return trimTrailingSlash(resolved.length > 0 ? resolved : fallback);
}
