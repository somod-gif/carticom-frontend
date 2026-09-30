import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = APP_URL;
  const now = new Date();

  const staticRoutes = [
    "",
    "/features",
    "/pricing",
    "/about",
    "/contact",
    "/demo",
    "/blog",
    "/docs",
    "/help",
    "/tutorials",
    "/community",
    "/careers",
    "/press",
    "/partners",
    "/solutions/ecommerce",
    "/solutions/restaurants",
    "/solutions/retail",
    "/solutions/services",
    "/solutions/payments",
    "/solutions/global",
    "/legal/privacy",
    "/legal/terms",
    "/legal/cookies",
    "/legal/gdpr",
  ];

  return staticRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));
}
