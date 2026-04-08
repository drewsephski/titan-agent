import { describe, it, expect } from "vitest";
import {
	determineCertificationBadge,
	runSecurityScan,
	calculatePerformanceMetrics,
} from "./certification";
import type { FlowNode, FlowEdge } from "@/types/workflow";

describe("Certification Badge Determination", () => {
	const createWorkflow = (nodeCount: number): { nodes: FlowNode[]; edges: FlowEdge[] } => {
		const nodes: FlowNode[] = Array.from({ length: nodeCount }, (_, i) => {
			const position = { x: i * 100, y: 0 };
			if (i === 0) {
				// Start node
				return {
					id: `node-${i}`,
					type: "start",
					position,
					data: { sourceType: { type: "text" } },
				} as FlowNode;
			}
			if (i === nodeCount - 1) {
				// End node
				return {
					id: `node-${i}`,
					type: "end",
					position,
					data: {},
				} as FlowNode;
			}
			// Agent nodes for intermediate nodes
			return {
				id: `node-${i}`,
				type: "agent",
				position,
				data: {
					name: `Agent ${i}`,
					model: "gpt-4",
					systemPrompt: "Test prompt",
					status: "idle",
					selectedTools: [],
					sourceType: { type: "text" },
					hideResponseInChat: false,
					excludeFromConversation: false,
					maxSteps: 5,
				},
			} as FlowNode;
		});

		const edges: FlowEdge[] = nodes.slice(0, -1).map((node, i) => ({
			id: `edge-${i}`,
			source: node.id,
			target: nodes[i + 1].id,
			type: "status",
		}));

		return { nodes, edges };
	};

	it("should return 'bronze' for simple workflows (under 4 nodes)", async () => {
		const workflow = createWorkflow(3);
		const badge = await determineCertificationBadge(workflow);
		expect(badge).toBe("bronze");
	});

	it("should return 'silver' for workflows with 4-7 nodes", async () => {
		const workflow = createWorkflow(5);
		const badge = await determineCertificationBadge(workflow);
		expect(badge).toBe("silver");
	});

	it("should return 'gold' for workflows with 8+ nodes", async () => {
		const workflow = createWorkflow(10);
		const badge = await determineCertificationBadge(workflow);
		expect(badge).toBe("gold");
	});

	it("should work with PerformanceMetrics object", async () => {
		const metrics = {
			nodeCount: 6,
			edgeCount: 5,
			estimatedExecutionTimeMs: 3000,
			memoryEstimateMb: 50,
		};
		const badge = await determineCertificationBadge(metrics);
		expect(badge).toBe("silver");
	});
});

describe("Security Scan", () => {
	const createSafeWorkflow = (): { nodes: FlowNode[]; edges: FlowEdge[] } => ({
		nodes: [
			{
				id: "1",
				type: "start",
				position: { x: 0, y: 0 },
				data: { sourceType: { type: "text" } },
			} as FlowNode,
			{
				id: "2",
				type: "agent",
				position: { x: 100, y: 0 },
				data: {
					name: "Process",
					model: "gpt-4",
					systemPrompt: "Process data",
					status: "idle",
					selectedTools: [],
					sourceType: { type: "text" },
					hideResponseInChat: false,
					excludeFromConversation: false,
					maxSteps: 5,
				},
			} as FlowNode,
			{
				id: "3",
				type: "end",
				position: { x: 200, y: 0 },
				data: {},
			} as FlowNode,
		],
		edges: [
			{ id: "e1", source: "1", target: "2", type: "status" },
			{ id: "e2", source: "2", target: "3", type: "status" },
		],
	});

	it("should scan workflow and return results", () => {
		const workflow = createSafeWorkflow();
		const results = runSecurityScan(workflow);
		expect(results).toBeInstanceOf(Array);
		expect(results.length).toBeGreaterThan(0);
	});

	it("should check for hardcoded secrets", () => {
		const workflow = createSafeWorkflow();
		const results = runSecurityScan(workflow);
		const secretsCheck = results.find((r) => r.check === "No Hardcoded Secrets");
		expect(secretsCheck).toBeDefined();
		expect(secretsCheck?.passed).toBe(true);
	});

	it("should check for input validation", () => {
		const workflow = createSafeWorkflow();
		const results = runSecurityScan(workflow);
		const validationCheck = results.find((r) => r.check === "Input Validation");
		expect(validationCheck).toBeDefined();
	});

	it("should check for error handling", () => {
		const workflow = createSafeWorkflow();
		const results = runSecurityScan(workflow);
		const errorCheck = results.find((r) => r.check === "Error Handling");
		expect(errorCheck).toBeDefined();
	});
});

describe("Performance Metrics", () => {
	const createWorkflow = (nodeCount: number): { nodes: FlowNode[]; edges: FlowEdge[] } => {
		const nodes: FlowNode[] = Array.from({ length: nodeCount }, (_, i) => {
			const position = { x: i * 100, y: 0 };
			if (i === 0) {
				return {
					id: `node-${i}`,
					type: "start",
					position,
					data: { sourceType: { type: "text" } },
				} as FlowNode;
			}
			if (i === nodeCount - 1) {
				return {
					id: `node-${i}`,
					type: "end",
					position,
					data: {},
				} as FlowNode;
			}
			return {
				id: `node-${i}`,
				type: "agent",
				position,
				data: {
					name: `Agent ${i}`,
					model: "gpt-4",
					systemPrompt: "Test prompt",
					status: "idle",
					selectedTools: [],
					sourceType: { type: "text" },
					hideResponseInChat: false,
					excludeFromConversation: false,
					maxSteps: 5,
				},
			} as FlowNode;
		});

		const edges: FlowEdge[] = nodes.slice(0, -1).map((node, i) => ({
			id: `edge-${i}`,
			source: node.id,
			target: nodes[i + 1].id,
			type: "status",
		}));

		return { nodes, edges };
	};

	it("should calculate node count correctly", () => {
		const workflow = createWorkflow(10);
		const metrics = calculatePerformanceMetrics(workflow);
		expect(metrics.nodeCount).toBe(10);
	});

	it("should calculate edge count correctly", () => {
		const workflow = createWorkflow(5);
		const metrics = calculatePerformanceMetrics(workflow);
		expect(metrics.edgeCount).toBe(4);
	});

	it("should estimate execution time based on node count", () => {
		const smallWorkflow = createWorkflow(5);
		const largeWorkflow = createWorkflow(50);

		const smallMetrics = calculatePerformanceMetrics(smallWorkflow);
		const largeMetrics = calculatePerformanceMetrics(largeWorkflow);

		expect(smallMetrics.estimatedExecutionTimeMs).toBeLessThan(largeMetrics.estimatedExecutionTimeMs);
	});

	it("should calculate memory estimate based on workflow complexity", () => {
		const workflow = createWorkflow(20);
		const metrics = calculatePerformanceMetrics(workflow);
		expect(metrics.memoryEstimateMb).toBeGreaterThan(0);
	});
});
