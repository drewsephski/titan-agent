import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { purchases, templates, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/env";
import { sendPurchaseConfirmationEmail } from "@/lib/email-service";
import type Stripe from "stripe";

export async function POST(request: Request) {
	// Check if Stripe is configured
	if (!stripe) {
		return NextResponse.json(
			{ error: "Stripe is not configured" },
			{ status: 500 }
		);
	}

	const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
	if (!webhookSecret) {
		return NextResponse.json(
			{ error: "Stripe webhook secret is not configured" },
			{ status: 500 }
		);
	}

	const payload = await request.text();
	const signature = request.headers.get("stripe-signature");

	if (!signature) {
		return NextResponse.json(
			{ error: "Missing stripe-signature header" },
			{ status: 400 }
		);
	}

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : "Unknown error";
		console.error(`Webhook signature verification failed: ${errorMessage}`);
		return NextResponse.json(
			{ error: `Webhook signature verification failed: ${errorMessage}` },
			{ status: 400 }
		);
	}

	// Handle the event
	try {
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				const purchaseId = session.metadata?.purchaseId;
				const paymentIntentId = session.payment_intent as string;

				if (purchaseId) {
					// Update purchase with payment intent ID and confirm status
					await db
						.update(purchases)
						.set({
							stripePaymentIntentId: paymentIntentId,
							status: "active",
						})
						.where(eq(purchases.id, purchaseId));

					console.log(`Purchase ${purchaseId} completed successfully`);

					// Send purchase confirmation email
					try {
						const purchase = await db.query.purchases.findFirst({
							where: eq(purchases.id, purchaseId),
							with: {
								template: true,
								user: true,
							},
						});

						if (purchase?.user?.email && purchase?.template) {
							const price = new Intl.NumberFormat("en-US", {
								style: "currency",
								currency: "USD",
							}).format(purchase.pricePaid / 100);

							await sendPurchaseConfirmationEmail({
								to: purchase.user.email,
								userName: purchase.user.name,
								userId: purchase.user.id,
								templateTitle: purchase.template.title,
								templateSlug: purchase.template.slug,
								price,
								licenseKey: purchase.licenseKey,
								purchaseDate: new Date().toLocaleDateString("en-US", {
									month: "long",
									day: "numeric",
									year: "numeric",
								}),
								downloadUrl: `${process.env.BETTER_AUTH_URL}/api/purchases/${purchase.id}/download`,
								previewUrl: `${process.env.BETTER_AUTH_URL}/templates/${purchase.template.slug}`,
							});
						}
					} catch (error) {
						console.error("[Stripe Webhook] Failed to send purchase confirmation email:", error);
						// Don't throw - email failure shouldn't break the purchase completion
					}
				}
				break;
			}

			case "checkout.session.expired": {
				const session = event.data.object as Stripe.Checkout.Session;
				const purchaseId = session.metadata?.purchaseId;

				if (purchaseId) {
					// Mark purchase as expired/refunded
					await db
						.update(purchases)
						.set({ status: "refunded" })
						.where(eq(purchases.id, purchaseId));

					console.log(`Purchase ${purchaseId} expired`);
				}
				break;
			}

			case "charge.refunded": {
				const charge = event.data.object as Stripe.Charge;
				const paymentIntentId = charge.payment_intent as string;

				if (paymentIntentId) {
					// Find and update the purchase
					const purchase = await db.query.purchases.findFirst({
						where: eq(purchases.stripePaymentIntentId, paymentIntentId),
					});

					if (purchase) {
						await db
							.update(purchases)
							.set({ status: "refunded" })
							.where(eq(purchases.id, purchase.id));

						console.log(`Purchase ${purchase.id} marked as refunded`);
					}
				}
				break;
			}

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("Error handling webhook event:", error);
		return NextResponse.json(
			{ error: "Error handling webhook event" },
			{ status: 500 }
		);
	}
}
