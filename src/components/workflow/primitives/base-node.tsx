"use client";

import type { ComponentProps } from "react";
import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface BaseNodeProps extends ComponentProps<"div"> {
	selected?: boolean;
	nodeId?: string;
	deletable?: boolean;
	onDelete?: () => void;
	onEdit?: () => void;
	onSave?: () => void;
}

export function BaseNode({
	className,
	selected,
	nodeId,
	deletable,
	onDelete,
	onEdit,
	onSave,
	children,
	...props
}: BaseNodeProps) {
	const [contextMenuOpen, setContextMenuOpen] = useState(false);
	const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

	const handleContextMenu = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setContextMenuPosition({ x: e.clientX, y: e.clientY });
		setContextMenuOpen(true);
	}, []);

	const handleCloseContextMenu = useCallback(() => {
		setContextMenuOpen(false);
	}, []);

	// Close context menu when clicking outside
	useEffect(() => {
		if (!contextMenuOpen) return;

		const handlePointerDown = (e: PointerEvent) => {
			// Don't close if clicking inside the context menu itself
			const target = e.target as HTMLElement;
			if (target.closest('[data-context-menu]')) {
				return;
			}
			setContextMenuOpen(false);
		};

		// Delay adding the listener to prevent immediate closing from the same click that opened it
		const timeoutId = setTimeout(() => {
			document.addEventListener("pointerdown", handlePointerDown);
		}, 100);

		return () => {
			clearTimeout(timeoutId);
			document.removeEventListener("pointerdown", handlePointerDown);
		};
	}, [contextMenuOpen]);

	const hasActions = onEdit || onDelete || onSave;

	return (
		<>
			<div
				className={cn(
					"relative rounded-md border bg-card p-5 text-card-foreground",
					className,
					selected ? "border-muted-foreground shadow-lg" : "",
					"hover:ring-1",
				)}
				onContextMenu={handleContextMenu}
				// biome-ignore lint/a11y/noNoninteractiveTabindex: Needed
				tabIndex={0}
				{...props}
			>
				{children}
			</div>

			{/* Custom Context Menu - rendered via portal to escape React Flow transforms */}
			{hasActions && contextMenuOpen &&
				createPortal(
					<div
						data-context-menu
						className="fixed z-[9999] min-w-[160px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
						style={{
							left: contextMenuPosition.x,
							top: contextMenuPosition.y,
						}}
					>
						{nodeId && (
							<>
								<div className="px-2 py-1.5 text-xs text-muted-foreground select-none">
									Node: {nodeId.slice(0, 8)}...
								</div>
								<div className="h-px bg-border my-1" />
							</>
						)}
						{onEdit && (
							<button
								onClick={() => {
									onEdit();
									handleCloseContextMenu();
								}}
								className="relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground"
								type="button"
							>
								<Pencil className="h-4 w-4" />
								Edit
							</button>
						)}
						{onSave && (
							<button
								onClick={() => {
									onSave();
									handleCloseContextMenu();
								}}
								className="relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground"
								type="button"
							>
								<Save className="h-4 w-4" />
								Save
							</button>
						)}
						{(onEdit || onSave) && deletable && onDelete && (
							<div className="h-px bg-border my-1" />
						)}
						{deletable && onDelete && (
							<button
								onClick={() => {
									onDelete();
									handleCloseContextMenu();
								}}
								className="relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none text-destructive hover:bg-destructive/10 hover:text-destructive"
								type="button"
							>
								<Trash className="h-4 w-4" />
								Delete
							</button>
						)}
					</div>,
					document.body
				)}
		</>
	);
}
