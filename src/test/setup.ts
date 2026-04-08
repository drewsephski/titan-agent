import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.STRIPE_SECRET_KEY = "sk_test_mock";
process.env.RESEND_API_KEY = "re_mock";

// Mock Next.js headers
vi.mock("next/headers", () => ({
	cookies: () => ({
		get: vi.fn(),
		set: vi.fn(),
	}),
	headers: () => new Headers(),
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		refresh: vi.fn(),
	}),
	redirect: vi.fn(),
	permanentRedirect: vi.fn(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		warning: vi.fn(),
	},
}));
