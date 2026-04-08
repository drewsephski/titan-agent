"use client";

import { ReactFlow, Background, Controls, MiniMap, type NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getAllNodeDefinitions } from "@/lib/workflow/nodes";
import type { FlowNode, FlowEdge } from "@/types/workflow";

const nodeDefinitions = getAllNodeDefinitions();
const nodeTypes: NodeTypes = {};
for (const definition of nodeDefinitions) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	nodeTypes[definition.shared.type] = definition.client.component as any;
}

interface WorkflowPreviewProps {
	nodes: FlowNode[];
	edges: FlowEdge[];
	className?: string;
}

export function WorkflowPreview({
	nodes,
	edges,
	className = "h-[300px]",
}: WorkflowPreviewProps) {
	// Don't render if no nodes
	if (!nodes || nodes.length === 0) {
		return (
			<div
				className={`${className} border rounded-lg overflow-hidden bg-muted flex items-center justify-center`}
			>
				<p className="text-muted-foreground text-sm">No workflow preview available</p>
			</div>
		);
	}

	return (
		<div className={`${className} border rounded-lg overflow-hidden`}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				fitView
				nodesDraggable={false}
				nodesConnectable={false}
				elementsSelectable={true}
				minZoom={0.1}
				maxZoom={1}
			>
				<Background />
				<Controls showInteractive={false} />
				<MiniMap />
			</ReactFlow>
		</div>
	);
}
