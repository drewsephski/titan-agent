import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";

export default function CheckoutCancelPage() {
	return (
		<div className="min-h-[80vh] flex items-center justify-center p-4">
			<Card className="max-w-md w-full text-center">
				<CardHeader>
					<div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<XCircle className="h-8 w-8 text-amber-600" />
					</div>
					<CardTitle className="text-2xl">Checkout Cancelled</CardTitle>
					<CardDescription>
						Your payment was cancelled. No charges have been made to your account.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col gap-2">
						<Button variant="outline" asChild>
							<Link href="/templates">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Templates
							</Link>
						</Button>
						<Button asChild>
							<Link href="/templates">
								<ShoppingCart className="h-4 w-4 mr-2" />
								Continue Shopping
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
