import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { purchases, templates } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Fetch the purchase with template data using a join
		const result = await db
			.select({
				purchase: purchases,
				template: templates,
			})
			.from(purchases)
			.innerJoin(templates, eq(purchases.templateId, templates.id))
			.where(
				and(
					eq(purchases.id, id),
					eq(purchases.userId, session.user.id),
					eq(purchases.status, "active")
				)
			)
			.limit(1);

		if (result.length === 0) {
			return NextResponse.json(
				{ error: "Purchase not found or not authorized" },
				{ status: 404 }
			);
		}

		const { purchase, template } = result[0];

		if (!template?.workflowJson) {
			return NextResponse.json(
				{ error: "Template workflow not available" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			workflowJson: template.workflowJson,
			templateTitle: template.title,
			licenseKey: purchase.licenseKey,
		});
	} catch (error) {
		console.error("Error downloading purchase:", error);
		return NextResponse.json(
			{ error: "Failed to download template" },
			{ status: 500 }
		);
	}
}
