import { test, expect } from "@playwright/test";
import { copy } from "../lib/copy";

test.describe("Legal pages", () => {
  test("privacy page links back home", async ({ page }) => {
    await page.goto("/privacy");

    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
    await expect(page.getByRole("link", { name: copy.legal.back })).toBeVisible();
  });

  test("terms page links back home", async ({ page }) => {
    await page.goto("/terms");

    await expect(page.getByRole("heading", { name: "Terms of Use" })).toBeVisible();
    await expect(page.getByRole("link", { name: copy.legal.back })).toBeVisible();
  });
});
