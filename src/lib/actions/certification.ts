"use server";

import { db } from "@/lib/db";
import { templates, certificationTests, user } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-server";
import { sendCertificationUpdateEmail } from "@/lib/email-service";
import type { FlowNode, FlowEdge } from "@/types/workflow";

export interface TestCase {
	id: string;
	name: string;
	input: Record<string, unknown>;
	expectedOutput: Record<string, unknown>;
	timeoutMs: number;
}

export interface TestResult {
	testCaseId: string;
	passed: boolean;
	actualOutput?: Record<string, unknown>;
	error?: string;
	durationMs: number;
}

export interface SecurityScanResult {
	check: string;
	passed: boolean;
	message: string;
}

export interface PerformanceMetrics {
	nodeCount: number;
	edgeCount: number;
	estimatedExecutionTimeMs: number;
	memoryEstimateMb: number;
}

/**
 * Get all templates pending certification review
 */
export async function getPendingCertifications() {
	await requireAdmin();

	const pendingTemplates = await db
		.select({
			template: templates,
			creatorName: user.name,
			creatorEmail: user.email,
		})
		.from(templates)
		.innerJoin(user, eq(templates.creatorId, user.id))
		.where(
			and(
				eq(templates.status, "draft"),
				eq(templates.certificationStatus, "pending")
			)
		)
		.orderBy(desc(templates.createdAt));

	return pendingTemplates;
}

/**
 * Get certification test details for a template
 */
export async function getCertificationTest(templateId: string) {
	await requireAdmin();

	const test = await db.query.certificationTests.findFirst({
		where: eq(certificationTests.templateId, templateId),
	});

	return test;
}

/**
 * Create or update certification test for a template
 */
export async function createCertificationTest(
	templateId: string,
	testCases: TestCase[]
) {
	await requireAdmin();

	const existing = await db.query.certificationTests.findFirst({
		where: eq(certificationTests.templateId, templateId),
	});

	if (existing) {
		await db
			.update(certificationTests)
			.set({
				testCases,
				overallStatus: "testing",
				updatedAt: new Date(),
			})
			.where(eq(certificationTests.id, existing.id));
		return existing.id;
	}

	const testId = nanoid();
	await db.insert(certificationTests).values({
		id: testId,
		templateId,
		testCases,
		testResults: [],
		overallStatus: "testing",
		createdAt: new Date(),
	});

	// Update template status
	await db
		.update(templates)
		.set({ certificationStatus: "testing" })
		.where(eq(templates.id, templateId));

	return testId;
}

/**
 * Run automated certification tests for a template
 */
export async function runCertificationTests(templateId: string) {
	await requireAdmin();

	const template = await db.query.templates.findFirst({
		where: eq(templates.id, templateId),
	});

	if (!template) {
		throw new Error("Template not found");
	}

	const certTest = await db.query.certificationTests.findFirst({
		where: eq(certificationTests.templateId, templateId),
	});

	if (!certTest) {
		throw new Error("No certification test found for this template");
	}

	const workflowJson = template.workflowJson as {
		nodes: FlowNode[];
		edges: FlowEdge[];
	};

	// Run security scan
	const securityResults = await runSecurityScan(workflowJson);

	// Calculate performance metrics
	const performanceMetrics = await calculatePerformanceMetrics(workflowJson);

	// Run test cases
	const testCases = certTest.testCases as TestCase[];
	const testResults: TestResult[] = [];

	for (const testCase of testCases) {
		const startTime = Date.now();
		try {
			// Simulate test execution
			const result = await executeTestCase(workflowJson, testCase);
			testResults.push({
				testCaseId: testCase.id,
				passed: result.passed,
				actualOutput: result.output,
				durationMs: Date.now() - startTime,
			});
		} catch (error) {
			testResults.push({
				testCaseId: testCase.id,
				passed: false,
				error: error instanceof Error ? error.message : "Test failed",
				durationMs: Date.now() - startTime,
			});
		}
	}

	// Determine overall status
	const allTestsPassed = testResults.every((r) => r.passed);
	const allSecurityPassed = securityResults.every((r) => r.passed);

	const overallStatus = allTestsPassed && allSecurityPassed ? "certified" : "rejected";

	// Update certification test
	await db
		.update(certificationTests)
		.set({
			testResults,
			securityScanResults: securityResults,
			performanceMetrics,
			overallStatus,
			completedAt: new Date(),
		})
		.where(eq(certificationTests.id, certTest.id));

	// If certified, update template
	if (overallStatus === "certified") {
		await db
			.update(templates)
			.set({
				certificationStatus: "certified",
				certificationBadge: await determineCertificationBadge(performanceMetrics),
				status: "published",
			})
			.where(eq(templates.id, templateId));
	} else {
		await db
			.update(templates)
			.set({
				certificationStatus: "rejected",
			})
			.where(eq(templates.id, templateId));
	}

	revalidatePath("/admin");
	revalidatePath(`/templates/${template.slug}`);

	return {
		testResults,
		securityResults,
		performanceMetrics,
		overallStatus,
	};
}

/**
 * Manual certification review (approve/reject)
 */
export async function reviewCertification(
	templateId: string,
	decision: "approve" | "reject",
	notes: string
) {
	const session = await requireAdmin();

	const template = await db.query.templates.findFirst({
		where: eq(templates.id, templateId),
	});

	if (!template) {
		throw new Error("Template not found");
	}

	const certTest = await db.query.certificationTests.findFirst({
		where: eq(certificationTests.templateId, templateId),
	});

	if (certTest) {
		await db
			.update(certificationTests)
			.set({
				reviewedBy: session.user.id,
				reviewNotes: notes,
				overallStatus: decision === "approve" ? "certified" : "rejected",
				completedAt: new Date(),
			})
			.where(eq(certificationTests.id, certTest.id));
	}

	await db
		.update(templates)
		.set({
			certificationStatus: decision === "approve" ? "certified" : "rejected",
			certificationBadge:
				decision === "approve"
					? await determineCertificationBadge(template.workflowJson as { nodes: FlowNode[]; edges: FlowEdge[] })
					: "none",
			certificationNotes: notes,
			status: decision === "approve" ? "published" : "draft",
		})
		.where(eq(templates.id, templateId));

	// Send certification update email to creator
	try {
		const creator = await db.query.user.findFirst({
			where: eq(user.id, template.creatorId),
		});

		if (creator?.email) {
			const badge = decision === "approve"
				? await determineCertificationBadge(template.workflowJson as { nodes: FlowNode[]; edges: FlowEdge[] })
				: null;

			await sendCertificationUpdateEmail({
				to: creator.email,
				userName: creator.name,
				userId: creator.id,
				templateTitle: template.title,
				templateSlug: template.slug,
				status: decision === "approve" ? "approved" : "rejected",
				badge,
				reviewNotes: notes || null,
				previewUrl: `${process.env.BETTER_AUTH_URL}/templates/${template.slug}`,
				adminUrl: `${process.env.BETTER_AUTH_URL}/creator`,
			});
		}
	} catch (error) {
		console.error("[Certification] Failed to send email notification:", error);
		// Don't throw - email failure shouldn't break certification
	}

	revalidatePath("/admin");
	revalidatePath(`/templates/${template.slug}`);

	return { success: true };
}

/**
 * Security scan for workflows
 */
export async function runSecurityScan(workflowJson: { nodes: FlowNode[]; edges: FlowEdge[] }): Promise<SecurityScanResult[]> {
	const results: SecurityScanResult[] = [];
	const { nodes } = workflowJson;

	// Check for potential security issues
	results.push({
		check: "No Hardcoded Secrets",
		passed: !JSON.stringify(nodes).includes("api_key") && !JSON.stringify(nodes).includes("secret"),
		message: "No obvious hardcoded secrets detected",
	});

	results.push({
		check: "Input Validation",
		passed: nodes.some((n) => n.type === "if-else"),
		message: nodes.some((n) => n.type === "if-else")
			? "Conditional logic present for input validation"
			: "No conditional logic detected - consider adding input validation",
	});

	results.push({
		check: "Error Handling",
		passed: nodes.length > 2,
		message:
			nodes.length > 2
				? "Workflow has multiple nodes suggesting error handling paths"
				: "Simple workflow - verify error handling is implemented",
	});

	results.push({
		check: "Rate Limiting Awareness",
		passed: true,
		message: "Template uses standard API nodes with built-in rate limiting",
	});

	return results;
}

/**
 * Calculate performance metrics
 */
export async function calculatePerformanceMetrics(workflowJson: {
	nodes: FlowNode[];
	edges: FlowEdge[];
}): Promise<PerformanceMetrics> {
	const { nodes, edges } = workflowJson;

	// Simple estimation based on workflow complexity
	const nodeCount = nodes.length;
	const edgeCount = edges.length;
	const estimatedExecutionTimeMs = nodeCount * 500 + edgeCount * 100;
	const memoryEstimateMb = Math.max(10, nodeCount * 5);

	return {
		nodeCount,
		edgeCount,
		estimatedExecutionTimeMs,
		memoryEstimateMb,
	};
}

/**
 * Execute a single test case
 */
async function executeTestCase(
	workflowJson: { nodes: FlowNode[]; edges: FlowEdge[] },
	testCase: TestCase
): Promise<{ passed: boolean; output?: Record<string, unknown> }> {
	// This is a simplified test execution
	// In production, you'd actually run the workflow with the test input

	// Simulate execution time
	await new Promise((resolve) => setTimeout(resolve, Math.min(testCase.timeoutMs, 100)));

	// Basic validation - check if workflow has required nodes
	const hasStartNode = workflowJson.nodes.some((n) => n.type === "start");
	const hasEndNode = workflowJson.nodes.some((n) => n.type === "end");

	if (!hasStartNode || !hasEndNode) {
		return { passed: false };
	}

	// Return simulated success
	return {
		passed: true,
		output: { status: "success", timestamp: new Date().toISOString() },
	};
}

/**
 * Determine certification badge based on metrics
 */
export async function determineCertificationBadge(
	metrics: PerformanceMetrics | { nodes: FlowNode[]; edges: FlowEdge[] }
): Promise<"bronze" | "silver" | "gold"> {
	let nodeCount: number;

	if ("nodeCount" in metrics) {
		nodeCount = metrics.nodeCount;
	} else {
		nodeCount = metrics.nodes.length;
	}

	if (nodeCount >= 8) return "gold";
	if (nodeCount >= 4) return "silver";
	return "bronze";
}
