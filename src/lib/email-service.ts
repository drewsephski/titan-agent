import { resend } from "./email";
import { render } from "@react-email/render";
import PurchaseConfirmationEmail from "@/emails/purchase-confirmation";
import CertificationUpdateEmail from "@/emails/certification-update";
import ReviewNotificationEmail from "@/emails/review-notification";
import WelcomeEmail from "@/emails/welcome";
import PasswordResetEmail from "@/emails/password-reset";
import { db } from "./db";
import { user } from "./db/schema";
import { eq } from "drizzle-orm";

const FROM_EMAIL = "Titan AI <noreply@titan.ai>";

interface UserNotificationPreferences {
	emailNotifications: boolean;
	notifyPurchases: boolean;
	notifyCertification: boolean;
	notifyReviews: boolean;
	notifyMarketing: boolean;
}

async function getUserNotificationPreferences(
	userId: string,
): Promise<UserNotificationPreferences | null> {
	try {
		const result = await db.query.user.findFirst({
			where: eq(user.id, userId),
			columns: {
				emailNotifications: true,
				notifyPurchases: true,
				notifyCertification: true,
				notifyReviews: true,
				notifyMarketing: true,
			},
		});

		if (!result) return null;

		return {
			emailNotifications: result.emailNotifications ?? true,
			notifyPurchases: result.notifyPurchases ?? true,
			notifyCertification: result.notifyCertification ?? true,
			notifyReviews: result.notifyReviews ?? true,
			notifyMarketing: result.notifyMarketing ?? false,
		};
	} catch {
		// Default to allowing emails if we can't check preferences
		return {
			emailNotifications: true,
			notifyPurchases: true,
			notifyCertification: true,
			notifyReviews: true,
			notifyMarketing: false,
		};
	}
}

async function shouldSendEmail(
	userId: string,
	notificationType: keyof Omit<
		UserNotificationPreferences,
		"emailNotifications"
	>,
): Promise<boolean> {
	// If Resend is not configured, don't send
	if (!resend) {
		console.log("[Email] Resend not configured, skipping email");
		return false;
	}

	const prefs = await getUserNotificationPreferences(userId);
	if (!prefs) return false;

	// Check master email notification toggle
	if (!prefs.emailNotifications) {
		console.log(`[Email] User ${userId} has email notifications disabled`);
		return false;
	}

	// Check specific notification type
	if (!prefs[notificationType]) {
		console.log(`[Email] User ${userId} has ${notificationType} disabled`);
		return false;
	}

	return true;
}

interface PurchaseConfirmationData {
	to: string;
	userName: string;
	userId: string;
	templateTitle: string;
	templateSlug: string;
	price: string;
	licenseKey: string;
	purchaseDate: string;
	downloadUrl: string;
	previewUrl: string;
}

export async function sendPurchaseConfirmationEmail(
	data: PurchaseConfirmationData,
): Promise<{ success: boolean; error?: string }> {
	try {
		const shouldSend = await shouldSendEmail(data.userId, "notifyPurchases");
		if (!shouldSend) {
			return { success: true };
		}

		const html = await render(
			PurchaseConfirmationEmail({
				userName: data.userName,
				templateTitle: data.templateTitle,
				templateSlug: data.templateSlug,
				price: data.price,
				licenseKey: data.licenseKey,
				purchaseDate: data.purchaseDate,
				downloadUrl: data.downloadUrl,
				previewUrl: data.previewUrl,
			}),
		);

		const result = await resend!.emails.send({
			from: FROM_EMAIL,
			to: data.to,
			subject: `Thank you for purchasing ${data.templateTitle}!`,
			html,
		});

		console.log("[Email] Purchase confirmation sent:", result.data?.id);
		return { success: true };
	} catch (error) {
		console.error("[Email] Failed to send purchase confirmation:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

interface CertificationUpdateData {
	to: string;
	userName: string;
	userId: string;
	templateTitle: string;
	templateSlug: string;
	status: "approved" | "rejected" | "in_review";
	badge?: "bronze" | "silver" | "gold" | null;
	reviewNotes?: string | null;
	previewUrl: string;
	adminUrl?: string;
}

export async function sendCertificationUpdateEmail(
	data: CertificationUpdateData,
): Promise<{ success: boolean; error?: string }> {
	try {
		const shouldSend = await shouldSendEmail(data.userId, "notifyCertification");
		if (!shouldSend) {
			return { success: true };
		}

		const subjectMap = {
			approved: `🎉 ${data.templateTitle} has been certified!`,
			rejected: `Template Review Update: ${data.templateTitle}`,
			in_review: `Template Review Started: ${data.templateTitle}`,
		};

		const html = await render(
			CertificationUpdateEmail({
				userName: data.userName,
				templateTitle: data.templateTitle,
				templateSlug: data.templateSlug,
				status: data.status,
				badge: data.badge,
				reviewNotes: data.reviewNotes,
				previewUrl: data.previewUrl,
				adminUrl: data.adminUrl,
			}),
		);

		const result = await resend!.emails.send({
			from: FROM_EMAIL,
			to: data.to,
			subject: subjectMap[data.status],
			html,
		});

		console.log("[Email] Certification update sent:", result.data?.id);
		return { success: true };
	} catch (error) {
		console.error("[Email] Failed to send certification update:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

interface ReviewNotificationData {
	to: string;
	userName: string;
	userId: string;
	templateTitle: string;
	templateSlug: string;
	reviewerName: string;
	rating: number;
	reviewTitle: string;
	reviewContent: string;
	templateUrl: string;
}

export async function sendReviewNotificationEmail(
	data: ReviewNotificationData,
): Promise<{ success: boolean; error?: string }> {
	try {
		const shouldSend = await shouldSendEmail(data.userId, "notifyReviews");
		if (!shouldSend) {
			return { success: true };
		}

		const html = await render(
			ReviewNotificationEmail({
				userName: data.userName,
				templateTitle: data.templateTitle,
				templateSlug: data.templateSlug,
				reviewerName: data.reviewerName,
				rating: data.rating,
				reviewTitle: data.reviewTitle,
				reviewContent: data.reviewContent,
				templateUrl: data.templateUrl,
			}),
		);

		const result = await resend!.emails.send({
			from: FROM_EMAIL,
			to: data.to,
			subject: `New review for ${data.templateTitle}`,
			html,
		});

		console.log("[Email] Review notification sent:", result.data?.id);
		return { success: true };
	} catch (error) {
		console.error("[Email] Failed to send review notification:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

interface WelcomeEmailData {
	to: string;
	userName: string;
	onboardingUrl: string;
	templatesUrl: string;
}

export async function sendWelcomeEmail(
	data: WelcomeEmailData,
): Promise<{ success: boolean; error?: string }> {
	try {
		// Welcome emails bypass notification preferences (essential email)
		if (!resend) {
			console.log("[Email] Resend not configured, skipping welcome email");
			return { success: true };
		}

		const html = await render(
			WelcomeEmail({
				userName: data.userName,
				onboardingUrl: data.onboardingUrl,
				templatesUrl: data.templatesUrl,
			}),
		);

		const result = await resend.emails.send({
			from: FROM_EMAIL,
			to: data.to,
			subject: "Welcome to Titan AI!",
			html,
		});

		console.log("[Email] Welcome email sent:", result.data?.id);
		return { success: true };
	} catch (error) {
		console.error("[Email] Failed to send welcome email:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

interface PasswordResetData {
	to: string;
	userName: string;
	resetUrl: string;
	expiresIn: string;
}

export async function sendPasswordResetEmail(
	data: PasswordResetData,
): Promise<{ success: boolean; error?: string }> {
	try {
		// Password reset emails bypass notification preferences (essential email)
		if (!resend) {
			console.log("[Email] Resend not configured, skipping password reset email");
			return { success: true };
		}

		const html = await render(
			PasswordResetEmail({
				userName: data.userName,
				resetUrl: data.resetUrl,
				expiresIn: data.expiresIn,
			}),
		);

		const result = await resend.emails.send({
			from: FROM_EMAIL,
			to: data.to,
			subject: "Reset your Titan AI password",
			html,
		});

		console.log("[Email] Password reset email sent:", result.data?.id);
		return { success: true };
	} catch (error) {
		console.error("[Email] Failed to send password reset email:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
