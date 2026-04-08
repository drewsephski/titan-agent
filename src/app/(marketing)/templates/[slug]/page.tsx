"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { WorkflowPreview } from "@/components/templates/workflow-preview";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
	Star,
	Download,
	Sparkles,
	ArrowLeft,
	Clock,
	CheckCircle,
	Shield,
	Heart,
	Share2,
	MessageSquare,
	Loader2,
} from "lucide-react";
import type { FlowNode, FlowEdge } from "@/types/workflow";

// Types
interface Template {
	id: string;
	slug: string;
	title: string;
	description: string;
	category: "support" | "sales" | "marketing" | "operations" | "development";
	tags: string[];
	price: number;
	pricingModel: "one_time" | "subscription";
	workflowJson: {
		nodes: FlowNode[];
		edges: FlowEdge[];
	};
	documentation: string;
	previewImages: string[];
	integrations: string[];
	complexity: "beginner" | "intermediate" | "advanced";
	certificationStatus: "pending" | "testing" | "certified" | "rejected";
	certificationBadge: "none" | "bronze" | "silver" | "gold";
	certificationNotes?: string;
	rating: number;
	reviewCount: number;
	purchaseCount: number;
	status: "draft" | "published" | "archived";
	createdAt: string;
	updatedAt: string;
	creatorName: string | null;
	creatorImage: string | null;
}

interface Review {
	id: string;
	userId: string;
	templateId: string;
	purchaseId: string;
	rating: number;
	title: string;
	content: string;
	verifiedPurchase: boolean;
	createdAt: string;
	updatedAt: string;
	reviewerName: string | null;
	reviewerImage: string | null;
}

// Helper functions
const complexityColors = {
	beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
	intermediate:
		"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
	advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const certificationColors = {
	none: "",
	bronze: "text-amber-600",
	silver: "text-slate-400",
	gold: "text-yellow-500",
};

const certificationBgColors = {
	none: "",
	bronze: "bg-amber-50 border-amber-200",
	silver: "bg-slate-50 border-slate-200",
	gold: "bg-yellow-50 border-yellow-200",
};

const categoryLabels = {
	support: "Support",
	sales: "Sales",
	marketing: "Marketing",
	operations: "Operations",
	development: "Development",
};

const integrationIcons: Record<string, string> = {
	slack: "Slack",
	openai: "OpenAI",
	notion: "Notion",
	hubspot: "HubSpot",
	twitter: "Twitter",
	linkedin: "LinkedIn",
	github: "GitHub",
	discord: "Discord",
	zapier: "Zapier",
	stripe: "Stripe",
	resend: "Resend",
	uploadthing: "UploadThing",
};

// Components
function StarRating({ rating, maxStars = 5 }: { rating: number; maxStars?: number }) {
	return (
		<div className="flex items-center gap-0.5">
			{Array.from({ length: maxStars }).map((_, i) => (
				<Star
					key={i}
					className={`h-4 w-4 ${
						i < rating
							? "fill-yellow-400 text-yellow-400"
							: "fill-gray-200 text-gray-200"
					}`}
				/>
			))}
		</div>
	);
}

function CertificationBadge({
	badge,
	notes,
}: {
	badge: "none" | "bronze" | "silver" | "gold";
	notes?: string;
}) {
	if (badge === "none") return null;

	const badgeLabels = {
		bronze: "Bronze Certified",
		silver: "Silver Certified",
		gold: "Gold Certified",
	};

	return (
		<div
			className={`flex items-center gap-2 p-3 rounded-lg border ${certificationBgColors[badge]}`}
		>
			<Shield className={`h-5 w-5 ${certificationColors[badge]}`} />
			<div>
				<p className={`font-semibold ${certificationColors[badge]}`}>
					{badgeLabels[badge]}
				</p>
				{notes && (
					<p className="text-xs text-muted-foreground mt-0.5">{notes}</p>
				)}
			</div>
		</div>
	);
}

function ReviewCard({ review }: { review: Review }) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarImage src={review.reviewerImage || undefined} />
							<AvatarFallback>
								{review.reviewerName?.charAt(0) || "U"}
							</AvatarFallback>
						</Avatar>
						<div>
							<p className="font-medium">{review.reviewerName || "Anonymous"}</p>
							<p className="text-sm text-muted-foreground">
								{new Date(review.createdAt).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
							</p>
						</div>
					</div>
					{review.verifiedPurchase && (
						<Badge variant="secondary" className="flex items-center gap-1">
							<CheckCircle className="h-3 w-3" />
							Verified Purchase
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-2 mb-2">
					<StarRating rating={review.rating} />
					<span className="font-semibold">{review.title}</span>
				</div>
				<p className="text-muted-foreground">{review.content}</p>
			</CardContent>
		</Card>
	);
}

export default function TemplateDetailPage() {
	const params = useParams();
	const [template, setTemplate] = useState<Template | null>(null);
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [purchasing, setPurchasing] = useState(false);

	useEffect(() => {
		async function fetchTemplate() {
			try {
				const slug = params?.slug as string;
				if (!slug) return;

				const response = await fetch(`/api/templates/${slug}`);
				if (!response.ok) {
					if (response.status === 404) {
						throw new Error("Template not found");
					}
					throw new Error("Failed to fetch template");
				}

				const data = await response.json();
				setTemplate(data.template);
				setReviews(data.reviews);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setLoading(false);
			}
		}

		fetchTemplate();
	}, [params]);

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-muted rounded w-1/3" />
					<div className="h-96 bg-muted rounded" />
					<div className="h-64 bg-muted rounded" />
				</div>
			</div>
		);
	}

	if (error || !template) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center py-16">
					<h1 className="text-2xl font-bold mb-4">
						{error || "Template not found"}
					</h1>
					<p className="text-muted-foreground mb-6">
						The template you&apos;re looking for doesn&apos;t exist or has been
						removed.
					</p>
					<Button asChild>
						<Link href="/templates">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Browse Templates
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	const handlePurchase = async () => {
		if (!template) return;

		setPurchasing(true);
		try {
			const response = await fetch("/api/checkout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ templateId: template.id }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				if (response.status === 401) {
					// Redirect to login
					window.location.href = `/sign-in?callbackUrl=/templates/${template.slug}`;
					return;
				}
				throw new Error(errorData.error || "Failed to initiate checkout");
			}

			const data = await response.json();
			if (data.url) {
				// Redirect to Stripe Checkout
				window.location.href = data.url;
			} else {
				throw new Error("No checkout URL received");
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to initiate purchase");
		} finally {
			setPurchasing(false);
		}
	};

	const formattedPrice =
		template.price === 0 ? "Free" : `$${(template.price / 100).toFixed(2)}`;
	const formattedRating = (template.rating / 10).toFixed(1);

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Back Link */}
			<Link
				href="/templates"
				className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
			>
				<ArrowLeft className="h-4 w-4 mr-1" />
				Back to Templates
			</Link>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* Header */}
					<div>
						<div className="flex items-start justify-between gap-4 mb-4">
							<div>
								<h1 className="text-3xl font-bold mb-2">{template.title}</h1>
								<p className="text-lg text-muted-foreground">
									{template.description}
								</p>
							</div>
							{template.certificationBadge !== "none" && (
								<Sparkles
									className={`h-6 w-6 ${certificationColors[template.certificationBadge]} flex-shrink-0`}
								/>
							)}
						</div>

						{/* Creator & Stats */}
						<div className="flex flex-wrap items-center gap-4 text-sm">
							<div className="flex items-center gap-2">
								<Avatar className="h-6 w-6">
									<AvatarImage src={template.creatorImage || undefined} />
									<AvatarFallback>
										{template.creatorName?.charAt(0) || "U"}
									</AvatarFallback>
								</Avatar>
								<span className="text-muted-foreground">by</span>
								<span className="font-medium">{template.creatorName}</span>
							</div>

							<Separator orientation="vertical" className="h-4" />

							<div className="flex items-center gap-1">
								<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
								<span className="font-medium">{formattedRating}</span>
								<span className="text-muted-foreground">
									({template.reviewCount} reviews)
								</span>
							</div>

							<Separator orientation="vertical" className="h-4" />

							<div className="flex items-center gap-1 text-muted-foreground">
								<Download className="h-4 w-4" />
								<span>{template.purchaseCount} purchases</span>
							</div>

							<Separator orientation="vertical" className="h-4" />

							<div className="flex items-center gap-1 text-muted-foreground">
								<Clock className="h-4 w-4" />
								<span>
									Updated{" "}
									{new Date(template.updatedAt).toLocaleDateString("en-US", {
										month: "short",
										year: "numeric",
									})}
								</span>
							</div>
						</div>

						{/* Badges */}
						<div className="flex flex-wrap gap-2 mt-4">
							<Badge variant="secondary">
								{categoryLabels[template.category]}
							</Badge>
							<Badge className={complexityColors[template.complexity]}>
								{template.complexity.charAt(0).toUpperCase() +
									template.complexity.slice(1)}
							</Badge>
							{template.tags.map((tag) => (
								<Badge key={tag} variant="outline">
									{tag}
								</Badge>
							))}
						</div>
					</div>

					{/* Workflow Preview */}
					<div className="border rounded-lg overflow-hidden">
						<div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
							<h3 className="font-semibold">Workflow Preview</h3>
							<span className="text-xs text-muted-foreground">
								{template.workflowJson.nodes.length} nodes
							</span>
						</div>
						<WorkflowPreview
							nodes={template.workflowJson.nodes}
							edges={template.workflowJson.edges}
							className="h-[400px] border-0 rounded-none"
						/>
					</div>

					{/* Tabs */}
					<Tabs defaultValue="overview" className="w-full">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="documentation">Documentation</TabsTrigger>
							<TabsTrigger value="reviews">
								Reviews ({template.reviewCount})
							</TabsTrigger>
						</TabsList>

						<TabsContent value="overview" className="mt-6 space-y-6">
							{/* Overview Content */}
							<Card>
								<CardHeader>
									<CardTitle>About this template</CardTitle>
									<CardDescription>
										Full description and details about the workflow
									</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground">
										{template.description}
									</p>
								</CardContent>
							</Card>

							{/* Integrations */}
							{template.integrations.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle>Required Integrations</CardTitle>
										<CardDescription>
											Services and APIs this workflow connects to
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="flex flex-wrap gap-2">
											{template.integrations.map((integration) => (
												<Badge
													key={integration}
													variant="secondary"
													className="text-sm"
												>
													{integrationIcons[integration] ||
														integration.charAt(0).toUpperCase() +
															integration.slice(1)}
												</Badge>
											))}
										</div>
									</CardContent>
								</Card>
							)}

							{/* Workflow Stats */}
							<Card>
								<CardHeader>
									<CardTitle>Workflow Details</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-muted-foreground">
												Total Nodes
											</p>
											<p className="text-2xl font-semibold">
												{template.workflowJson.nodes.length}
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">
												Connections
											</p>
											<p className="text-2xl font-semibold">
												{template.workflowJson.edges.length}
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">
												Complexity
											</p>
											<p className="text-2xl font-semibold capitalize">
												{template.complexity}
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">
												Category
											</p>
											<p className="text-2xl font-semibold">
												{categoryLabels[template.category]}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="documentation" className="mt-6">
							<Card>
								<CardHeader>
									<CardTitle>Documentation</CardTitle>
									<CardDescription>
										Setup instructions and usage guide
									</CardDescription>
								</CardHeader>
								<CardContent>
									{template.documentation ? (
										<MarkdownContent content={template.documentation} />
									) : (
										<p className="text-muted-foreground">
											No documentation available for this template.
										</p>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="reviews" className="mt-6 space-y-4">
							{reviews.length > 0 ? (
								<>
									{/* Rating Summary */}
									<Card>
										<CardContent className="pt-6">
											<div className="flex items-center gap-8">
												<div className="text-center">
													<p className="text-5xl font-bold">
														{formattedRating}
													</p>
													<p className="text-sm text-muted-foreground mt-1">
														out of 5
													</p>
												</div>
												<div className="flex-1">
													<div className="flex items-center gap-2">
														<StarRating
															rating={Math.round(template.rating / 10)}
														/>
														<span className="text-sm text-muted-foreground">
															Based on {template.reviewCount} reviews
														</span>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>

									{/* Review List */}
									{reviews.map((review) => (
										<ReviewCard key={review.id} review={review} />
									))}
								</>
							) : (
								<Card>
									<CardContent className="pt-6 text-center py-12">
										<MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
										<p className="text-muted-foreground">
											No reviews yet. Be the first to review this template!
										</p>
									</CardContent>
								</Card>
							)}
						</TabsContent>
					</Tabs>
				</div>

				{/* Sidebar */}
				<div className="lg:col-span-1">
					<div className="sticky top-8 space-y-4">
						{/* Purchase Card */}
						<Card>
							<CardHeader>
								<CardTitle className="text-3xl">{formattedPrice}</CardTitle>
								{template.pricingModel === "subscription" && (
									<CardDescription>per month</CardDescription>
								)}
							</CardHeader>
							<CardContent className="space-y-4">
								<Button
									className="w-full"
									size="lg"
									onClick={handlePurchase}
									disabled={purchasing}
								>
									{purchasing ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Processing...
										</>
									) : template.price === 0 ? (
										"Get Free Template"
									) : (
										"Buy Now"
									)}
								</Button>

								<div className="flex gap-2">
									<Button variant="outline" className="flex-1" size="sm">
										<Heart className="h-4 w-4 mr-2" />
										Wishlist
									</Button>
									<Button variant="outline" className="flex-1" size="sm">
										<Share2 className="h-4 w-4 mr-2" />
										Share
									</Button>
								</div>

								<Separator />

								{/* Certification Badge */}
								<CertificationBadge
									badge={template.certificationBadge}
									notes={template.certificationNotes}
								/>

								<Separator />

								{/* Quick Info */}
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">License</span>
										<span>One-time purchase</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Updates</span>
										<span>Lifetime</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Support</span>
										<span>Community</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Creator Card */}
						<Card>
							<CardHeader>
								<CardTitle className="text-sm">About the Creator</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-3">
									<Avatar className="h-12 w-12">
										<AvatarImage
											src={template.creatorImage || undefined}
										/>
										<AvatarFallback>
											{template.creatorName?.charAt(0) || "U"}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium">{template.creatorName}</p>
										<p className="text-sm text-muted-foreground">
											Template Creator
										</p>
									</div>
								</div>
								<Button variant="outline" className="w-full mt-4" size="sm">
									View Profile
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
