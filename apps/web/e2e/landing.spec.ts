import { test, expect } from "@playwright/test";
import { copy } from "../lib/copy";

test.describe("Landing page", () => {
  test("shows hero, CTA, and navigation", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("landing-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: copy.brand.name.toUpperCase() })).toBeVisible();
    await expect(page.getByText(copy.landing.headline)).toBeVisible();
    await expect(page.getByRole("link", { name: copy.landing.cta })).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Site" });
    await expect(nav.getByRole("link", { name: copy.nav.privacy })).toBeVisible();
    await expect(nav.getByRole("link", { name: copy.nav.terms })).toBeVisible();
    await expect(nav.getByRole("link", { name: copy.nav.signIn })).toBeVisible();
  });

  test("sample verdict card renders on desktop", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText(copy.landing.sampleVerdict)).toBeVisible();
    await expect(page.getByText(copy.landing.sampleIdea)).toBeVisible();
    await expect(page.getByText(copy.scorecard.composite)).toBeVisible();
  });
});
