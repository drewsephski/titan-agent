import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { templates, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const allTemplates = await db
			.select({
				id: templates.id,
				slug: templates.slug,
				title: templates.title,
				description: templates.description,
				category: templates.category,
				tags: templates.tags,
				price: templates.price,
				complexity: templates.complexity,
				certificationBadge: templates.certificationBadge,
				rating: templates.rating,
				reviewCount: templates.reviewCount,
				purchaseCount: templates.purchaseCount,
				workflowJson: templates.workflowJson,
				creatorName: user.name,
			})
			.from(templates)
			.leftJoin(user, eq(templates.creatorId, user.id))
			.where(eq(templates.status, "published"));

		return NextResponse.json({ templates: allTemplates });
	} catch (error) {
		console.error("Error fetching templates:", error);
		return NextResponse.json(
			{ error: "Failed to fetch templates" },
			{ status: 500 }
		);
	}
}
