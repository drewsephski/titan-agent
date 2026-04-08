import { test, expect } from "@playwright/test";

test.describe("Error Pages", () => {
	test("should display 404 page for non-existent routes", async ({ page }) => {
		await page.goto("/this-page-does-not-exist");
		await expect(page.locator("text=404")).toBeVisible();
		await expect(page.locator("text=Page not found")).toBeVisible();
	});

	test("404 page should have working home link", async ({ page }) => {
		await page.goto("/non-existent-page");

		const homeLink = page.getByRole("link", { name: /home|cd \/home/i });
		await expect(homeLink).toBeVisible();
		await homeLink.click();
		await expect(page).toHaveURL("/");
	});
});
