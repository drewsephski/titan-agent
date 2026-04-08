"use server";

import { db } from "@/lib/db";
import { templates, purchases, reviews, user } from "@/lib/db/schema";
import { eq, and, desc, sql, ne, inArray, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-server";
import { sendReviewNotificationEmail } from "@/lib/email-service";

export interface PurchasedTemplate {
	id: string;
	purchaseId: string;
	templateId: string;
	title: string;
	slug: string;
	description: string;
	category: string;
	pricePaid: number;
	licenseKey: string;
	status: "active" | "refunded" | "disputed";
	creatorName: string;
	creatorId: string;
	purchasedAt: Date;
	certificationBadge: "none" | "bronze" | "silver" | "gold";
	hasReviewed: boolean;
}

export interface BuyerStats {
	totalPurchases: number;
	totalSpent: number;
	templatesWithReviews: number;
	totalReviews: number;
}

export interface WishlistItem {
	id: string;
	templateId: string;
	title: string;
	slug: string;
	price: number;
	category: string;
	rating: number;
	reviewCount: number;
	certificationBadge: string;
	creatorName: string;
	addedAt: Date;
}

export interface ReviewableTemplate {
	id: string;
	purchaseId: string;
	templateId: string;
	title: string;
	slug: string;
	category: string;
	creatorName: string;
	purchasedAt: Date;
	certificationBadge: string;
	previewImages: string[];
}

/**
 * Get buyer dashboard stats
 */
export async function getBuyerStats(): Promise<BuyerStats> {
	const session = await requireAuth();
	const userId = session.user.id;

	// Get purchase stats
	const purchaseStats = await db
		.select({
			count: count(),
			totalSpent: sql<number>`sum(${purchases.pricePaid})`,
		})
		.from(purchases)
		.where(
			and(
				eq(purchases.userId, userId),
				eq(purchases.status, "active")
			)
		);

	// Get review count
	const reviewStats = await db
		.select({
			count: count(),
		})
		.from(reviews)
		.where(eq(reviews.userId, userId));

	// Get templates with reviews (distinct count)
	const templatesWithReviews = await db
		.selectDistinct({
			templateId: reviews.templateId,
		})
		.from(reviews)
		.where(eq(reviews.userId, userId));

	return {
		totalPurchases: purchaseStats[0]?.count || 0,
		totalSpent: purchaseStats[0]?.totalSpent || 0,
		templatesWithReviews: templatesWithReviews.length,
		totalReviews: reviewStats[0]?.count || 0,
	};
}

/**
 * Get all purchased templates for the user
 */
export async function getPurchasedTemplates(): Promise<PurchasedTemplate[]> {
	const session = await requireAuth();
	const userId = session.user.id;

	const purchasedTemplates = await db
		.select({
			id: purchases.id,
			purchaseId: purchases.id,
			templateId: templates.id,
			title: templates.title,
			slug: templates.slug,
			description: templates.description,
			category: templates.category,
			pricePaid: purchases.pricePaid,
			licenseKey: purchases.licenseKey,
			status: purchases.status,
			creatorName: user.name,
			creatorId: templates.creatorId,
			purchasedAt: purchases.createdAt,
			certificationBadge: templates.certificationBadge,
		})
		.from(purchases)
		.innerJoin(templates, eq(purchases.templateId, templates.id))
		.innerJoin(user, eq(templates.creatorId, user.id))
		.where(eq(purchases.userId, userId))
		.orderBy(desc(purchases.createdAt));

	// Check which templates have been reviewed
	const templateIds = purchasedTemplates.map((p) => p.templateId);
	
	let reviewedTemplates: string[] = [];
	if (templateIds.length > 0) {
		const reviewsData = await db
			.selectDistinct({
				templateId: reviews.templateId,
			})
			.from(reviews)
			.where(
				and(
					eq(reviews.userId, userId),
					inArray(reviews.templateId, templateIds)
				)
			);
		reviewedTemplates = reviewsData.map((r) => r.templateId);
	}

	return purchasedTemplates.map((template) => ({
		...template,
		hasReviewed: reviewedTemplates.includes(template.templateId),
	}));
}

/**
 * Get templates that can be reviewed (purchased but not yet reviewed)
 */
export async function getReviewableTemplates(): Promise<ReviewableTemplate[]> {
	const session = await requireAuth();
	const userId = session.user.id;

	const purchasedTemplates = await db
		.select({
			id: purchases.id,
			purchaseId: purchases.id,
			templateId: templates.id,
			title: templates.title,
			slug: templates.slug,
			category: templates.category,
			creatorName: user.name,
			purchasedAt: purchases.createdAt,
			certificationBadge: templates.certificationBadge,
			previewImages: templates.previewImages,
		})
		.from(purchases)
		.innerJoin(templates, eq(purchases.templateId, templates.id))
		.innerJoin(user, eq(templates.creatorId, user.id))
		.where(
			and(
				eq(purchases.userId, userId),
				eq(purchases.status, "active")
			)
		)
		.orderBy(desc(purchases.createdAt));

	// Filter out already reviewed templates
	const templateIds = purchasedTemplates.map((p) => p.templateId);
	
	let reviewedTemplates: string[] = [];
	if (templateIds.length > 0) {
		const reviewsData = await db
			.selectDistinct({
				templateId: reviews.templateId,
			})
			.from(reviews)
			.where(
				and(
					eq(reviews.userId, userId),
					inArray(reviews.templateId, templateIds)
				)
			);
		reviewedTemplates = reviewsData.map((r) => r.templateId);
	}

	return purchasedTemplates
		.filter((t) => !reviewedTemplates.includes(t.templateId))
		.slice(0, 3); // Limit to 3 recent unreviewed templates
}

/**
 * Submit a review for a purchased template
 */
export async function submitReview(
	purchaseId: string,
	templateId: string,
	rating: number,
	title: string,
	content: string
): Promise<{ success: boolean; error?: string }> {
	const session = await requireAuth();
	const userId = session.user.id;

	// Verify the purchase exists and belongs to the user
	const purchase = await db
		.select()
		.from(purchases)
		.where(
			and(
				eq(purchases.id, purchaseId),
				eq(purchases.userId, userId),
				eq(purchases.templateId, templateId),
				eq(purchases.status, "active")
			)
		)
		.limit(1);

	if (purchase.length === 0) {
		return { success: false, error: "Purchase not found or not eligible for review" };
	}

	// Check if already reviewed
	const existingReview = await db
		.select()
		.from(reviews)
		.where(
			and(
				eq(reviews.userId, userId),
				eq(reviews.templateId, templateId),
				eq(reviews.purchaseId, purchaseId)
			)
		)
		.limit(1);

	if (existingReview.length > 0) {
		return { success: false, error: "You have already reviewed this template" };
	}

	// Validate rating
	if (rating < 1 || rating > 5) {
		return { success: false, error: "Rating must be between 1 and 5" };
	}

	if (!title.trim() || !content.trim()) {
		return { success: false, error: "Title and content are required" };
	}

	// Insert the review
	await db.insert(reviews).values({
		id: crypto.randomUUID(),
		userId,
		templateId,
		purchaseId,
		rating,
		title: title.trim(),
		content: content.trim(),
		verifiedPurchase: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	// Update template rating (this would ideally be done via a trigger or background job)
	const allReviews = await db
		.select({ rating: reviews.rating })
		.from(reviews)
		.where(eq(reviews.templateId, templateId));

	const avgRating = Math.round(
		allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
	);

	await db
		.update(templates)
		.set({
			rating: avgRating,
			reviewCount: allReviews.length,
			updatedAt: new Date(),
		})
		.where(eq(templates.id, templateId));

	// Send notification email to template creator
	try {
		const template = await db.query.templates.findFirst({
			where: eq(templates.id, templateId),
		});

		if (template) {
			const creator = await db.query.user.findFirst({
				where: eq(user.id, template.creatorId),
			});

			const reviewer = await db.query.user.findFirst({
				where: eq(user.id, userId),
			});

			if (creator?.email && reviewer) {
				await sendReviewNotificationEmail({
					to: creator.email,
					userName: creator.name,
					userId: creator.id,
					templateTitle: template.title,
					templateSlug: template.slug,
					reviewerName: reviewer.name,
					rating,
					reviewTitle: title.trim(),
					reviewContent: content.trim(),
					templateUrl: `${process.env.BETTER_AUTH_URL}/templates/${template.slug}`,
				});
			}
		}
	} catch (error) {
		console.error("[Review] Failed to send notification email:", error);
		// Don't throw - email failure shouldn't break review submission
	}

	return { success: true };
}

/**
 * Get recommended templates based on purchase history
 */
export async function getRecommendedTemplates() {
	const session = await requireAuth();
	const userId = session.user.id;

	// Get user's purchased categories
	const purchasedCategories = await db
		.selectDistinct({
			category: templates.category,
		})
		.from(purchases)
		.innerJoin(templates, eq(purchases.templateId, templates.id))
		.where(
			and(
				eq(purchases.userId, userId),
				eq(purchases.status, "active")
			)
		);

	const categories = purchasedCategories.map((c) => c.category);

	if (categories.length === 0) {
		// If no purchases, return popular templates
		const popularTemplates = await db
			.select({
				id: templates.id,
				title: templates.title,
				slug: templates.slug,
				description: templates.description,
				price: templates.price,
				category: templates.category,
				rating: templates.rating,
				reviewCount: templates.reviewCount,
				purchaseCount: templates.purchaseCount,
				certificationBadge: templates.certificationBadge,
				previewImages: templates.previewImages,
				creatorName: user.name,
			})
			.from(templates)
			.innerJoin(user, eq(templates.creatorId, user.id))
			.where(
				and(
					eq(templates.status, "published"),
					ne(templates.certificationStatus, "rejected")
				)
			)
			.orderBy(desc(templates.purchaseCount))
			.limit(4);

		return popularTemplates;
	}

	// Get purchased template IDs to exclude
	const purchasedTemplateIds = await db
		.select({ templateId: purchases.templateId })
		.from(purchases)
		.where(
			and(
				eq(purchases.userId, userId),
				eq(purchases.status, "active")
			)
		);

	const excludeIds = purchasedTemplateIds.map((p) => p.templateId);

	// Get recommendations from same categories
	const recommendations = await db
		.select({
			id: templates.id,
			title: templates.title,
			slug: templates.slug,
			description: templates.description,
			price: templates.price,
			category: templates.category,
			rating: templates.rating,
			reviewCount: templates.reviewCount,
			purchaseCount: templates.purchaseCount,
			certificationBadge: templates.certificationBadge,
			previewImages: templates.previewImages,
			creatorName: user.name,
		})
		.from(templates)
		.innerJoin(user, eq(templates.creatorId, user.id))
		.where(
			and(
				eq(templates.status, "published"),
				ne(templates.certificationStatus, "rejected"),
				inArray(templates.category, categories),
				excludeIds.length > 0 ? sql`${templates.id} not in (${excludeIds.join(",")})` : undefined
			)
		)
		.orderBy(desc(templates.rating))
		.limit(4);

	return recommendations;
}
