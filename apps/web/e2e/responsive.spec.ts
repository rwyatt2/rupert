import { test, expect } from "@playwright/test";
import { copy } from "../lib/copy";

test.describe("Mobile layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("landing CTA stacks and stays tappable", async ({ page }) => {
    await page.goto("/");

    const cta = page.getByRole("link", { name: copy.landing.cta });
    await expect(cta).toBeVisible();

    const box = await cta.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("sign-in form fits narrow viewport", async ({ page }) => {
    await page.goto("/sign-in");

    const form = page.getByTestId("sign-in-form");
    if (!(await form.isVisible())) {
      test.skip(true, "Clerk not configured in this environment");
    }

    await expect(form).toBeVisible();
    const box = await form.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(390);
  });
});
