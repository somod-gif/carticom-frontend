const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function isAnalyticsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";
}

export function getGaId(): string | undefined {
  return GA_ID;
}

// ─── Sabilytics ──────────────────────────────────────────────
// Product/web analytics for the public site. The Sabilytics script is fully
// self-instrumenting: it records page views (including client-side navigations
// by patching history.pushState) and Web Vitals on its own, so the app only has
// to load the script once. Site id / domain can be overridden per environment;
// the defaults target the production Carticom site.
const SABILYTICS_SRC = "https://www.sabilytics.com/script.js";
const SABILYTICS_SITE = process.env.NEXT_PUBLIC_SABILYTICS_SITE ?? "4gpo6ob9cmxc";
const SABILYTICS_DOMAIN = process.env.NEXT_PUBLIC_SABILYTICS_DOMAIN ?? "carticom.cv";

export interface SabilyticsConfig {
  src: string;
  site: string;
  domain: string;
}

/** Returns the Sabilytics config, or null when it is disabled/unconfigured. */
export function getSabilyticsConfig(): SabilyticsConfig | null {
  if (!SABILYTICS_SITE) return null;
  return { src: SABILYTICS_SRC, site: SABILYTICS_SITE, domain: SABILYTICS_DOMAIN };
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function push(command: string, ...args: unknown[]): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(command, ...args);
  }
}

export function trackPageView(path: string): void {
  if (!isAnalyticsEnabled() || !GA_ID) return;
  push("event", "page_view", { page_path: path });
}

export function trackEvent(event: string, params?: Record<string, unknown>): void {
  if (!isAnalyticsEnabled() || !GA_ID) return;
  push("event", event, params ?? {});
}
