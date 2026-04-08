"use client";

import {
	Background,
	Controls,
	type EdgeTypes,
	MiniMap,
	type NodeTypes,
	ReactFlow,
	ReactFlowProvider,
	useKeyPress,
	useOnSelectionChange,
	useReactFlow,
} from "@xyflow/react";
import { type DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { shallow } from "zustand/shallow";
import "@xyflow/react/dist/style.css";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
	Play,
	Save,
	RotateCcw,
	Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWorkflow } from "@/hooks/workflow/use-workflow";
import { StatusEdge } from "@/components/workflow/status-edge";
import { NodeSelectorPanel } from "@/components/node-selector-panel";
import { NodeEditorPanel } from "@/components/node-editor-panel";
import { ValidationStatus } from "@/components/validation-status";
import { TemplateSelector } from "@/components/template-selector";
import { Chat } from "@/components/chat";
import {
	DEFAULT_TEMPLATE,
	getTemplateById,
} from "@/lib/templates";
import { getAllNodeDefinitions } from "@/lib/workflow/nodes";
import type { WorkflowUIMessage } from "@/types/messages";
import type { FlowNode } from "@/types/workflow";

const nodeDefinitions = getAllNodeDefinitions();
const nodeTypes: NodeTypes = {} as NodeTypes;
for (const definition of nodeDefinitions) {
	// biome-ignore lint/suspicious/noExplicitAny: ReactFlow nodeTypes accepts any component type
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	nodeTypes[definition.shared.type] = definition.client.component as any;
}

const edgeTypes: EdgeTypes = {
	status: StatusEdge,
};

interface SavedWorkflow {
	id: string;
	name: string;
	description: string;
	nodes: FlowNode[];
	edges: StatusEdge[];
	createdAt: string;
}

function Flow() {
	const { theme } = useTheme();
	const store = useWorkflow(
		(store) => ({
			nodes: store.nodes,
			edges: store.edges,
			onNodesChange: store.onNodesChange,
			onEdgesChange: store.onEdgesChange,
			onConnect: store.onConnect,
			createNode: store.createNode,
			initializeWorkflow: store.initializeWorkflow,
			updateNode: store.updateNode,
			getWorkflowData: store.getWorkflowData,
			deleteNode: store.deleteNode,
		}),
		shallow,
	);

	const [selectedNodes, setSelectedNodes] = useState<FlowNode[]>([]);
	const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
		DEFAULT_TEMPLATE.id,
	);
	const [workflowName, setWorkflowName] = useState("Untitled Workflow");
	const [workflowDescription, setWorkflowDescription] = useState("");
	const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
	const [showSaveDialog, setShowSaveDialog] = useState(false);

	const { messages, sendMessage, status, stop, setMessages } =
		useChat<WorkflowUIMessage>({
			transport: new DefaultChatTransport({
				api: "/api/workflow",
			}),
			onData: (dataPart) => {
				if (dataPart.type === "data-node-execution-status") {
					store.updateNode({
						id: dataPart.data.nodeId,
						nodeType: dataPart.data.nodeType,
						data: { status: dataPart.data.status },
					});

					if (
						dataPart.data.status === "error" &&
						dataPart.data.error
					) {
						console.error(
							`Node ${dataPart.data.nodeId} error:`,
							dataPart.data.error,
						);
					}
				}
			},
		});

	const isLoading = status === "streaming" || status === "submitted";

	useOnSelectionChange({
		onChange: ({ nodes }) => {
			setSelectedNodes(nodes as FlowNode[]);
		},
	});

	// Delete selected nodes when Delete key is pressed
	const deleteKeyPressed = useKeyPress("Delete");
	const lastDeleteKeyState = useRef(false);
	useEffect(() => {
		if (deleteKeyPressed && !lastDeleteKeyState.current && selectedNodes.length > 0 && !isLoading) {
			for (const node of selectedNodes) {
				store.deleteNode(node.id);
			}
		}
		lastDeleteKeyState.current = deleteKeyPressed;
	}, [deleteKeyPressed, selectedNodes, store, isLoading]);

	const handleTemplateSelect = (templateId: string) => {
		const template = getTemplateById(templateId);
		if (template) {
			setSelectedTemplateId(templateId);
			store.initializeWorkflow({
				nodes: template.nodes,
				edges: template.edges,
			});
			setMessages([]);
		}
	};

	useEffect(() => {
		store.initializeWorkflow({
			nodes: DEFAULT_TEMPLATE.nodes,
			edges: DEFAULT_TEMPLATE.edges,
		});
		// Load saved workflows from localStorage
		const saved = localStorage.getItem("savedWorkflows");
		if (saved) {
			setSavedWorkflows(JSON.parse(saved));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { screenToFlowPosition } = useReactFlow();

	const onDragOver = useCallback((event: DragEvent) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(event: DragEvent) => {
			event.preventDefault();

			const type = event.dataTransfer.getData(
				"application/reactflow",
			) as FlowNode["type"];

			if (!type) {
				return;
			}

			const position = screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			store.createNode(type, position);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[screenToFlowPosition, store.createNode],
	);

	const handleSaveWorkflow = () => {
		const workflowData = store.getWorkflowData();
		const newWorkflow: SavedWorkflow = {
			id: crypto.randomUUID(),
			name: workflowName,
			description: workflowDescription,
			nodes: workflowData.nodes,
			edges: workflowData.edges as StatusEdge[],
			createdAt: new Date().toISOString(),
		};

		const updatedWorkflows = [...savedWorkflows, newWorkflow];
		setSavedWorkflows(updatedWorkflows);
		localStorage.setItem("savedWorkflows", JSON.stringify(updatedWorkflows));
		window.dispatchEvent(new CustomEvent("savedWorkflowsUpdated"));
		setShowSaveDialog(false);
	};

	const handleLoadWorkflow = useCallback((workflow: SavedWorkflow) => {
		store.initializeWorkflow({
			nodes: workflow.nodes,
			edges: workflow.edges,
		});
		setWorkflowName(workflow.name);
		setWorkflowDescription(workflow.description);
		setMessages([]);
	}, [store, setMessages]);

	// Listen for workflow load events from sidebar
	useEffect(() => {
		const handleSidebarLoad = (event: CustomEvent<SavedWorkflow>) => {
			handleLoadWorkflow(event.detail);
		};

		window.addEventListener("loadWorkflow", handleSidebarLoad as EventListener);
		return () => window.removeEventListener("loadWorkflow", handleSidebarLoad as EventListener);
	}, [handleLoadWorkflow]);

	const handleReset = () => {
		store.initializeWorkflow({
			nodes: DEFAULT_TEMPLATE.nodes,
			edges: DEFAULT_TEMPLATE.edges,
		});
		setWorkflowName("Untitled Workflow");
		setWorkflowDescription("");
		setMessages([]);
	};

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b bg-card">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<div className="p-2 bg-primary/10 rounded-lg">
							<Play className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h1 className="text-lg font-semibold">Playground</h1>
							<p className="text-sm text-muted-foreground">
								Build and test your AI workflows
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<TemplateSelector
						selectedTemplateId={selectedTemplateId}
						onTemplateSelect={handleTemplateSelect}
						className="hidden lg:flex"
					/>

					<ValidationStatus />

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									onClick={handleReset}
									disabled={isLoading}
								>
									<RotateCcw className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Reset</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<TooltipProvider>
						<Tooltip>
							<Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
								<DialogTrigger asChild>
									<TooltipTrigger asChild>
										<Button variant="outline" size="icon" disabled={isLoading}>
											<Save className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
								</DialogTrigger>
								<TooltipContent>Save Workflow</TooltipContent>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Save Workflow</DialogTitle>
								<DialogDescription>
									Save your workflow to your browser&apos;s local storage.
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="name">Workflow Name</Label>
									<Input
										id="name"
										value={workflowName}
										onChange={(e) => setWorkflowName(e.target.value)}
										placeholder="My Awesome Workflow"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										value={workflowDescription}
										onChange={(e) => setWorkflowDescription(e.target.value)}
										placeholder="What does this workflow do?"
										rows={3}
									/>
								</div>
							</div>
							<Button onClick={handleSaveWorkflow} className="w-full">
								Save to Local Storage
							</Button>
						</DialogContent>
					</Dialog>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			<div className="flex-1 flex overflow-hidden">
				{/* Main Workflow Canvas */}
				<div className="flex-1 relative min-w-0">
						<ReactFlow
							nodes={store.nodes}
							edges={store.edges}
							onNodesChange={store.onNodesChange}
							onEdgesChange={store.onEdgesChange}
							onConnect={store.onConnect}
							nodeTypes={nodeTypes}
							edgeTypes={edgeTypes}
							onDragOver={onDragOver}
							onDrop={onDrop}
							fitView
							colorMode={theme === "dark" ? "dark" : "light"}
							nodesDraggable={!isLoading}
							nodesConnectable={!isLoading}
							nodesFocusable={!isLoading}
							edgesFocusable={!isLoading}
							elementsSelectable={!isLoading}
						>
							<Background />
							<Controls />
							<MiniMap />
							<NodeSelectorPanel />

							{selectedNodes.length === 1 && (
								<NodeEditorPanel nodeId={selectedNodes[0].id} />
							)}
						</ReactFlow>
					</div>

				{/* Chat Sidebar */}
				<div className="w-96 border-l bg-card flex flex-col h-full overflow-hidden shrink-0">
						<div className="p-4 border-b shrink-0">
							<div className="flex items-center gap-2">
								<Sparkles className="h-5 w-5 text-primary" />
								<h2 className="font-semibold">Test Your Workflow</h2>
							</div>
							<p className="text-sm text-muted-foreground mt-1">
								Send messages to test how your workflow responds
							</p>
						</div>
						<div className="flex-1 overflow-hidden min-h-0">
							<Chat
								messages={messages}
								sendMessage={sendMessage}
								status={status}
								stop={stop}
								setMessages={setMessages}
								selectedTemplateId={selectedTemplateId}
							/>
						</div>
					</div>
			</div>
		</div>
	);
}

export default function PlaygroundPage() {
	return (
		<div className="h-[calc(100vh-64px)]">
			<ReactFlowProvider>
				<Flow />
			</ReactFlowProvider>
		</div>
	);
}
