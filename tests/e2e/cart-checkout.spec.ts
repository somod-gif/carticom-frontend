import { test, expect, type Page } from "@playwright/test";

const STORE_ID = "11111111-2222-3333-4444-555555555555";
const PRODUCT_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

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

const MOCK_CART = {
  storeId: STORE_ID,
  items: [
    {
      productId: PRODUCT_ID,
      productName: "Adire Ankara Dress",
      productImage: "",
      unitPrice: 25000,
      quantity: 2,
      lineTotal: 50000,
    },
  ],
  currency: "NGN",
  subtotal: 50000,
  shipping: 0,
  discount: 0,
  total: 50000,
};

function mockCartApi(page: Page) {
  return page.route("**/api/v1/cart*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Cart retrieved",
        data: MOCK_CART,
      }),
    })
  );
}

test.describe("Cart to checkout flow", () => {
  test("cart page loads items and checkout button keeps the store id", async ({ page }) => {
    await mockAuthGate(page);
    await mockCartApi(page);
    await page.goto(`/storefront/cart?store=${STORE_ID}`);

    await expect(page.getByRole("heading", { name: "Shopping Cart" })).toBeVisible();
    await expect(page.getByText("Adire Ankara Dress")).toBeVisible();
    await expect(page.getByText("1 item")).toBeVisible();
    await expect(page.getByRole("main").getByText("2", { exact: true })).toBeVisible();

    const summary = page.locator(
      "div.rounded-xl.border.border-gray-200.dark\\:border-gray-800.bg-white.dark\\:bg-gray-900.p-6",
      { hasText: "Proceed to Checkout" }
    );
    await expect(summary).toContainText("Total");
    await expect(summary).toContainText("50,000.00");

    await page.getByRole("button", { name: "Proceed to Checkout" }).click();
    await expect(page).toHaveURL(`/storefront/checkout?store=${STORE_ID}`);
  });

  test("continue shopping returns to the storefront directory", async ({ page }) => {
    await mockAuthGate(page);
    await mockCartApi(page);
    await page.goto(`/storefront/cart?store=${STORE_ID}`);

    await expect(page.getByRole("heading", { name: "Shopping Cart" })).toBeVisible();
    await page.getByRole("link", { name: "Continue Shopping" }).click();
    await expect(page).toHaveURL(/\/storefront$/);
  });

  test("empty cart state is shown when there are no items", async ({ page }) => {
    await mockAuthGate(page);
    await page.route("**/api/v1/cart*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Cart retrieved",
          data: { ...MOCK_CART, items: [], subtotal: 0, total: 0 },
        }),
      })
    );
    await page.goto(`/storefront/cart?store=${STORE_ID}`);

    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
    await page.getByRole("button", { name: "Browse Stores" }).click();
    await expect(page).toHaveURL(/\/storefront$/);
  });
});
