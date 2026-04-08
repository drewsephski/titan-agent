import Link from "next/link";
import { requireCreator } from "@/lib/auth-server";
import {
	getCreatorStats,
	getCreatorTemplates,
	getCreatorEarnings,
	getCreatorRecentPurchases,
} from "@/lib/actions/creator";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DollarSign,
	Package,
	Star,
	ShoppingCart,
	TrendingUp,
	Clock,
	ExternalLink,
	Edit,
	Award,
	Shield,
	AlertCircle,
} from "lucide-react";

const badgeColors: Record<string, string> = {
	none: "bg-gray-100 text-gray-800",
	bronze: "bg-amber-100 text-amber-800",
	silver: "bg-slate-100 text-slate-800",
	gold: "bg-yellow-100 text-yellow-800",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	draft: "secondary",
	published: "default",
	archived: "outline",
};

const certStatusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	pending: "secondary",
	testing: "default",
	certified: "default",
	rejected: "destructive",
};

export default async function CreatorDashboardPage() {
	const session = await requireCreator();

	const [stats, templates, earnings, recentPurchases] = await Promise.all([
		getCreatorStats(),
		getCreatorTemplates(),
		getCreatorEarnings(),
		getCreatorRecentPurchases(5),
	]);

	const formatPrice = (cents: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(cents / 100);
	};

	return (
		<div className="container mx-auto p-6 max-w-7xl">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-bold">Creator Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome back, {session.user.name}. Manage your templates and track
						your success.
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" asChild>
						<Link href="/creator/build">Build Workflow</Link>
					</Button>
					<Button asChild>
						<Link href="/creator/submit">Submit New Template</Link>
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Earnings
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatPrice(stats.totalEarnings)}
						</div>
						<p className="text-xs text-muted-foreground">
							From {stats.totalPurchases} purchases
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Published Templates
						</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.publishedTemplates}
						</div>
						<p className="text-xs text-muted-foreground">
							of {stats.totalTemplates} total
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Average Rating
						</CardTitle>
						<Star className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.averageRating.toFixed(1)}
						</div>
						<p className="text-xs text-muted-foreground">
							Across all templates
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Pending Review
						</CardTitle>
						<Shield className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.pendingCertifications}
						</div>
						<p className="text-xs text-muted-foreground">
							Templates in queue
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Your Templates</CardTitle>
									<CardDescription>
										Manage and track your submitted templates
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{templates.length === 0 ? (
								<div className="text-center py-8">
									<Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">
										No templates yet. Submit your first workflow!
									</p>
									<Button asChild className="mt-4">
										<Link href="/creator/submit">Submit Template</Link>
									</Button>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Template</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Certification</TableHead>
											<TableHead>Performance</TableHead>
											<TableHead className="text-right">
												Actions
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{templates.map((template) => (
											<TableRow key={template.id}>
												<TableCell>
													<div className="font-medium">
														{template.title}
													</div>
													<div className="text-sm text-muted-foreground">
														{formatPrice(template.price)} •{" "}
														{template.category}
													</div>
												</TableCell>
												<TableCell>
													<Badge
														variant={statusVariants[template.status]}
													>
														{template.status}
													</Badge>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Badge
															variant={
																certStatusVariants[
																	template.certificationStatus
																]
															}
														>
															{template.certificationStatus}
														</Badge>
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
												</TableCell>
												<TableCell>
													<div className="text-sm">
														<div className="flex items-center gap-1">
															<ShoppingCart className="h-3 w-3" />
															{template.purchaseCount} sales
														</div>
														<div className="flex items-center gap-1 text-muted-foreground">
															<Star className="h-3 w-3" />
															{template.rating.toFixed(1)} (
															{template.reviewCount} reviews)
														</div>
													</div>
												</TableCell>
												<TableCell className="text-right">
													<div className="flex items-center justify-end gap-2">
														<Button
															variant="ghost"
															size="sm"
															asChild
														>
															<Link
																href={`/templates/${template.slug}`}
																target="_blank"
															>
																<ExternalLink className="h-4 w-4" />
															</Link>
														</Button>
														<Button
															variant="ghost"
															size="sm"
															disabled={template.status === "published"}
														>
															<Edit className="h-4 w-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Earnings Overview</CardTitle>
							<CardDescription>
								Your earnings over the last 6 months
							</CardDescription>
						</CardHeader>
						<CardContent>
							{earnings.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<TrendingUp className="h-12 w-12 mx-auto mb-4" />
									<p>No earnings data yet</p>
									<p className="text-sm">
										Sales will appear here once customers purchase your
										templates
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{earnings.map((month) => (
										<div key={month.month} className="flex items-center gap-4">
											<div className="w-20 text-sm text-muted-foreground">
												{new Date(month.month + "-01").toLocaleDateString(
													"en-US",
													{ month: "short", year: "numeric" }
												)}
											</div>
											<div className="flex-1">
												<Progress
													value={
														(stats.totalEarnings > 0
															? (month.earnings / stats.totalEarnings) *
															  100
															: 0) * 3
													}
													className="h-2"
												/>
											</div>
											<div className="w-24 text-right">
												<div className="font-medium">
													{formatPrice(month.earnings)}
												</div>
												<div className="text-xs text-muted-foreground">
													{month.purchases} sales
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<Button asChild className="w-full justify-start">
								<Link href="/creator/submit">
									<Package className="h-4 w-4 mr-2" />
									Submit New Template
								</Link>
							</Button>
							<Button
								variant="outline"
								asChild
								className="w-full justify-start"
							>
								<Link href="/creator/build">
									<Edit className="h-4 w-4 mr-2" />
									Build Workflow
								</Link>
							</Button>
							<Button
								variant="outline"
								asChild
								className="w-full justify-start"
							>
								<Link href="/templates">
									<ExternalLink className="h-4 w-4 mr-2" />
									Browse Marketplace
								</Link>
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Recent Sales</CardTitle>
							<CardDescription>
								Latest purchases of your templates
							</CardDescription>
						</CardHeader>
						<CardContent>
							{recentPurchases.length === 0 ? (
								<p className="text-sm text-muted-foreground text-center py-4">
									No sales yet. Keep promoting your templates!
								</p>
							) : (
								<div className="space-y-4">
									{recentPurchases.map((purchase) => (
										<div
											key={purchase.id}
											className="flex items-center justify-between"
										>
											<div>
												<p className="font-medium text-sm">
													{purchase.templateTitle}
												</p>
												<p className="text-xs text-muted-foreground">
													<Clock className="h-3 w-3 inline mr-1" />
													{new Date(
														purchase.createdAt
													).toLocaleDateString()}
												</p>
											</div>
											<div className="font-medium text-sm">
												{formatPrice(purchase.pricePaid)}
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<AlertCircle className="h-5 w-5" />
								Creator Tips
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="text-sm space-y-2 text-muted-foreground">
								<li>• Write clear documentation for better reviews</li>
								<li>• Price competitively based on complexity</li>
								<li>• Respond to customer questions promptly</li>
								<li>• Keep workflows updated and maintained</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
