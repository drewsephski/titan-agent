"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TemplateCardSkeleton() {
	return (
		<Card className="overflow-hidden">
			<CardHeader className="p-0">
				<Skeleton className="h-48 w-full" />
			</CardHeader>
			<CardContent className="p-4 space-y-3">
				<Skeleton className="h-6 w-3/4" />
				<Skeleton className="h-4 w-1/2" />
				<div className="flex items-center justify-between pt-2">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-8 w-24" />
				</div>
			</CardContent>
		</Card>
	);
}

export function TemplateGridSkeleton({ count = 6 }: { count?: number }) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{Array.from({ length: count }).map((_, i) => (
				<TemplateCardSkeleton key={i} />
			))}
		</div>
	);
}

export function TemplateDetailSkeleton() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Main content */}
				<div className="lg:col-span-2 space-y-6">
					<Skeleton className="h-96 w-full" />
					<div className="space-y-4">
						<Skeleton className="h-8 w-3/4" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
						<Skeleton className="h-4 w-4/5" />
					</div>
				</div>

				{/* Sidebar */}
				<div className="space-y-4">
					<Card>
						<CardContent className="p-6 space-y-4">
							<Skeleton className="h-10 w-32" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-12 w-full" />
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

export function DashboardStatsSkeleton() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<Card key={i}>
					<CardContent className="p-6">
						<div className="flex items-center space-x-4">
							<Skeleton className="h-12 w-12 rounded-lg" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-6 w-16" />
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
	return (
		<div className="space-y-3">
			<div className="flex items-center space-x-4 pb-4">
				<Skeleton className="h-8 w-1/4" />
				<Skeleton className="h-8 w-1/4" />
				<Skeleton className="h-8 w-1/4" />
				<Skeleton className="h-8 w-1/4" />
			</div>
			{Array.from({ length: rows }).map((_, i) => (
				<div key={i} className="flex items-center space-x-4">
					<Skeleton className="h-12 w-1/4" />
					<Skeleton className="h-12 w-1/4" />
					<Skeleton className="h-12 w-1/4" />
					<Skeleton className="h-12 w-1/4" />
				</div>
			))}
		</div>
	);
}

export function PageHeaderSkeleton() {
	return (
		<div className="space-y-4 pb-6">
			<Skeleton className="h-8 w-1/3" />
			<Skeleton className="h-4 w-1/2" />
		</div>
	);
}

export function CreatorDashboardSkeleton() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<DashboardStatsSkeleton />
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent>
							<TableSkeleton rows={3} />
						</CardContent>
					</Card>
				</div>
				<div>
					<Card>
						<CardContent className="p-6 space-y-4">
							<Skeleton className="h-40 w-full" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-5/6" />
								<Skeleton className="h-4 w-4/5" />
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

export function BuyerDashboardSkeleton() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<DashboardStatsSkeleton />
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-40" />
					</CardHeader>
					<CardContent>
						<TableSkeleton rows={3} />
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-32" />
					</CardHeader>
					<CardContent className="space-y-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="flex items-center space-x-3">
								<Skeleton className="h-12 w-12 rounded" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-3 w-1/2" />
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export function AdminDashboardSkeleton() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<DashboardStatsSkeleton />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{Array.from({ length: 6 }).map((_, i) => (
					<Card key={i}>
						<CardContent className="p-6 space-y-3">
							<div className="flex items-center space-x-3">
								<Skeleton className="h-10 w-10 rounded-lg" />
								<Skeleton className="h-5 w-32" />
							</div>
							<Skeleton className="h-4 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

export function CertificationQueueSkeleton() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<Card key={i}>
						<CardContent className="p-4 space-y-3">
							<div className="flex items-center justify-between">
								<Skeleton className="h-5 w-3/4" />
								<Skeleton className="h-5 w-16" />
							</div>
							<Skeleton className="h-4 w-1/2" />
							<div className="flex items-center space-x-2 pt-2">
								<Skeleton className="h-8 w-20" />
								<Skeleton className="h-8 w-20" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
