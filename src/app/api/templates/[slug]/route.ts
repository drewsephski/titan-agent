import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { templates, user, reviews, purchases } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ slug: string }> }
) {
	try {
		const { slug } = await params;

		// Fetch template with creator info
		const templateResult = await db
			.select({
				template: templates,
				creatorName: user.name,
				creatorImage: user.image,
			})
			.from(templates)
			.leftJoin(user, eq(templates.creatorId, user.id))
			.where(eq(templates.slug, slug))
			.limit(1);

		if (templateResult.length === 0) {
			return NextResponse.json(
				{ error: "Template not found" },
				{ status: 404 }
			);
		}

		const { template, creatorName, creatorImage } = templateResult[0];

		// Fetch reviews with reviewer info
		const reviewsData = await db
			.select({
				review: reviews,
				reviewerName: user.name,
				reviewerImage: user.image,
			})
			.from(reviews)
			.leftJoin(user, eq(reviews.userId, user.id))
			.where(eq(reviews.templateId, template.id))
			.orderBy(reviews.createdAt);

		return NextResponse.json({
			template: {
				...template,
				creatorName,
				creatorImage,
			},
			reviews: reviewsData.map((r) => ({
				...r.review,
				reviewerName: r.reviewerName,
				reviewerImage: r.reviewerImage,
			})),
		});
	} catch (error) {
		console.error("Error fetching template:", error);
		return NextResponse.json(
			{ error: "Failed to fetch template" },
			{ status: 500 }
		);
	}
}
