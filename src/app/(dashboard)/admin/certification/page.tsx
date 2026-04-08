"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	getPendingCertifications,
	getCertificationTest,
	runCertificationTests,
	reviewCertification,
	createCertificationTest,
	type TestCase,
} from "@/lib/actions/certification";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	CheckCircle,
	XCircle,
	Play,
	Loader2,
	ExternalLink,
	Shield,
	AlertTriangle,
	Clock,
	Check,
} from "lucide-react";
import { WorkflowPreview } from "@/components/templates/workflow-preview";

interface PendingTemplate {
	template: {
		id: string;
		slug: string;
		title: string;
		description: string;
		category: string;
		complexity: string;
		workflowJson: { nodes: unknown[]; edges: unknown[] };
		createdAt: Date;
	};
	creatorName: string | null;
	creatorEmail: string | null;
}

interface CertificationTest {
	id: string;
	templateId: string;
	testCases: TestCase[];
	testResults: Array<{
		testCaseId: string;
		passed: boolean;
		error?: string;
		durationMs: number;
	}>;
	overallStatus: "pending" | "testing" | "certified" | "rejected";
	securityScanResults: Array<{
		check: string;
		passed: boolean;
		message: string;
	}>;
	performanceMetrics: {
		nodeCount: number;
		edgeCount: number;
		estimatedExecutionTimeMs: number;
		memoryEstimateMb: number;
	};
	reviewNotes: string | null;
}

export default function CertificationQueuePage() {
	const router = useRouter();
	const [templates, setTemplates] = useState<PendingTemplate[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedTemplate, setSelectedTemplate] = useState<PendingTemplate | null>(null);
	const [certTest, setCertTest] = useState<CertificationTest | null>(null);
	const [runningTests, setRunningTests] = useState(false);
	const [reviewNotes, setReviewNotes] = useState("");
	const [showReviewDialog, setShowReviewDialog] = useState(false);
	const [reviewDecision, setReviewDecision] = useState<"approve" | "reject" | null>(null);

	// Test case form state
	const [testCases, setTestCases] = useState<TestCase[]>([]);
	const [newTestName, setNewTestName] = useState("");

	const fetchData = useCallback(async () => {
		try {
			const data = await getPendingCertifications();
			setTemplates(data as PendingTemplate[]);
		} catch {
			toast.error("Failed to load pending certifications");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const loadCertificationTest = useCallback(async (templateId: string) => {
		try {
			const test = await getCertificationTest(templateId);
			if (test) {
				setCertTest(test as CertificationTest);
				setTestCases(test.testCases as TestCase[]);
			} else {
				setCertTest(null);
				setTestCases([]);
			}
		} catch {
			toast.error("Failed to load certification test");
		}
	}, []);

	const handleSelectTemplate = useCallback(
		async (template: PendingTemplate) => {
			setSelectedTemplate(template);
			await loadCertificationTest(template.template.id);
		},
		[loadCertificationTest]
	);

	const handleAddTestCase = useCallback(() => {
		if (!newTestName.trim()) return;

		const newTest: TestCase = {
			id: crypto.randomUUID(),
			name: newTestName,
			input: {},
			expectedOutput: {},
			timeoutMs: 5000,
		};

		setTestCases((prev) => [...prev, newTest]);
		setNewTestName("");
	}, [newTestName]);

	const handleSaveTestCases = useCallback(async () => {
		if (!selectedTemplate) return;

		try {
			await createCertificationTest(selectedTemplate.template.id, testCases);
			toast.success("Test cases saved");
			await loadCertificationTest(selectedTemplate.template.id);
		} catch {
			toast.error("Failed to save test cases");
		}
	}, [selectedTemplate, testCases, loadCertificationTest]);

	const handleRunTests = useCallback(async () => {
		if (!selectedTemplate) return;

		setRunningTests(true);
		try {
			const result = await runCertificationTests(selectedTemplate.template.id);
			toast.success(
				result.overallStatus === "certified"
					? "Template certified!"
					: "Tests completed - review required"
			);
			await loadCertificationTest(selectedTemplate.template.id);
		} catch {
			toast.error("Failed to run tests");
		} finally {
			setRunningTests(false);
		}
	}, [selectedTemplate, loadCertificationTest]);

	const handleReview = useCallback(async () => {
		if (!selectedTemplate || !reviewDecision) return;

		try {
			await reviewCertification(
				selectedTemplate.template.id,
				reviewDecision,
				reviewNotes
			);
			toast.success(
				reviewDecision === "approve" ? "Template approved!" : "Template rejected"
			);
			setShowReviewDialog(false);
			setReviewNotes("");
			setReviewDecision(null);
			setSelectedTemplate(null);
			setCertTest(null);
			await fetchData();
		} catch {
			toast.error("Failed to submit review");
		}
	}, [selectedTemplate, reviewDecision, reviewNotes, fetchData]);

	if (loading) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-7xl">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-3xl font-bold">Certification Queue</h1>
					<p className="text-muted-foreground">
						Review and certify submitted templates
					</p>
				</div>
				<Button variant="outline" asChild>
					<Link href="/admin">Back to Admin</Link>
				</Button>
			</div>

			{templates.length === 0 ? (
				<Card className="text-center py-16">
					<CardHeader>
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<CheckCircle className="h-8 w-8 text-green-600" />
						</div>
						<CardTitle>No Pending Certifications</CardTitle>
						<CardDescription>
							All templates have been reviewed. Check back later for new
							submissions.
						</CardDescription>
					</CardHeader>
				</Card>
			) : !selectedTemplate ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{templates.map((item) => (
						<Card
							key={item.template.id}
							className="cursor-pointer hover:border-primary transition-colors"
							onClick={() => handleSelectTemplate(item)}
						>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div>
										<CardTitle className="text-lg">
											{item.template.title}
										</CardTitle>
										<CardDescription>
											by {item.creatorName}
										</CardDescription>
									</div>
									<Badge variant="secondary">
										{item.template.complexity}
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground line-clamp-2 mb-4">
									{item.template.description}
								</p>
								<div className="flex items-center gap-4 text-sm text-muted-foreground">
									<Clock className="h-4 w-4" />
									<span>
										Submitted{" "}
										{new Date(
											item.template.createdAt
										).toLocaleDateString()}
									</span>
								</div>
							</CardContent>
							<CardFooter>
								<Button variant="outline" className="w-full">
									Review Template
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			) : (
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<Button
							variant="ghost"
							onClick={() => {
								setSelectedTemplate(null);
								setCertTest(null);
							}}
						>
							← Back to Queue
						</Button>
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setReviewDecision("reject");
									setShowReviewDialog(true);
								}}
								disabled={runningTests}
							>
								<XCircle className="h-4 w-4 mr-2" />
								Reject
							</Button>
							<Button
								onClick={() => {
									setReviewDecision("approve");
									setShowReviewDialog(true);
								}}
								disabled={runningTests}
							>
								<CheckCircle className="h-4 w-4 mr-2" />
								Approve
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Template Preview */}
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle>
												{selectedTemplate.template.title}
											</CardTitle>
											<CardDescription>
												by {selectedTemplate.creatorName} (
												{selectedTemplate.creatorEmail})
											</CardDescription>
										</div>
										<Button variant="ghost" size="sm" asChild>
											<Link
												href={`/templates/${selectedTemplate.template.slug}`}
												target="_blank"
											>
												<ExternalLink className="h-4 w-4" />
											</Link>
										</Button>
									</div>
								</CardHeader>
								<CardContent>
									<p className="text-sm mb-4">
										{selectedTemplate.template.description}
									</p>
									<div className="border rounded-lg overflow-hidden">
										<WorkflowPreview
											nodes={
												selectedTemplate.template.workflowJson
													.nodes as []
											}
											edges={
												selectedTemplate.template.workflowJson
													.edges as []
											}
											className="h-[300px] border-0 rounded-none"
										/>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Certification Tests */}
						<div className="space-y-6">
							<Tabs defaultValue="tests">
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="tests">Test Cases</TabsTrigger>
									<TabsTrigger value="results">
										Results
										{certTest && (
											<Badge variant="outline" className="ml-2">
												{certTest.overallStatus}
											</Badge>
										)}
									</TabsTrigger>
								</TabsList>

								<TabsContent value="tests" className="space-y-4">
									<Card>
										<CardHeader>
											<CardTitle>Test Cases</CardTitle>
											<CardDescription>
												Define test cases for automated certification
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4">
											{testCases.length === 0 ? (
												<p className="text-sm text-muted-foreground text-center py-4">
													No test cases defined yet
												</p>
											) : (
												<div className="space-y-2">
													{testCases.map((test, index) => (
														<div
															key={test.id}
															className="flex items-center justify-between p-3 border rounded-lg"
														>
															<span className="font-medium">
																{index + 1}. {test.name}
															</span>
															<Button
																variant="ghost"
																size="sm"
																onClick={() =>
																	setTestCases((prev) =>
																		prev.filter((t) => t.id !== test.id)
																	)
																}
															>
																Remove
															</Button>
														</div>
													))}
												</div>
											)}

											<div className="flex gap-2">
												<Input
													placeholder="Test case name"
													value={newTestName}
													onChange={(e) => setNewTestName(e.target.value)}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															e.preventDefault();
															handleAddTestCase();
														}
													}}
												/>
												<Button
													onClick={handleAddTestCase}
													disabled={!newTestName.trim()}
												>
													Add
												</Button>
											</div>
										</CardContent>
										<CardFooter className="flex gap-2">
											<Button
												onClick={handleSaveTestCases}
												disabled={testCases.length === 0}
												variant="outline"
											>
												Save Tests
											</Button>
											<Button
												onClick={handleRunTests}
												disabled={testCases.length === 0 || runningTests}
											>
												{runningTests ? (
													<>
														<Loader2 className="h-4 w-4 mr-2 animate-spin" />
														Running...
													</>
												) : (
													<>
														<Play className="h-4 w-4 mr-2" />
														Run Tests
													</>
												)}
											</Button>
										</CardFooter>
									</Card>
								</TabsContent>

								<TabsContent value="results" className="space-y-4">
									{!certTest ? (
										<Card className="text-center py-8">
											<p className="text-muted-foreground">
												No test results yet. Run tests to see results.
											</p>
										</Card>
									) : (
										<>
											{/* Test Results */}
											<Card>
												<CardHeader>
													<CardTitle>Test Results</CardTitle>
												</CardHeader>
												<CardContent className="space-y-2">
													{certTest.testResults.map((result, index) => (
														<div
															key={result.testCaseId}
															className="flex items-center gap-3 p-3 border rounded-lg"
														>
															{result.passed ? (
																<Check className="h-5 w-5 text-green-500" />
															) : (
																<XCircle className="h-5 w-5 text-red-500" />
															)}
															<div className="flex-1">
																<p className="font-medium">
																	Test {index + 1}
																</p>
																{result.error && (
																	<p className="text-sm text-red-500">
																		{result.error}
																	</p>
																)}
															</div>
															<span className="text-sm text-muted-foreground">
																{result.durationMs}ms
															</span>
														</div>
													))}
												</CardContent>
											</Card>

											{/* Security Scan */}
											<Card>
												<CardHeader>
													<CardTitle className="flex items-center gap-2">
														<Shield className="h-5 w-5" />
														Security Scan
													</CardTitle>
												</CardHeader>
												<CardContent className="space-y-2">
													{certTest.securityScanResults?.map(
														(check) => (
															<div
																key={check.check}
																className="flex items-center gap-3 p-3 border rounded-lg"
															>
																{check.passed ? (
																	<Check className="h-5 w-5 text-green-500" />
																) : (
																	<AlertTriangle className="h-5 w-5 text-amber-500" />
																)}
																<div>
																	<p className="font-medium">
																		{check.check}
																	</p>
																	<p className="text-sm text-muted-foreground">
																		{check.message}
																	</p>
																</div>
															</div>
														)
													)}
												</CardContent>
											</Card>

											{/* Performance Metrics */}
											<Card>
												<CardHeader>
													<CardTitle>Performance Metrics</CardTitle>
												</CardHeader>
												<CardContent>
													<div className="grid grid-cols-2 gap-4">
														<div>
															<p className="text-sm text-muted-foreground">
																Nodes
															</p>
															<p className="text-2xl font-semibold">
																{certTest.performanceMetrics?.nodeCount}
															</p>
														</div>
														<div>
															<p className="text-sm text-muted-foreground">
																Edges
															</p>
															<p className="text-2xl font-semibold">
																{certTest.performanceMetrics?.edgeCount}
															</p>
														</div>
														<div>
															<p className="text-sm text-muted-foreground">
																Est. Time
															</p>
															<p className="text-2xl font-semibold">
																{certTest.performanceMetrics
																	?.estimatedExecutionTimeMs || 0}
																ms
															</p>
														</div>
														<div>
															<p className="text-sm text-muted-foreground">
																Memory
															</p>
															<p className="text-2xl font-semibold">
																{certTest.performanceMetrics
																	?.memoryEstimateMb || 0}
																MB
															</p>
														</div>
													</div>
												</CardContent>
											</Card>
										</>
									)}
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</div>
			)}

			{/* Review Dialog */}
			<Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{reviewDecision === "approve"
								? "Approve Template"
								: "Reject Template"}
						</DialogTitle>
						<DialogDescription>
							{reviewDecision === "approve"
								? "This will publish the template to the marketplace."
								: "This will reject the template and return it to the creator."}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="notes">Review Notes (optional)</Label>
							<Textarea
								id="notes"
								placeholder="Add any feedback or notes about this review..."
								value={reviewNotes}
								onChange={(e) => setReviewNotes(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowReviewDialog(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleReview}
							variant={reviewDecision === "reject" ? "destructive" : "default"}
						>
							{reviewDecision === "approve" ? "Approve & Publish" : "Reject"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
