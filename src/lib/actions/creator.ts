"use server";

import { db } from "@/lib/db";
import { templates, purchases, reviews } from "@/lib/db/schema";
import { eq, and, count, sql, desc, avg } from "drizzle-orm";
import { requireCreator } from "@/lib/auth-server";

export interface CreatorTemplate {
	id: string;
	title: string;
	slug: string;
	status: "draft" | "published" | "archived";
	certificationStatus: "pending" | "testing" | "certified" | "rejected";
	certificationBadge: "none" | "bronze" | "silver" | "gold";
	price: number;
	category: string;
	rating: number;
	reviewCount: number;
	purchaseCount: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreatorStats {
	totalEarnings: number;
	totalTemplates: number;
	publishedTemplates: number;
	totalPurchases: number;
	averageRating: number;
	pendingCertifications: number;
}

export interface MonthlyEarnings {
	month: string;
	earnings: number;
	purchases: number;
}

/**
 * Get creator dashboard stats
 */
export async function getCreatorStats(): Promise<CreatorStats> {
	const session = await requireCreator();
	const creatorId = session.user.id;

	// Get total earnings from active purchases
	const earningsResult = await db
		.select({
			total: sql<number>`sum(${purchases.pricePaid})`,
			count: count(),
		})
		.from(purchases)
		.innerJoin(templates, eq(purchases.templateId, templates.id))
		.where(
			and(
				eq(templates.creatorId, creatorId),
				eq(purchases.status, "active")
			)
		);

	// Get template counts
	const templateCounts = await db
		.select({
			total: count(),
			published: sql<number>`count(case when ${templates.status} = 'published' then 1 end)`,
			pending: sql<number>`count(case when ${templates.certificationStatus} = 'pending' then 1 end)`,
		})
		.from(templates)
		.where(eq(templates.creatorId, creatorId));

	// Get average rating
	const ratingResult = await db
		.select({
			avgRating: sql<number>`coalesce(avg(${templates.rating}), 0)`,
		})
		.from(templates)
		.where(eq(templates.creatorId, creatorId));

	return {
		totalEarnings: earningsResult[0]?.total || 0,
		totalTemplates: templateCounts[0]?.total || 0,
		publishedTemplates: templateCounts[0]?.published || 0,
		totalPurchases: earningsResult[0]?.count || 0,
		averageRating: Math.round((ratingResult[0]?.avgRating || 0) * 10) / 10,
		pendingCertifications: templateCounts[0]?.pending || 0,
	};
}

/**
 * Get all templates for the creator
 */
export async function getCreatorTemplates(): Promise<CreatorTemplate[]> {
	const session = await requireCreator();
	const creatorId = session.user.id;

	const templatesList = await db
		.select({
			id: templates.id,
			title: templates.title,
			slug: templates.slug,
			status: templates.status,
			certificationStatus: templates.certificationStatus,
			certificationBadge: templates.certificationBadge,
			price: templates.price,
			category: templates.category,
			rating: templates.rating,
			reviewCount: templates.reviewCount,
			purchaseCount: templates.purchaseCount,
			createdAt: templates.createdAt,
			updatedAt: templates.updatedAt,
		})
		.from(templates)
		.where(eq(templates.creatorId, creatorId))
		.orderBy(desc(templates.updatedAt));

	return templatesList;
}

/**
 * Get monthly earnings data for charts
 */
export async function getCreatorEarnings(): Promise<MonthlyEarnings[]> {
	const session = await requireCreator();
	const creatorId = session.user.id;

	// Get last 6 months of earnings
	const sixMonthsAgo = new Date();
	sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

	const earnings = await db
		.select({
			month: sql<string>`to_char(${purchases.createdAt}, 'YYYY-MM')`,
			earnings: sql<number>`sum(${purchases.pricePaid})`,
			purchases: count(),
		})
		.from(purchases)
		.innerJoin(templates, eq(purchases.templateId, templates.id))
		.where(
			and(
				eq(templates.creatorId, creatorId),
				eq(purchases.status, "active"),
				sql`${purchases.createdAt} >= ${sixMonthsAgo}`
			)
		)
		.groupBy(sql`to_char(${purchases.createdAt}, 'YYYY-MM')`)
		.orderBy(sql`to_char(${purchases.createdAt}, 'YYYY-MM')`);

	return earnings;
}

/**
 * Get recent purchases for the creator's templates
 */
export async function getCreatorRecentPurchases(limit = 10) {
	const session = await requireCreator();
	const creatorId = session.user.id;

	const recentPurchases = await db
		.select({
			id: purchases.id,
			pricePaid: purchases.pricePaid,
			createdAt: purchases.createdAt,
			templateTitle: templates.title,
			templateSlug: templates.slug,
		})
		.from(purchases)
		.innerJoin(templates, eq(purchases.templateId, templates.id))
		.where(
			and(
				eq(templates.creatorId, creatorId),
				eq(purchases.status, "active")
			)
		)
		.orderBy(desc(purchases.createdAt))
		.limit(limit);

	return recentPurchases;
}
