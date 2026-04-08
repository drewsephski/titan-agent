"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitTemplate, checkSlugAvailability } from "@/lib/actions/template-submission";
import { WorkflowPreview } from "@/components/templates/workflow-preview";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	ArrowLeft,
	ArrowRight,
	Upload,
	FileJson,
	Check,
	AlertCircle,
	X,
	Loader2,
	Sparkles,
	Tag,
	DollarSign,
} from "lucide-react";
import type { FlowNode, FlowEdge } from "@/types/workflow";

// Form schema
const formSchema = z.object({
	title: z.string().min(3, "Title must be at least 3 characters").max(100),
	slug: z
		.string()
		.min(3, "Slug must be at least 3 characters")
		.max(50)
		.regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
	description: z.string().min(50, "Description must be at least 50 characters").max(1000),
	category: z.enum(["support", "sales", "marketing", "operations", "development"]),
	tags: z.array(z.string()).max(10, "Maximum 10 tags"),
	price: z.number().min(0).max(100000),
	pricingModel: z.enum(["one_time", "subscription"]),
	complexity: z.enum(["beginner", "intermediate", "advanced"]),
	documentation: z.string().min(100, "Documentation must be at least 100 characters").max(10000),
	integrations: z.array(z.string()),
	workflowJson: z.object({
		nodes: z.array(z.any()),
		edges: z.array(z.any()),
	}),
});

type FormData = z.infer<typeof formSchema>;

type SubmissionStep = "workflow" | "metadata" | "documentation" | "preview" | "success";

const categories = [
	{ value: "support", label: "Support", description: "Customer support & helpdesk workflows" },
	{ value: "sales", label: "Sales", description: "Lead generation & sales automation" },
	{ value: "marketing", label: "Marketing", description: "Content & campaign automation" },
	{ value: "operations", label: "Operations", description: "Internal operations & processes" },
	{ value: "development", label: "Development", description: "Dev tools & coding workflows" },
];

const complexities = [
	{ value: "beginner", label: "Beginner", description: "Simple workflows, easy to customize" },
	{ value: "intermediate", label: "Intermediate", description: "Moderate complexity with multiple steps" },
	{ value: "advanced", label: "Advanced", description: "Complex workflows with custom logic" },
];

const pricingModels = [
	{ value: "one_time", label: "One-time Purchase", description: "Buy once, own forever" },
	{ value: "subscription", label: "Subscription", description: "Monthly recurring payment" },
];

const commonIntegrations = [
	"OpenAI",
	"Slack",
	"Notion",
	"HubSpot",
	"Twitter",
	"LinkedIn",
	"GitHub",
	"Discord",
	"Zapier",
	"Stripe",
	"Resend",
	"UploadThing",
];

// Slugify helper
function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

export default function TemplateSubmissionForm() {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState<SubmissionStep>("workflow");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [workflowInput, setWorkflowInput] = useState("");
	const [newTag, setNewTag] = useState("");
	const [slugChecked, setSlugChecked] = useState<boolean | null>(null);
	const [slugChecking, setSlugChecking] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
		trigger,
		reset,
	} = useForm<FormData>({
		defaultValues: {
			title: "",
			slug: "",
			description: "",
			category: "support",
			tags: [],
			price: 0,
			pricingModel: "one_time",
			complexity: "beginner",
			documentation: "",
			integrations: [],
			workflowJson: { nodes: [], edges: [] },
		},
	});

	const watchedValues = watch();

	// Parse workflow JSON
	const parseWorkflowJson = useCallback(() => {
		try {
			const parsed = JSON.parse(workflowInput);
			if (parsed.nodes && parsed.edges) {
				setValue("workflowJson", parsed);
				toast.success(`Workflow loaded: ${parsed.nodes.length} nodes, ${parsed.edges.length} edges`);
				return true;
			}
			throw new Error("Invalid workflow format");
		} catch (error) {
			toast.error("Invalid JSON. Please check your workflow JSON format.");
			return false;
		}
	}, [workflowInput, setValue]);

	// Check slug availability
	const checkSlug = useCallback(async () => {
		const slug = watchedValues.slug;
		if (!slug || slug.length < 3) return;

		setSlugChecking(true);
		try {
			const result = await checkSlugAvailability(slug);
			setSlugChecked(result.available);
			if (!result.available) {
				toast.error("This slug is already taken. Please choose another.");
			}
		} catch {
			setSlugChecked(null);
		} finally {
			setSlugChecking(false);
		}
	}, [watchedValues.slug]);

	// Auto-generate slug from title
	const generateSlug = useCallback(() => {
		const title = watchedValues.title;
		if (title) {
			const slug = slugify(title);
			setValue("slug", slug);
			setSlugChecked(null);
		}
	}, [watchedValues.title, setValue]);

	// Add tag
	const addTag = useCallback(() => {
		if (newTag && !watchedValues.tags.includes(newTag)) {
			if (watchedValues.tags.length >= 10) {
				toast.error("Maximum 10 tags allowed");
				return;
			}
			setValue("tags", [...watchedValues.tags, newTag]);
			setNewTag("");
		}
	}, [newTag, watchedValues.tags, setValue]);

	// Remove tag
	const removeTag = useCallback(
		(tagToRemove: string) => {
			setValue(
				"tags",
				watchedValues.tags.filter((t) => t !== tagToRemove)
			);
		},
		[watchedValues.tags, setValue]
	);

	// Toggle integration
	const toggleIntegration = useCallback(
		(integration: string) => {
			const current = watchedValues.integrations;
			if (current.includes(integration)) {
				setValue(
					"integrations",
					current.filter((i) => i !== integration)
				);
			} else {
				setValue("integrations", [...current, integration]);
			}
		},
		[watchedValues.integrations, setValue]
	);

	// Navigation
	const nextStep = useCallback(async () => {
		let canProceed = false;

		switch (currentStep) {
			case "workflow":
				canProceed = parseWorkflowJson();
				if (canProceed) setCurrentStep("metadata");
				break;
			case "metadata":
				canProceed = await trigger(["title", "slug", "description", "category", "tags", "price"]);
				if (canProceed) setCurrentStep("documentation");
				break;
			case "documentation":
				canProceed = await trigger(["documentation"]);
				if (canProceed) setCurrentStep("preview");
				break;
			case "preview":
				handleFormSubmit();
				break;
		}
	}, [currentStep, parseWorkflowJson, trigger, watchedValues]);

	const prevStep = useCallback(() => {
		switch (currentStep) {
			case "metadata":
				setCurrentStep("workflow");
				break;
			case "documentation":
				setCurrentStep("metadata");
				break;
			case "preview":
				setCurrentStep("documentation");
				break;
		}
	}, [currentStep]);

	// Submit handler
	const handleFormSubmit = useCallback(async () => {
		setIsSubmitting(true);
		try {
			// Manual validation
			const result = formSchema.safeParse(watchedValues);
			if (!result.success) {
				const errorMessages = result.error.issues.map((e: { message: string }) => e.message).join("\n");
				toast.error(`Validation failed:\n${errorMessages}`);
				setIsSubmitting(false);
				return;
			}

			const submitResult = await submitTemplate(result.data);
			if (submitResult.success) {
				toast.success("Template submitted successfully!");
				setCurrentStep("success");
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to submit template");
		} finally {
			setIsSubmitting(false);
		}
	}, [watchedValues]);

	// Render workflow step
	const renderWorkflowStep = () => (
		<Card>
			<CardHeader>
				<CardTitle>Upload Workflow</CardTitle>
				<CardDescription>
					Paste your workflow JSON from the workflow builder. You can build your workflow{" "}
					<Link href="/creator/build" className="text-primary hover:underline">
						here
					</Link>
					.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
					<FileJson className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<p className="text-sm text-muted-foreground mb-4">
						Paste your workflow JSON below
					</p>
					<Textarea
						value={workflowInput}
						onChange={(e) => setWorkflowInput(e.target.value)}
						placeholder='{"nodes": [...], "edges": [...]}'
						className="min-h-[200px] font-mono text-sm"
					/>
				</div>

				{watchedValues.workflowJson.nodes.length > 0 && (
					<div className="border rounded-lg overflow-hidden">
						<div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
							<span className="font-medium">Preview</span>
							<Badge variant="secondary">
								{watchedValues.workflowJson.nodes.length} nodes
							</Badge>
						</div>
						<WorkflowPreview
							nodes={watchedValues.workflowJson.nodes}
							edges={watchedValues.workflowJson.edges}
							className="h-[300px] border-0 rounded-none"
						/>
					</div>
				)}
			</CardContent>
			<CardFooter className="flex justify-end">
				<Button onClick={nextStep}>
					Continue
					<ArrowRight className="h-4 w-4 ml-2" />
				</Button>
			</CardFooter>
		</Card>
	);

	// Render metadata step
	const renderMetadataStep = () => (
		<Card>
			<CardHeader>
				<CardTitle>Template Details</CardTitle>
				<CardDescription>Provide information about your template</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Title */}
				<div className="space-y-2">
					<Label htmlFor="title">Title</Label>
					<Input
						id="title"
						{...register("title")}
						placeholder="e.g., Customer Support AI Workflow"
						onBlur={generateSlug}
					/>
					{errors.title && (
						<p className="text-sm text-destructive">{errors.title.message}</p>
					)}
				</div>

				{/* Slug */}
				<div className="space-y-2">
					<Label htmlFor="slug">Slug (URL)</Label>
					<div className="flex gap-2">
						<Input
							id="slug"
							{...register("slug")}
							placeholder="e.g., customer-support-ai"
							className="flex-1"
						/>
						<Button
							type="button"
							variant="outline"
							onClick={checkSlug}
							disabled={slugChecking || !watchedValues.slug}
						>
							{slugChecking ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : slugChecked === true ? (
								<Check className="h-4 w-4 text-green-500" />
							) : slugChecked === false ? (
								<AlertCircle className="h-4 w-4 text-red-500" />
							) : (
								"Check"
							)}
						</Button>
					</div>
					{errors.slug && (
						<p className="text-sm text-destructive">{errors.slug.message}</p>
					)}
					{slugChecked === false && (
						<p className="text-sm text-destructive">This slug is already taken</p>
					)}
					<p className="text-xs text-muted-foreground">
						This will be your template&apos;s URL: /templates/{watchedValues.slug || "your-slug"}
					</p>
				</div>

				{/* Description */}
				<div className="space-y-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						{...register("description")}
						placeholder="Describe what your workflow does and who it's for..."
						rows={4}
					/>
					{errors.description && (
						<p className="text-sm text-destructive">{errors.description.message}</p>
					)}
					<p className="text-xs text-muted-foreground">
						Minimum 50 characters. Be descriptive to help buyers understand the value.
					</p>
				</div>

				{/* Category & Complexity */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>Category</Label>
						<Select
							value={watchedValues.category}
							onValueChange={(value) => setValue("category", value as FormData["category"])}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{categories.map((cat) => (
									<SelectItem key={cat.value} value={cat.value}>
										{cat.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Complexity</Label>
						<Select
							value={watchedValues.complexity}
							onValueChange={(value) => setValue("complexity", value as FormData["complexity"])}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{complexities.map((comp) => (
									<SelectItem key={comp.value} value={comp.value}>
										{comp.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Tags */}
				<div className="space-y-2">
					<Label>Tags</Label>
					<div className="flex gap-2">
						<Input
							value={newTag}
							onChange={(e) => setNewTag(e.target.value)}
							placeholder="Add a tag..."
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addTag();
								}
							}}
						/>
						<Button type="button" variant="outline" onClick={addTag}>
							<Tag className="h-4 w-4" />
						</Button>
					</div>
					<div className="flex flex-wrap gap-2 mt-2">
						{watchedValues.tags.map((tag) => (
							<Badge key={tag} variant="secondary" className="gap-1">
								{tag}
								<button
									type="button"
									onClick={() => removeTag(tag)}
									className="ml-1 hover:text-destructive"
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						))}
					</div>
					<p className="text-xs text-muted-foreground">
						Maximum 10 tags. Press Enter or click the tag button to add.
					</p>
				</div>

				{/* Pricing */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>Pricing Model</Label>
						<Select
							value={watchedValues.pricingModel}
							onValueChange={(value) =>
								setValue("pricingModel", value as FormData["pricingModel"])
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{pricingModels.map((model) => (
									<SelectItem key={model.value} value={model.value}>
										{model.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="price">
							Price ({watchedValues.pricingModel === "subscription" ? "/month" : "one-time"})
						</Label>
						<div className="relative">
							<DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								id="price"
								type="number"
								{...register("price", { valueAsNumber: true })}
								placeholder="0 for free"
								className="pl-10"
								min={0}
							/>
						</div>
						{errors.price && (
							<p className="text-sm text-destructive">{errors.price.message}</p>
						)}
					</div>
				</div>

				{/* Integrations */}
				<div className="space-y-2">
					<Label>Integrations</Label>
					<div className="flex flex-wrap gap-2">
						{commonIntegrations.map((integration) => (
							<Badge
								key={integration}
								variant={
									watchedValues.integrations.includes(integration)
										? "default"
										: "outline"
								}
								className="cursor-pointer"
								onClick={() => toggleIntegration(integration)}
							>
								{integration}
							</Badge>
						))}
					</div>
					<p className="text-xs text-muted-foreground">
						Click to select the integrations your workflow uses
					</p>
				</div>
			</CardContent>
			<CardFooter className="flex justify-between">
				<Button variant="outline" onClick={prevStep}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Button>
				<Button onClick={nextStep}>
					Continue
					<ArrowRight className="h-4 w-4 ml-2" />
				</Button>
			</CardFooter>
		</Card>
	);

	// Render documentation step
	const renderDocumentationStep = () => (
		<Card>
			<CardHeader>
				<CardTitle>Documentation</CardTitle>
				<CardDescription>
					Write comprehensive documentation to help buyers set up and use your workflow
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="documentation">Documentation (Markdown supported)</Label>
					<Textarea
						id="documentation"
						{...register("documentation")}
						placeholder={`# Getting Started

## Prerequisites
- List what users need before using your workflow
- API keys, accounts, etc.

## Setup Instructions
1. Step one
2. Step two
3. Step three

## Usage
Explain how to use the workflow

## Customization
Tips for customizing the workflow`}
						rows={20}
						className="font-mono text-sm"
					/>
					{errors.documentation && (
						<p className="text-sm text-destructive">{errors.documentation.message}</p>
					)}
				</div>

				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Good documentation should include setup instructions, prerequisites, and
						usage examples. Minimum 100 characters required.
					</AlertDescription>
				</Alert>
			</CardContent>
			<CardFooter className="flex justify-between">
				<Button variant="outline" onClick={prevStep}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Button>
				<Button onClick={nextStep}>
					Continue
					<ArrowRight className="h-4 w-4 ml-2" />
				</Button>
			</CardFooter>
		</Card>
	);

	// Render preview step
	const renderPreviewStep = () => (
		<Card>
			<CardHeader>
				<CardTitle>Preview</CardTitle>
				<CardDescription>Review your template before submitting</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Header Preview */}
				<div className="border rounded-lg p-6 space-y-4">
					<div className="flex items-start justify-between">
						<div>
							<h2 className="text-2xl font-bold">{watchedValues.title}</h2>
							<p className="text-muted-foreground mt-1">
								{watchedValues.description}
							</p>
						</div>
						<div className="text-right">
							<p className="text-3xl font-bold">
								{watchedValues.price === 0
									? "Free"
										: `$${(watchedValues.price / 100).toFixed(2)}`}
							</p>
							{watchedValues.pricingModel === "subscription" && (
								<p className="text-sm text-muted-foreground">/month</p>
							)}
						</div>
					</div>

					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary">
							{categories.find((c) => c.value === watchedValues.category)?.label}
						</Badge>
						<Badge>
							{complexities.find((c) => c.value === watchedValues.complexity)?.label}
						</Badge>
						{watchedValues.tags.map((tag) => (
							<Badge key={tag} variant="outline">
								{tag}
							</Badge>
						))}
					</div>

					<Separator />

					<div className="flex flex-wrap gap-2">
						{watchedValues.integrations.map((integration) => (
							<Badge key={integration} variant="secondary">
								{integration}
							</Badge>
						))}
					</div>
				</div>

				{/* Workflow Preview */}
				<div className="border rounded-lg overflow-hidden">
					<div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
						<span className="font-medium">Workflow Preview</span>
						<Badge variant="secondary">
							{watchedValues.workflowJson.nodes.length} nodes
						</Badge>
					</div>
					<WorkflowPreview
						nodes={watchedValues.workflowJson.nodes}
						edges={watchedValues.workflowJson.edges}
						className="h-[300px] border-0 rounded-none"
					/>
				</div>

				{/* Documentation Preview */}
				<div className="border rounded-lg p-4">
					<h3 className="font-semibold mb-2">Documentation Preview</h3>
					<div className="max-h-[300px] overflow-y-auto">
						<MarkdownContent
							content={watchedValues.documentation}
							className="prose prose-sm"
						/>
					</div>
				</div>

				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Your template will be submitted for certification review. Once approved,
						it will be published to the marketplace.
					</AlertDescription>
				</Alert>
			</CardContent>
			<CardFooter className="flex justify-between">
				<Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Button>
				<Button onClick={nextStep} disabled={isSubmitting} className="gap-2">
					{isSubmitting ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Submitting...
						</>
					) : (
						<>
							<Upload className="h-4 w-4" />
							Submit Template
						</>
					)}
				</Button>
			</CardFooter>
		</Card>
	);

	// Render success step
	const renderSuccessStep = () => (
		<Card className="text-center">
			<CardHeader>
				<div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
					<Check className="h-8 w-8 text-green-600" />
				</div>
				<CardTitle className="text-2xl">Template Submitted!</CardTitle>
				<CardDescription>
					Your template has been submitted for certification review. We&apos;ll notify
					you once it&apos;s been reviewed.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="bg-muted p-4 rounded-lg">
					<p className="text-sm text-muted-foreground mb-1">Submission Status</p>
					<Badge variant="secondary" className="gap-1">
						<Sparkles className="h-3 w-3" />
						Pending Certification
					</Badge>
				</div>

				<div className="flex gap-2 justify-center">
					<Button asChild>
						<Link href="/creator">Go to Dashboard</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link href="/templates">Browse Templates</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);

	// Step indicator
	const steps = [
		{ key: "workflow", label: "Workflow" },
		{ key: "metadata", label: "Details" },
		{ key: "documentation", label: "Docs" },
		{ key: "preview", label: "Preview" },
	];

	return (
		<div className="space-y-6">
			{/* Progress Indicator */}
			{currentStep !== "success" && (
				<div className="flex items-center justify-center gap-2">
					{steps.map((step, index) => {
						const isActive = steps.findIndex((s) => s.key === currentStep) >= index;
						const isCurrent = step.key === currentStep;

						return (
							<div key={step.key} className="flex items-center gap-2">
								<div
									className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
										isCurrent
											? "bg-primary text-primary-foreground"
											: isActive
												? "bg-primary/10 text-primary"
												: "bg-muted text-muted-foreground"
									}`}
								>
									<span className="font-medium">{index + 1}</span>
									<span>{step.label}</span>
								</div>
								{index < steps.length - 1 && (
									<div
										className={`w-8 h-px ${
											isActive ? "bg-primary/30" : "bg-muted"
										}`}
									/>
								)}
							</div>
						);
					})}
				</div>
			)}

			{/* Step Content */}
			{currentStep === "workflow" && renderWorkflowStep()}
			{currentStep === "metadata" && renderMetadataStep()}
			{currentStep === "documentation" && renderDocumentationStep()}
			{currentStep === "preview" && renderPreviewStep()}
			{currentStep === "success" && renderSuccessStep()}
		</div>
	);
}
