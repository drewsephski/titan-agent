import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
	test("should show login button for unauthenticated users", async ({ page }) => {
		await page.goto("/");

		// Check for login or sign in button
		const loginButton = page.getByRole("button", { name: /sign in|login/i });
		await expect(loginButton).toBeVisible();
	});

	test("should redirect to login when accessing protected pages", async ({ page }) => {
		await page.goto("/dashboard");
		// Should redirect to login or show auth required message
		await expect(page).toHaveURL(/login|signin|auth/);
	});
});
