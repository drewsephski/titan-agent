"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkflowPreview } from "./workflow-preview";
import { Star, Download, Sparkles } from "lucide-react";
import Link from "next/link";
import type { FlowNode, FlowEdge } from "@/types/workflow";

type Complexity = "beginner" | "intermediate" | "advanced";
type CertificationBadge = "none" | "bronze" | "silver" | "gold";
type TemplateCategory =
	| "support"
	| "sales"
	| "marketing"
	| "operations"
	| "development";

interface TemplateCardProps {
	id: string;
	slug: string;
	title: string;
	description: string;
	category: TemplateCategory;
	tags: string[];
	price: number;
	complexity: Complexity;
	certificationBadge: CertificationBadge;
	rating: number;
	reviewCount: number;
	purchaseCount: number;
	workflowJson: {
		nodes: FlowNode[];
		edges: FlowEdge[];
	};
}

const complexityColors: Record<Complexity, string> = {
	beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
	intermediate:
		"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
	advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const certificationColors: Record<CertificationBadge, string> = {
	none: "",
	bronze: "text-amber-600",
	silver: "text-slate-400",
	gold: "text-yellow-500",
};

const categoryLabels: Record<TemplateCategory, string> = {
	support: "Support",
	sales: "Sales",
	marketing: "Marketing",
	operations: "Operations",
	development: "Development",
};

export function TemplateCard({
	slug,
	title,
	description,
	category,
	tags,
	price,
	complexity,
	certificationBadge,
	rating,
	reviewCount,
	purchaseCount,
	workflowJson,
}: TemplateCardProps) {
	const formattedPrice = price === 0 ? "Free" : `$${(price / 100).toFixed(2)}`;
	const formattedRating = (rating / 10).toFixed(1);

	return (
		<Card className="flex flex-col overflow-hidden group hover:shadow-lg transition-shadow">
			<CardHeader className="p-0">
				<WorkflowPreview
					nodes={workflowJson.nodes}
					edges={workflowJson.edges}
					className="h-[200px] border-0 rounded-none"
				/>
			</CardHeader>
			<CardContent className="flex-1 p-4 space-y-3">
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-lg leading-tight truncate">
							{title}
						</h3>
					</div>
					{certificationBadge !== "none" && (
						<Sparkles
							className={`h-4 w-4 ${certificationColors[certificationBadge]}`}
						/>
					)}
				</div>

				<p className="text-sm text-muted-foreground line-clamp-2">
					{description}
				</p>

				<div className="flex flex-wrap gap-2">
					<Badge variant="secondary" className="text-xs">
						{categoryLabels[category]}
					</Badge>
					<Badge className={`text-xs ${complexityColors[complexity]}`}>
						{complexity.charAt(0).toUpperCase() + complexity.slice(1)}
					</Badge>
					{tags.slice(0, 2).map((tag) => (
						<Badge key={tag} variant="outline" className="text-xs">
							{tag}
						</Badge>
					))}
					{tags.length > 2 && (
						<Badge variant="outline" className="text-xs">
							+{tags.length - 2}
						</Badge>
					)}
				</div>

				<div className="flex items-center gap-4 text-sm text-muted-foreground">
					<div className="flex items-center gap-1">
						<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
						<span className="font-medium">{formattedRating}</span>
						<span>({reviewCount})</span>
					</div>
					<div className="flex items-center gap-1">
						<Download className="h-4 w-4" />
						<span>{purchaseCount}</span>
					</div>
				</div>
			</CardContent>
			<CardFooter className="p-4 pt-0 flex items-center justify-between">
				<div className="font-bold text-lg">
					{formattedPrice}
				</div>
				<Button asChild>
					<Link href={`/templates/${slug}`}>View Details</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
