"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface ReviewableTemplateData {
	id: string;
	purchaseId: string;
	templateId: string;
	title: string;
	slug: string;
	category: string;
	creatorName: string;
	purchasedAt: Date;
	certificationBadge: string;
	previewImages: string[];
}

interface ReviewDialogProps {
	template: ReviewableTemplateData;
	onSubmit: (
		purchaseId: string,
		templateId: string,
		rating: number,
		title: string,
		content: string
	) => Promise<{ success: boolean; error?: string }>;
}

export function ReviewDialog({ template, onSubmit }: ReviewDialogProps) {
	const [open, setOpen] = useState(false);
	const [rating, setRating] = useState("5");
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async () => {
		setSubmitting(true);
		const result = await onSubmit(
			template.purchaseId,
			template.templateId,
			parseInt(rating),
			title,
			content
		);
		setSubmitting(false);

		if (result.success) {
			setOpen(false);
			// Could trigger a toast or refresh here
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">
					<Star className="h-4 w-4 mr-1" />
					Review
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Write a Review</DialogTitle>
					<DialogDescription>
						Share your experience with {template.title}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Rating</label>
						<Select value={rating} onValueChange={setRating}>
							<SelectTrigger>
								<SelectValue placeholder="Select rating" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="5">5 Stars - Excellent</SelectItem>
								<SelectItem value="4">4 Stars - Very Good</SelectItem>
								<SelectItem value="3">3 Stars - Good</SelectItem>
								<SelectItem value="2">2 Stars - Fair</SelectItem>
								<SelectItem value="1">1 Star - Poor</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">Review Title</label>
						<Input
							placeholder="Summarize your experience"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">Review</label>
						<Textarea
							placeholder="What did you like? How did you use this template?"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							rows={4}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={submitting || !title.trim() || !content.trim()}
					>
						{submitting ? "Submitting..." : "Submit Review"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
