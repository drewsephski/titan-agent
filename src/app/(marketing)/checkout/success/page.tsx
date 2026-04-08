import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { purchases, templates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Download, ArrowRight, Package } from "lucide-react";

async function SuccessContent({
	searchParams,
}: {
	searchParams: { session_id?: string };
}) {
	const sessionId = searchParams.session_id;

	if (!sessionId) {
		redirect("/templates");
	}

	// Verify the checkout session if Stripe is configured
	let purchase = null;
	let template = null;

	if (stripe) {
		try {
			const session = await stripe.checkout.sessions.retrieve(sessionId);
			const purchaseId = session.metadata?.purchaseId;

			if (purchaseId) {
				purchase = await db.query.purchases.findFirst({
					where: eq(purchases.id, purchaseId),
				});

				if (purchase) {
					template = await db.query.templates.findFirst({
						where: eq(templates.id, purchase.templateId),
					});
				}
			}
		} catch {
			// If verification fails, we'll still show the success page
		}
	}

	return (
		<div className="min-h-[80vh] flex items-center justify-center p-4">
			<Card className="max-w-md w-full text-center">
				<CardHeader>
					<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<CheckCircle className="h-8 w-8 text-green-600" />
					</div>
					<CardTitle className="text-2xl">Payment Successful!</CardTitle>
					<CardDescription>
						Thank you for your purchase. Your template is now available in your
						library.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{purchase && template && (
						<div className="bg-muted p-4 rounded-lg text-left">
							<p className="text-sm text-muted-foreground">Template</p>
							<p className="font-semibold">{template.title}</p>
							<p className="text-sm text-muted-foreground mt-2">License Key</p>
							<code className="text-xs bg-background px-2 py-1 rounded">
								{purchase.licenseKey}
							</code>
						</div>
					)}

					<div className="flex flex-col gap-2">
						<Button asChild>
							<Link href="/dashboard">
								<Package className="h-4 w-4 mr-2" />
								View My Templates
							</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/templates">
								Continue Browsing
								<ArrowRight className="h-4 w-4 ml-2" />
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function CheckoutSuccessPage({
	searchParams,
}: {
	searchParams: { session_id?: string };
}) {
	return (
		<Suspense fallback={<SuccessLoading />}>
			<SuccessContent searchParams={searchParams} />
		</Suspense>
	);
}

function SuccessLoading() {
	return (
		<div className="min-h-[80vh] flex items-center justify-center p-4">
			<Card className="max-w-md w-full text-center">
				<CardHeader>
					<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse" />
					<div className="h-8 bg-muted rounded w-2/3 mx-auto mb-2 animate-pulse" />
					<div className="h-4 bg-muted rounded w-1/2 mx-auto animate-pulse" />
				</CardHeader>
			</Card>
		</div>
	);
}
