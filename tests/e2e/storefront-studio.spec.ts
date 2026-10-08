import { test, expect, type Page, type Route } from "@playwright/test";

// ── Fixtures ────────────────────────────────────────────────

const STORE = {
  id: "s1",
  name: "Ada Fashion House",
  slug: "ada-fashion",
  description: "Handmade ankara pieces tailored in Lagos.",
  status: "ACTIVE",
  currency: "NGN",
  country: "Nigeria",
  timezone: "Africa/Lagos",
  tenantId: "t1",
  ownerId: "u1",
  logoUrl: "",
  bannerUrl: "",
  template: "fashion-luxury",
  primaryColor: "#2563eb",
  secondaryColor: "#0f172a",
  fontFamily: "Inter, sans-serif",
  businessCategory: "FASHION",
  announcementBar: "",
  sectionConfig: "",
  createdAt: "2026-01-01T00:00:00",
  updatedAt: "2026-01-01T00:00:00",
};

const USER = {
  id: "u1",
  email: "seller@carticom.test",
  fullName: "Ada Seller",
  role: "BUSINESS_OWNER",
  onboardingCompleted: true,
  mustChangePassword: false,
};

const json = (body: unknown, status = 200): { status: number; contentType: string; body: string } => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

/**
 * The studio page sits behind middleware + AuthGate + RoleGuard.
 * 1. session cookie so /dashboard isn't bounced to /login
 * 2. refresh + me so AuthGate resolves as a logged-in business owner
 * 3. catch-all API mock (registered FIRST, so later routes win) so any
 *    incidental dashboard request (notifications, subscriptions…) fails fast
 *    instead of hitting a real backend.
 */
async function openStudio(page: Page) {
  // The first-visit "Quick Tour" modal would cover the editor and block
  // clicks — mark the tour as seen before any script runs.
  await page.addInitScript(() =>
    localStorage.setItem("carticom-dashboard-tour-seen", "true")
  );
  await page.context().addCookies([
    {
      name: "carticom_session",
      value: Buffer.from(
        JSON.stringify({ role: "BUSINESS_OWNER", exp: Date.now() + 3_600_000 })
      ).toString("base64"),
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.route("**/api/v1/**", (route: Route) =>
    route.fulfill(json({ success: false, message: "not mocked" }, 404))
  );

  // Specific routes — registered after the catch-all so they take precedence.
  await page.route("**/api/v1/auth/refresh*", (route) =>
    route.fulfill(json({ success: true, data: { accessToken: "test-access", refreshToken: "test-refresh" } }))
  );
  await page.route("**/api/v1/auth/me*", (route) =>
    route.fulfill(json({ success: true, data: USER }))
  );
  await page.route("**/api/v1/stores", (route) =>
    route.fulfill(json({ success: true, data: [STORE] }))
  );
  // Branding autosaves — succeed by default (later-registered routes win,
  // so tests that need a failure register their own /branding route after).
  await page.route("**/api/v1/stores/s1/branding", (route) =>
    route.fulfill(json({ success: true, data: STORE }))
  );
  // Storefront data for the live-preview iframe.
  await page.route("**/api/v1/storefront/stores/ada-fashion/products*", (route) =>
    route.fulfill(
      json({
        success: true,
        data: [
          {
            id: "p1",
            storeId: STORE.id,
            name: "Ankara Summer Dress",
            price: 25000,
            currency: "NGN",
            quantity: 5,
            active: true,
            imageUrl: "",
          },
        ],
      })
    )
  );
  await page.route("**/api/v1/storefront/stores/ada-fashion*", (route) =>
    route.fulfill(json({ success: true, data: STORE }))
  );

  await page.goto("/dashboard/storefront");
}

// ── Tests ───────────────────────────────────────────────────

test.describe("Storefront Studio", () => {
  test("shows the editor and a live preview side by side", async ({ page }) => {
    await openStudio(page);

    await expect(page.getByRole("heading", { name: "Design your shop" })).toBeVisible();
    await expect(page.getByText("Choose your shop's look")).toBeVisible();
    await expect(page.getByText("What appears on your shop page")).toBeVisible();
    await expect(page.getByText("All changes saved")).toBeVisible();

    // Live preview iframe loads the real storefront route in studio mode.
    const frame = page.frameLocator('iframe[title="Live preview of your shop"]');
    await expect(frame.getByText("Ada Fashion House").first()).toBeVisible({ timeout: 15_000 });
  });

  test("picking a look auto-saves it to the backend", async ({ page }) => {
    await openStudio(page);

    const brandingRequests: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "PUT" && request.url().includes("/branding")) {
        brandingRequests.push(request.postData() ?? "");
      }
    });

    await page.getByRole("button", { name: /NEO Tech/ }).click();

    await expect
      .poll(() => brandingRequests.length, { timeout: 5_000 })
      .toBeGreaterThan(0);
    const payload = JSON.parse(brandingRequests[0]);
    expect(payload.template).toBe("electronics-tech");
    expect(payload.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);

    // The status pill settles back to "saved".
    await expect(page.getByText("All changes saved")).toBeVisible({ timeout: 5_000 });
  });

  test("a rate-limited save shows a friendly wait message and retry", async ({ page }) => {
    await openStudio(page);

    // Override branding PUT AFTER openStudio so this route wins (LIFO matching).
    await page.route("**/api/v1/stores/s1/branding", (route) =>
      route.fulfill(
        json(
          {
            error: "Too many requests",
            message: "Please wait a moment and try again.",
            retryAfterSeconds: 30,
          },
          429
        )
      )
    );

    await page.getByRole("button", { name: /NEO Tech/ }).click();

    await expect(
      page.getByText("You're doing that a little too often. Please wait 30 seconds and try again.")
    ).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Couldn't save", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Retry/ })).toBeVisible();
  });

  test("sections can be switched off and the change is saved", async ({ page }) => {
    await openStudio(page);

    const payloads: Array<Record<string, unknown>> = [];
    page.on("request", (request) => {
      if (request.method() === "PUT" && request.url().includes("/branding")) {
        try {
          payloads.push(JSON.parse(request.postData() ?? "{}"));
        } catch {
          // ignore non-JSON
        }
      }
    });

    const reviewsSwitch = page.getByRole("switch", { name: "Show Customer reviews" });
    await reviewsSwitch.scrollIntoViewIfNeeded();
    await reviewsSwitch.click();

    await expect
      .poll(
        () =>
          payloads.some((payload) => {
            const config = payload.sectionConfig;
            return typeof config === "string" && !config.includes("testimonials");
          }),
        { timeout: 5_000 }
      )
      .toBe(true);
  });
});
