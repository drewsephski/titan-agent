import { test, expect } from "@playwright/test";

test.describe("Template Browse Page", () => {
	test("should display templates list", async ({ page }) => {
		await page.goto("/templates");
		await expect(page.locator("h1")).toContainText(/templates/i);
	});

	test("should have search functionality", async ({ page }) => {
		await page.goto("/templates");

		const searchInput = page.getByPlaceholder(/search/i);
		await expect(searchInput).toBeVisible();
	});

	test("should navigate to template detail page", async ({ page }) => {
		await page.goto("/templates");

		// Wait for templates to load
		await page.waitForLoadState("networkidle");

		// Click first template card if available
		const templateLinks = page.locator('a[href^="/templates/"]').first();
		const count = await templateLinks.count();

		if (count > 0) {
			await templateLinks.click();
			await expect(page).toHaveURL(/\/templates\/.+/);
		}
	});
});
