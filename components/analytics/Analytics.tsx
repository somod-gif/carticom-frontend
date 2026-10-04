"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  getGaId,
  getSabilyticsConfig,
  isAnalyticsEnabled,
  trackPageView,
} from "@/lib/analytics";

export function Analytics() {
  const pathname = usePathname();
  const gaId = isAnalyticsEnabled() ? getGaId() : undefined;
  const sabilytics = getSabilyticsConfig();

  useEffect(() => {
    if (pathname) trackPageView(pathname);
  }, [pathname]);

  return (
    <>
      {sabilytics && (
        <Script
          async
          src={sabilytics.src}
          data-site={sabilytics.site}
          data-domain={sabilytics.domain}
          strategy="afterInteractive"
        />
      )}

      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { send_page_view: false });
            `}
          </Script>
        </>
      )}
    </>
  );
}
