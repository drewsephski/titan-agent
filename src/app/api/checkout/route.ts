import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { templates, user, purchases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { AuthSession } from "@/lib/auth-utils";

export async function POST(request: Request) {
	try {
		// Check if Stripe is configured
		if (!stripe) {
			return NextResponse.json(
				{ error: "Stripe is not configured" },
				{ status: 500 }
			);
		}

		// Get the current session
		const session = await auth.api.getSession({
			headers: await headers(),
		}) as AuthSession | null;

		if (!session?.user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { templateId } = body;

		if (!templateId) {
			return NextResponse.json(
				{ error: "Template ID is required" },
				{ status: 400 }
			);
		}

		// Fetch the template
		const template = await db.query.templates.findFirst({
			where: eq(templates.id, templateId),
		});

		if (!template) {
			return NextResponse.json(
				{ error: "Template not found" },
				{ status: 404 }
			);
		}

		if (template.status !== "published") {
			return NextResponse.json(
				{ error: "Template is not available for purchase" },
				{ status: 400 }
			);
		}

		// Check if user already purchased this template
		const existingPurchase = await db.query.purchases.findFirst({
			where: (p, { and, eq }) =>
				and(eq(p.userId, session.user.id), eq(p.templateId, templateId)),
		});

		if (existingPurchase && existingPurchase.status === "active") {
			return NextResponse.json(
				{ error: "You have already purchased this template" },
				{ status: 400 }
			);
		}

		// Get or create Stripe customer
		let customerId = session.user.stripeCustomerId;

		if (!customerId) {
			// Create a new Stripe customer
			const customer = await stripe.customers.create({
				email: session.user.email,
				name: session.user.name,
				metadata: {
					userId: session.user.id,
				},
			});
			customerId = customer.id;

			// Update user with Stripe customer ID
			await db
				.update(user)
				.set({ stripeCustomerId: customerId })
				.where(eq(user.id, session.user.id));
		}

		// Create a pending purchase record
		const purchaseId = nanoid();
		await db.insert(purchases).values({
			id: purchaseId,
			userId: session.user.id,
			templateId: templateId,
			pricePaid: template.price,
			licenseKey: nanoid(),
			status: "active", // Will be updated by webhook
			createdAt: new Date(),
		});

		// Create Stripe Checkout Session
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

		const checkoutSession = await stripe.checkout.sessions.create({
			customer: customerId,
			line_items: [
				{
					price_data: {
						currency: "usd",
						product_data: {
							name: template.title,
							description: template.description.slice(0, 255),
							metadata: {
								templateId: template.id,
								slug: template.slug,
							},
						},
						unit_amount: template.price, // Price in cents
					},
					quantity: 1,
				},
			],
			mode: "payment",
			success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${baseUrl}/templates/${template.slug}?canceled=true`,
			metadata: {
				purchaseId,
				templateId: template.id,
				userId: session.user.id,
			},
		});

		return NextResponse.json({
			sessionId: checkoutSession.id,
			url: checkoutSession.url,
		});
	} catch (error) {
		console.error("Checkout error:", error);
		return NextResponse.json(
			{ error: "Failed to create checkout session" },
			{ status: 500 }
		);
	}
}
