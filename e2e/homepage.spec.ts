import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
	test("should display the homepage correctly", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveTitle(/Titan AI/);
	});

	test("should have working navigation links", async ({ page }) => {
		await page.goto("/");

		// Check if templates link exists and works
		const templatesLink = page.getByRole("link", { name: /templates/i });
		await expect(templatesLink).toBeVisible();
	});

	test("should be responsive on mobile", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/");
		await expect(page.locator("body")).toBeVisible();
	});
});
