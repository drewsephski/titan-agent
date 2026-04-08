import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { purchases, templates, user } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userPurchases = await db
			.select({
				id: purchases.id,
				templateId: purchases.templateId,
				templateTitle: templates.title,
				templateSlug: templates.slug,
				pricePaid: purchases.pricePaid,
				licenseKey: purchases.licenseKey,
				status: purchases.status,
				createdAt: purchases.createdAt,
				creatorName: user.name,
			})
			.from(purchases)
			.innerJoin(templates, eq(purchases.templateId, templates.id))
			.innerJoin(user, eq(templates.creatorId, user.id))
			.where(
				and(
					eq(purchases.userId, session.user.id),
					eq(purchases.status, "active")
				)
			)
			.orderBy(purchases.createdAt);

		return NextResponse.json({ purchases: userPurchases });
	} catch (error) {
		console.error("Error fetching purchases:", error);
		return NextResponse.json(
			{ error: "Failed to fetch purchases" },
			{ status: 500 }
		);
	}
}
