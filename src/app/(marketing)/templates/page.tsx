"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { TemplateCard } from "@/components/templates/template-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, SlidersHorizontal, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";
import type { FlowNode, FlowEdge } from "@/types/workflow";

interface Template {
	id: string;
	slug: string;
	title: string;
	description: string;
	category: "support" | "sales" | "marketing" | "operations" | "development";
	tags: string[];
	price: number;
	complexity: "beginner" | "intermediate" | "advanced";
	certificationBadge: "none" | "bronze" | "silver" | "gold";
	rating: number;
	reviewCount: number;
	purchaseCount: number;
	workflowJson: {
		nodes: FlowNode[];
		edges: FlowEdge[];
	};
}

interface TemplatesResponse {
	templates: Template[];
}

const categories = [
	{ value: "all", label: "All Categories" },
	{ value: "support", label: "Support" },
	{ value: "sales", label: "Sales" },
	{ value: "marketing", label: "Marketing" },
	{ value: "operations", label: "Operations" },
	{ value: "development", label: "Development" },
];

const priceRanges = [
	{ value: "all", label: "All Prices" },
	{ value: "free", label: "Free" },
	{ value: "paid", label: "Paid" },
	{ value: "under25", label: "Under $25" },
	{ value: "25to50", label: "$25 - $50" },
	{ value: "over50", label: "Over $50" },
];

const complexityLevels = [
	{ value: "all", label: "All Levels" },
	{ value: "beginner", label: "Beginner" },
	{ value: "intermediate", label: "Intermediate" },
	{ value: "advanced", label: "Advanced" },
];

const sortOptions = [
	{ value: "popular", label: "Most Popular" },
	{ value: "newest", label: "Newest" },
	{ value: "rating", label: "Highest Rated" },
	{ value: "price-low", label: "Price: Low to High" },
	{ value: "price-high", label: "Price: High to Low" },
];

async function fetchTemplates(): Promise<TemplatesResponse> {
	const response = await fetch("/api/templates");
	if (!response.ok) {
		throw new Error("Failed to fetch templates");
	}
	return response.json();
}

export default function TemplatesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [priceFilter, setPriceFilter] = useState("all");
	const [complexityFilter, setComplexityFilter] = useState("all");
	const [sortBy, setSortBy] = useState("popular");
	const [showFilters, setShowFilters] = useState(false);

	const debouncedSearch = useDebounce(searchQuery, 300);

	const { data, isLoading, error } = useQuery({
		queryKey: ["templates"],
		queryFn: fetchTemplates,
	});

	let filteredTemplates: Template[] = [];
	if (data?.templates) {
		filteredTemplates = [...data.templates];

		// Search filter
		if (debouncedSearch) {
			const query = debouncedSearch.toLowerCase();
			filteredTemplates = filteredTemplates.filter(
				(template) =>
					template.title.toLowerCase().includes(query) ||
					template.description.toLowerCase().includes(query) ||
					template.tags.some((tag) => tag.toLowerCase().includes(query))
			);
		}

		// Category filter
		if (categoryFilter !== "all") {
			filteredTemplates = filteredTemplates.filter(
				(template) => template.category === categoryFilter
			);
		}

		// Price filter
		if (priceFilter !== "all") {
			filteredTemplates = filteredTemplates.filter((template) => {
				switch (priceFilter) {
					case "free":
						return template.price === 0;
					case "paid":
						return template.price > 0;
					case "under25":
						return template.price > 0 && template.price < 2500;
					case "25to50":
						return template.price >= 2500 && template.price <= 5000;
					case "over50":
						return template.price > 5000;
					default:
						return true;
				}
			});
		}

		// Complexity filter
		if (complexityFilter !== "all") {
			filteredTemplates = filteredTemplates.filter(
				(template) => template.complexity === complexityFilter
			);
		}

		// Sort
		filteredTemplates.sort((a, b) => {
			switch (sortBy) {
				case "popular":
					return b.purchaseCount - a.purchaseCount;
				case "newest":
					return (
						new Date(b.id).getTime() - new Date(a.id).getTime()
					);
				case "rating":
					return b.rating - a.rating;
				case "price-low":
					return a.price - b.price;
				case "price-high":
					return b.price - a.price;
				default:
					return 0;
			}
		});
	}

	const activeFiltersCount = useMemo(() => {
		let count = 0;
		if (categoryFilter !== "all") count++;
		if (priceFilter !== "all") count++;
		if (complexityFilter !== "all") count++;
		return count;
	}, [categoryFilter, priceFilter, complexityFilter]);

	const clearFilters = () => {
		setCategoryFilter("all");
		setPriceFilter("all");
		setComplexityFilter("all");
		setSearchQuery("");
	};

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<p className="text-red-500">Failed to load templates</p>
					<Button onClick={() => window.location.reload()} className="mt-4">
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Back Link */}
			<Link
				href="/"
				className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
			>
				<ArrowLeft className="h-4 w-4 mr-1" />
				Back to Home
			</Link>

			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Browse Templates</h1>
				<p className="text-muted-foreground">
					Discover AI workflow templates to automate your business processes
				</p>
			</div>

			{/* Search and Filters Bar */}
			<div className="flex flex-col gap-4 mb-6">
				<div className="flex flex-col sm:flex-row gap-4">
					{/* Search */}
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search templates..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
						{searchQuery && (
							<Button
								variant="ghost"
								size="sm"
								className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
								onClick={() => setSearchQuery("")}
							>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>

					{/* Sort Dropdown */}
					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger className="w-[180px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{sortOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Filter Toggle Button */}
					<Button
						variant="outline"
						onClick={() => setShowFilters(!showFilters)}
						className="relative"
					>
						<SlidersHorizontal className="h-4 w-4 mr-2" />
						Filters
						{activeFiltersCount > 0 && (
							<Badge
								variant="secondary"
								className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
							>
								{activeFiltersCount}
							</Badge>
						)}
					</Button>
				</div>

				{/* Filters Panel */}
				{showFilters && (
					<div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
						{/* Category Filter */}
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								{categories.map((category) => (
									<SelectItem key={category.value} value={category.value}>
										{category.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Price Filter */}
						<Select value={priceFilter} onValueChange={setPriceFilter}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Price" />
							</SelectTrigger>
							<SelectContent>
								{priceRanges.map((range) => (
									<SelectItem key={range.value} value={range.value}>
										{range.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Complexity Filter */}
						<Select value={complexityFilter} onValueChange={setComplexityFilter}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Complexity" />
							</SelectTrigger>
							<SelectContent>
								{complexityLevels.map((level) => (
									<SelectItem key={level.value} value={level.value}>
										{level.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Clear Filters */}
						{activeFiltersCount > 0 && (
							<Button variant="ghost" onClick={clearFilters} size="sm">
								<X className="h-4 w-4 mr-1" />
								Clear
							</Button>
						)}
					</div>
				)}

				{/* Active Filter Badges */}
				{activeFiltersCount > 0 && !showFilters && (
					<div className="flex flex-wrap gap-2">
						{categoryFilter !== "all" && (
							<Badge variant="secondary" className="gap-1">
								{categories.find((c) => c.value === categoryFilter)?.label}
								<Button
									variant="ghost"
									size="sm"
									className="h-auto p-0 ml-1 hover:bg-transparent"
									onClick={() => setCategoryFilter("all")}
								>
									<X className="h-3 w-3" />
								</Button>
							</Badge>
						)}
						{priceFilter !== "all" && (
							<Badge variant="secondary" className="gap-1">
								{priceRanges.find((p) => p.value === priceFilter)?.label}
								<Button
									variant="ghost"
									size="sm"
									className="h-auto p-0 ml-1 hover:bg-transparent"
									onClick={() => setPriceFilter("all")}
								>
									<X className="h-3 w-3" />
								</Button>
							</Badge>
						)}
						{complexityFilter !== "all" && (
							<Badge variant="secondary" className="gap-1">
								{complexityLevels.find((c) => c.value === complexityFilter)?.label}
								<Button
									variant="ghost"
									size="sm"
									className="h-auto p-0 ml-1 hover:bg-transparent"
									onClick={() => setComplexityFilter("all")}
								>
									<X className="h-3 w-3" />
								</Button>
							</Badge>
						)}
					</div>
				)}
			</div>

			{/* Results Count */}
			<div className="mb-4 text-sm text-muted-foreground">
				Showing {filteredTemplates.length} template
				{filteredTemplates.length !== 1 ? "s" : ""}
			</div>

			{/* Templates Grid */}
			{filteredTemplates.length === 0 ? (
				<div className="text-center py-16">
					<div className="max-w-md mx-auto">
						<Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No templates found</h3>
						<p className="text-muted-foreground mb-4">
							Try adjusting your search or filters to find what you&apos;re looking for.
						</p>
						<Button onClick={clearFilters}>Clear all filters</Button>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredTemplates.map((template) => (
						<TemplateCard key={template.id} {...template} />
					))}
				</div>
			)}
		</div>
	);
}
