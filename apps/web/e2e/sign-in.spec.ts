import { test, expect } from "@playwright/test";
import { copy } from "../lib/copy";

test.describe("Sign-in page", () => {
  test("loads sign-in shell and primary actions", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(page.getByTestId("sign-in-page")).toBeVisible();

    const form = page.getByTestId("sign-in-form");
    const notConfigured = page.getByText(copy.auth.notConfiguredTitle);

    if (await form.isVisible()) {
      await expect(page.getByRole("heading", { name: copy.auth.title })).toBeVisible();
      await expect(page.getByRole("button", { name: copy.auth.google })).toBeVisible();
      await expect(page.getByRole("button", { name: copy.auth.github })).toBeVisible();
      await expect(page.getByRole("button", { name: copy.auth.sendCode })).toBeVisible();
      await expect(page.getByPlaceholder(copy.auth.emailPlaceholder)).toBeVisible();
    } else {
      await expect(notConfigured).toBeVisible();
      await expect(page.getByText(copy.auth.notConfiguredBody)).toBeVisible();
    }
  });
});
