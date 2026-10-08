import { test, expect, type Page } from "@playwright/test";

/**
 * AuthGate calls the backend refresh endpoint on mount. With no test backend,
 * mock it to 401 so session initialization resolves immediately (logged out).
 */
async function mockAuthGate(page: Page) {
  await page.route("**/api/v1/auth/refresh*", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ success: false, message: "Unauthorized" }),
    })
  );
  await page.route("**/api/v1/auth/me*", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ success: false, message: "Unauthorized" }),
    })
  );
}

test.beforeEach(async ({ page }) => {
  await mockAuthGate(page);
});

test.describe("Waitlist", () => {
  test("joining the waitlist shows the confirmation state", async ({ page }) => {
    let joinCalls = 0;
    await page.route("**/api/v1/waitlist/join*", (route) => {
      joinCalls += 1;
      expect(route.request().method()).toBe("POST");
      const body = route.request().postDataJSON() as { name: string; email: string };
      expect(body.name).toBe("Ada Obi");
      expect(body.email).toBe("ada@business.com");
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { message: "You're on the list! We'll be in touch." },
        }),
      });
    });

    await page.goto("/waitlist");
    await page.locator("#name").fill("Ada Obi");
    await page.locator("#email").fill("ada@business.com");
    await page.getByRole("button", { name: "Join the Waitlist" }).click();

    await expect(page.getByText("You're on the list!")).toBeVisible();
    await expect(page.getByText("ada@business.com").first()).toBeVisible();
    expect(joinCalls).toBe(1);
  });

  test("check my spot shows the waiting position", async ({ page }) => {
    await page.route("**/api/v1/waitlist/check*", (route) => {
      expect(route.request().method()).toBe("GET");
      expect(route.request().url()).toContain("email=ada%40business.com");
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { status: "WAITING", position: 42 },
        }),
      });
    });

    await page.goto("/waitlist");
    await page.getByLabel("Email address to check").fill("ada@business.com");
    await page.getByRole("button", { name: "Check my spot" }).click();

    await expect(page.getByText("#42")).toBeVisible();
    await expect(page.getByText("You're in line!")).toBeVisible();
  });
});
