"use server";

import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { requireCreator } from "@/lib/auth-server";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FlowNode, FlowEdge } from "@/types/workflow";

const templateSubmissionSchema = z.object({
	title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
	slug: z.string().min(3, "Slug must be at least 3 characters").max(50, "Slug must be less than 50 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
	description: z.string().min(50, "Description must be at least 50 characters").max(1000, "Description must be less than 1000 characters"),
	category: z.enum(["support", "sales", "marketing", "operations", "development"]),
	tags: z.array(z.string()).max(10, "Maximum 10 tags allowed"),
	price: z.number().min(0).max(100000, "Price must be less than $1000"),
	pricingModel: z.enum(["one_time", "subscription"]),
	complexity: z.enum(["beginner", "intermediate", "advanced"]),
	documentation: z.string().min(100, "Documentation must be at least 100 characters").max(10000, "Documentation must be less than 10000 characters"),
	integrations: z.array(z.string()),
	workflowJson: z.object({
		nodes: z.array(z.any()),
		edges: z.array(z.any()),
	}),
});

export type TemplateSubmissionData = z.infer<typeof templateSubmissionSchema>;

export async function submitTemplate(data: TemplateSubmissionData) {
	const session = await requireCreator();
	
	// Validate the data
	const validated = templateSubmissionSchema.parse(data);
	
	// Check if slug is unique
	const existing = await db.query.templates.findFirst({
		where: (t, { eq }) => eq(t.slug, validated.slug),
	});
	
	if (existing) {
		throw new Error("A template with this slug already exists. Please choose a different slug.");
	}
	
	// Create the template
	const templateId = nanoid();
	
	await db.insert(templates).values({
		id: templateId,
		creatorId: session.user.id,
		title: validated.title,
		slug: validated.slug,
		description: validated.description,
		category: validated.category,
		tags: validated.tags,
		price: validated.price,
		pricingModel: validated.pricingModel,
		complexity: validated.complexity,
		documentation: validated.documentation,
		integrations: validated.integrations,
		workflowJson: validated.workflowJson,
		previewImages: [],
		certificationStatus: "pending",
		certificationBadge: "none",
		rating: 0,
		reviewCount: 0,
		purchaseCount: 0,
		status: "draft",
		createdAt: new Date(),
		updatedAt: new Date(),
	});
	
	revalidatePath("/creator");
	revalidatePath("/templates");
	
	return { success: true, templateId, slug: validated.slug };
}

export async function checkSlugAvailability(slug: string) {
	await requireCreator();
	
	const existing = await db.query.templates.findFirst({
		where: (t, { eq }) => eq(t.slug, slug),
	});
	
	return { available: !existing };
}
