
import Link from "next/link";
import { requireAuth } from "@/lib/auth-server";
import {
	getBuyerStats,
	getPurchasedTemplates,
	getReviewableTemplates,
	getRecommendedTemplates,
	submitReview,
} from "@/lib/actions/buyer";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewDialog } from "@/components/dashboard/review-dialog";
import {
	Package,
	Star,
	DollarSign,
	Download,
	ExternalLink,
	ShoppingBag,
	MessageSquare,
	Sparkles,
	Award,
	Search,
} from "lucide-react";
// Certification badge colors
const badgeColors: Record<string, string> = {
	none: "bg-gray-100 text-gray-800",
	bronze: "bg-amber-100 text-amber-800",
	silver: "bg-slate-100 text-slate-800",
	gold: "bg-yellow-100 text-yellow-800",
};

export default async function BuyerDashboardPage() {
	const session = await requireAuth();

	// Fetch all buyer data
	const [stats, purchasedTemplates, reviewableTemplates, recommendations] =
		await Promise.all([
			getBuyerStats(),
			getPurchasedTemplates(),
			getReviewableTemplates(),
			getRecommendedTemplates(),
		]);

	const formatPrice = (cents: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(cents / 100);
	};

	return (
		<div className="container mx-auto p-6 max-w-7xl">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-bold">My Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome back, {session.user.name}. Manage your purchased templates
						and discover new workflows.
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" asChild>
						<Link href="/templates">
							<Search className="h-4 w-4 mr-2" />
							Browse Templates
						</Link>
					</Button>
					<Button asChild>
						<Link href="/dashboard/purchases">
							<Package className="h-4 w-4 mr-2" />
							My Library
						</Link>
					</Button>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Purchased Templates
						</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalPurchases}</div>
						<p className="text-xs text-muted-foreground">
							In your library
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Spent
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatPrice(stats.totalSpent)}
						</div>
						<p className="text-xs text-muted-foreground">
							On {stats.totalPurchases} templates
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Templates Reviewed
						</CardTitle>
						<MessageSquare className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.templatesWithReviews}
						</div>
						<p className="text-xs text-muted-foreground">
							{stats.totalReviews} total reviews
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Ready to Review
						</CardTitle>
						<Star className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{reviewableTemplates.length}
						</div>
						<p className="text-xs text-muted-foreground">
							Templates awaiting review
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Left Column - Recent Purchases & Reviews */}
				<div className="lg:col-span-2 space-y-6">
					{/* Recent Purchases */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Recent Purchases</CardTitle>
									<CardDescription>
										Your latest template acquisitions
									</CardDescription>
								</div>
								<Button variant="outline" size="sm" asChild>
									<Link href="/dashboard/purchases">
										View All
									</Link>
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{purchasedTemplates.length === 0 ? (
								<div className="text-center py-8">
									<ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">
										No purchases yet. Start exploring templates!
									</p>
									<Button asChild className="mt-4">
										<Link href="/templates">Browse Templates</Link>
									</Button>
								</div>
							) : (
								<div className="space-y-4">
									{purchasedTemplates.slice(0, 5).map((template) => (
										<div
											key={template.purchaseId}
											className="flex items-center justify-between p-4 border rounded-lg"
										>
											<div className="flex items-center gap-4">
												<div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
													<Package className="h-6 w-6 text-muted-foreground" />
												</div>
												<div>
													<div className="font-medium">
														{template.title}
													</div>
													<div className="text-sm text-muted-foreground flex items-center gap-2">
														<span>by {template.creatorName}</span>
														<span>•</span>
														<span>{template.category}</span>
														{template.certificationBadge !== "none" && (
																<Badge
																	className={
																		badgeColors[template.certificationBadge]
																	}
																>
																	< Award className="h-3 w-3 mr-1" />
																	{template.certificationBadge}
																</Badge>
														)}
													</div>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Button variant="ghost" size="sm" asChild>
													<Link
														href={`/templates/${template.slug}`}
														target="_blank"
													>
														<ExternalLink className="h-4 w-4" />
													</Link>
												</Button>
												<Button variant="ghost" size="sm" asChild>
													<Link
														href={`/api/purchases/${template.id}/download`}
														download
													>
														<Download className="h-4 w-4" />
													</Link>
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Write a Review Section */}
					{reviewableTemplates.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<MessageSquare className="h-5 w-5" />
									Write a Review
								</CardTitle>
								<CardDescription>
									Share your experience with purchased templates
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{reviewableTemplates.map((template) => (
										<div
											key={template.purchaseId}
											className="p-4 border rounded-lg flex items-center justify-between"
										>
											<div className="flex items-center gap-4">
												<div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
													<Package className="h-6 w-6 text-muted-foreground" />
												</div>
												<div>
													<div className="font-medium">
														{template.title}
													</div>
													<div className="text-sm text-muted-foreground">
														by {template.creatorName} •{" "}
														{new Date(
															template.purchasedAt
														).toLocaleDateString()}
													</div>
												</div>
											</div>
											<ReviewDialog
												template={template}
												onSubmit={submitReview}
											/>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Right Column - Recommendations & Quick Links */}
				<div className="space-y-6">
					{/* Quick Actions */}
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<Button asChild className="w-full justify-start">
								<Link href="/dashboard/purchases">
									<Package className="h-4 w-4 mr-2" />
									My Library ({stats.totalPurchases})
								</Link>
							</Button>
							<Button
								variant="outline"
								asChild
								className="w-full justify-start"
							>
								<Link href="/templates">
									<Search className="h-4 w-4 mr-2" />
									Find Templates
								</Link>
							</Button>
						</CardContent>
					</Card>

					{/* Recommendations */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Sparkles className="h-5 w-5" />
								Recommended for You
							</CardTitle>
							<CardDescription>
								Based on your purchase history
							</CardDescription>
						</CardHeader>
						<CardContent>
							{recommendations.length === 0 ? (
								<p className="text-sm text-muted-foreground text-center py-4">
									No recommendations yet. Purchase more templates to
									get personalized suggestions!
								</p>
							) : (
								<div className="space-y-4">
									{recommendations.map((template) => (
										<Link
											key={template.id}
											href={`/templates/${template.slug}`}
											className="block p-4 border rounded-lg hover:border-primary transition-colors"
										>
											<div className="flex items-start gap-3">
												<div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
													<Package className="h-5 w-5 text-muted-foreground" />
												</div>
												<div className="flex-1 min-w-0">
													<div className="font-medium text-sm truncate">
														{template.title}
													</div>
													<div className="text-xs text-muted-foreground">
														by {template.creatorName}
													</div>
													<div className="flex items-center gap-2 mt-1">
														<span className="text-xs">
															{formatPrice(template.price)}
														</span>
														{template.certificationBadge !== "none" && (
															<Badge
																className={
																	badgeColors[
																		template.certificationBadge
																	]
																}
															>
																< Award className="h-3 w-3 mr-1" />
																{template.certificationBadge}
															</Badge>
														)}
													</div>
												</div>
											</div>
										</Link>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Help Card */}
					<Card>
						<CardHeader>
							<CardTitle>Need Help?</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="text-sm space-y-2 text-muted-foreground">
								<li>
									• Download templates from your{" "}
									<Link
										href="/dashboard/purchases"
										className="text-primary hover:underline"
									>
										library
									</Link>
								</li>
								<li>
									• Each purchase includes a unique license key
								</li>
								<li>• Leave reviews to help other buyers decide</li>
								<li>
									• Contact creators for template support
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}