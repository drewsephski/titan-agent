import { TemplateGridSkeleton, PageHeaderSkeleton } from "@/components/skeletons";

export default function Loading() {
	return (
		<div className="container mx-auto px-4 py-8">
			<PageHeaderSkeleton />
			<div className="flex flex-col sm:flex-row gap-4 mb-8">
				<div className="h-10 w-full sm:w-96 bg-muted rounded animate-pulse" />
				<div className="h-10 w-32 bg-muted rounded animate-pulse" />
			</div>
			<TemplateGridSkeleton count={9} />
		</div>
	);
}
