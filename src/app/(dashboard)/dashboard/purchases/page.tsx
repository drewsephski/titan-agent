"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Package,
	Download,
	Key,
	ExternalLink,
	ArrowLeft,
	Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Purchase {
	id: string;
	templateId: string;
	templateTitle: string;
	templateSlug: string;
	pricePaid: number;
	licenseKey: string;
	status: "active" | "refunded" | "disputed";
	createdAt: string;
	creatorName: string;
}

export default function PurchasesPage() {
	const [purchases, setPurchases] = useState<Purchase[]>([]);
	const [loading, setLoading] = useState(true);
	const [downloading, setDownloading] = useState<string | null>(null);

	useEffect(() => {
		async function fetchPurchases() {
			try {
				const response = await fetch("/api/purchases");
				if (!response.ok) {
					throw new Error("Failed to fetch purchases");
				}
				const data = await response.json();
				setPurchases(data.purchases);
			} catch {
				toast.error("Failed to load your purchases");
			} finally {
				setLoading(false);
			}
		}

		fetchPurchases();
	}, []);

	const handleDownload = async (purchaseId: string, templateTitle: string) => {
		setDownloading(purchaseId);
		try {
			const response = await fetch(`/api/purchases/${purchaseId}/download`);
			if (!response.ok) {
				throw new Error("Failed to download template");
			}

			const data = await response.json();
			if (data.workflowJson) {
				// Create a downloadable JSON file
				const blob = new Blob([JSON.stringify(data.workflowJson, null, 2)], {
					type: "application/json",
				});
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `${templateTitle.toLowerCase().replace(/\s+/g, "-")}-workflow.json`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);

				toast.success("Template downloaded successfully!");
			}
		} catch {
			toast.error("Failed to download template");
		} finally {
			setDownloading(null);
		}
	};

	const copyLicenseKey = (key: string) => {
		navigator.clipboard.writeText(key);
		toast.success("License key copied to clipboard");
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6 max-w-5xl">
				<div className="flex items-center gap-4 mb-8">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/dashboard">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Link>
					</Button>
				</div>
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			</div>
		);
	}

	if (purchases.length === 0) {
		return (
			<div className="container mx-auto p-6 max-w-5xl">
				<div className="flex items-center gap-4 mb-8">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/dashboard">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Link>
					</Button>
				</div>

				<Card className="text-center py-16">
					<CardHeader>
						<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
							<Package className="h-8 w-8 text-muted-foreground" />
						</div>
						<CardTitle>No Purchases Yet</CardTitle>
						<CardDescription>
							You haven&apos;t purchased any templates yet. Browse our marketplace to
							find AI workflows that can help you.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild>
							<Link href="/templates">Browse Templates</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-5xl">
			<div className="flex items-center gap-4 mb-8">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/dashboard">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Dashboard
					</Link>
				</Button>
			</div>

			<h1 className="text-3xl font-bold mb-2">My Purchases</h1>
			<p className="text-muted-foreground mb-8">
				Manage your purchased templates and license keys
			</p>

			<div className="space-y-4">
				{purchases.map((purchase) => (
					<Card key={purchase.id}>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div>
									<CardTitle className="text-xl">
										<Link
											href={`/templates/${purchase.templateSlug}`}
											className="hover:underline"
										>
											{purchase.templateTitle}
										</Link>
									</CardTitle>
									<CardDescription>
										by {purchase.creatorName} • Purchased{" "}
										{new Date(purchase.createdAt).toLocaleDateString("en-US", {
											month: "long",
											day: "numeric",
											year: "numeric",
										})}
									</CardDescription>
								</div>
								<Badge
									variant={
										purchase.status === "active"
											? "default"
											: purchase.status === "refunded"
												? "secondary"
												: "destructive"
									}
								>
									{purchase.status.charAt(0).toUpperCase() +
										purchase.status.slice(1)}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-wrap gap-4">
								<div className="flex items-center gap-2 text-sm">
									<Key className="h-4 w-4 text-muted-foreground" />
									<code className="bg-muted px-2 py-1 rounded text-xs">
										{purchase.licenseKey}
									</code>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => copyLicenseKey(purchase.licenseKey)}
									>
										Copy
									</Button>
								</div>
							</div>

							<Separator />

							<div className="flex flex-wrap gap-2">
								{purchase.status === "active" && (
									<Button
										onClick={() =>
											handleDownload(
												purchase.id,
												purchase.templateTitle
											)
										}
										disabled={downloading === purchase.id}
									>
										{downloading === purchase.id ? (
											<>
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
												Downloading...
											</>
										) : (
											<>
												<Download className="h-4 w-4 mr-2" />
												Download Workflow
											</>
										)}
									</Button>
								)}
								<Button variant="outline" asChild>
									<Link href={`/templates/${purchase.templateSlug}`}>
										<ExternalLink className="h-4 w-4 mr-2" />
										View Template
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
