"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LoadingButtonProps {
	children: React.ReactNode;
	onClick?: () => void | Promise<void>;
	type?: "button" | "submit" | "reset";
	variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
	size?: "default" | "sm" | "lg" | "icon";
	className?: string;
	disabled?: boolean;
}

export function LoadingButton({
	children,
	onClick,
	type = "button",
	variant = "default",
	size = "default",
	className,
	disabled,
}: LoadingButtonProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleClick = async () => {
		if (!onClick) return;
		setIsLoading(true);
		try {
			await onClick();
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			type={type}
			variant={variant}
			size={size}
			className={className}
			disabled={disabled || isLoading}
			onClick={type === "button" ? handleClick : undefined}
		>
			{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
			{children}
		</Button>
	);
}

interface ErrorCardProps {
	title?: string;
	message?: string;
	onRetry?: () => void;
}

export function ErrorCard({
	title = "Something went wrong",
	message = "An unexpected error occurred. Please try again.",
	onRetry,
}: ErrorCardProps) {
	return (
		<Card className="border-destructive/50">
			<CardHeader>
				<div className="flex items-center space-x-2">
					<AlertCircle className="h-5 w-5 text-destructive" />
					<CardTitle className="text-destructive">{title}</CardTitle>
				</div>
				<CardDescription>{message}</CardDescription>
			</CardHeader>
			{onRetry && (
				<CardContent>
					<Button onClick={onRetry} variant="outline">
						Try Again
					</Button>
				</CardContent>
			)}
		</Card>
	);
}

interface PageLoaderProps {
	message?: string;
}

export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
	return (
		<div className="flex h-[50vh] w-full items-center justify-center">
			<div className="flex flex-col items-center space-y-4">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="text-sm text-muted-foreground">{message}</p>
			</div>
		</div>
	);
}

interface EmptyStateProps {
	title: string;
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
	return (
		<Card className="border-dashed">
			<CardContent className="flex flex-col items-center justify-center py-12 text-center">
				{icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
				<h3 className="text-lg font-semibold">{title}</h3>
				{description && (
					<p className="mt-2 text-sm text-muted-foreground max-w-sm">
						{description}
					</p>
				)}
				{action && (
					<Button onClick={action.onClick} className="mt-6">
						{action.label}
					</Button>
				)}
			</CardContent>
		</Card>
	);
}

interface AnimatedContainerProps {
	children: React.ReactNode;
	className?: string;
	delay?: number;
}

export function AnimatedContainer({
	children,
	className,
	delay = 0,
}: AnimatedContainerProps) {
	return (
		<div
			className={className}
			style={{
				animation: `fadeIn 0.5s ease-out ${delay}s both`,
			}}
		>
			{children}
		</div>
	);
}

export function AnimatedCard({
	children,
	className,
	delay = 0,
}: AnimatedContainerProps) {
	return (
		<Card
			className={className}
			style={{
				animation: `fadeInUp 0.5s ease-out ${delay}s both`,
			}}
		>
			{children}
		</Card>
	);
}

// Add CSS animations via inline styles or a separate CSS file
export function AnimationStyles() {
	return (
		<style jsx global>{`
			@keyframes fadeIn {
				from {
					opacity: 0;
				}
				to {
					opacity: 1;
				}
			}

			@keyframes fadeInUp {
				from {
					opacity: 0;
					transform: translateY(20px);
				}
				to {
					opacity: 1;
					transform: translateY(0);
				}
			}

			@keyframes slideIn {
				from {
					opacity: 0;
					transform: translateX(-20px);
				}
				to {
					opacity: 1;
					transform: translateX(0);
				}
			}

			@keyframes pulse {
				0%, 100% {
					opacity: 1;
				}
				50% {
					opacity: 0.5;
				}
			}

			.animate-fade-in {
				animation: fadeIn 0.5s ease-out;
			}

			.animate-fade-in-up {
				animation: fadeInUp 0.5s ease-out;
			}

			.animate-slide-in {
				animation: slideIn 0.3s ease-out;
			}

			.animate-pulse-subtle {
				animation: pulse 2s ease-in-out infinite;
			}
		`}</style>
	);
}
