import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import type { NextRequest } from "next/server";
import { executeWorkflow } from "@/lib/workflow/executor";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { WorkflowUIMessage } from "@/types/messages";
import type {
	FlowEdge,
	FlowNode,
} from "@/types/workflow";
import type { AuthSession } from "@/lib/auth-utils";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
	// Verify authentication
	const session = await auth.api.getSession({
		headers: await headers(),
	}) as AuthSession | null;

	if (!session?.user) {
		return new Response(
			JSON.stringify({ error: "Unauthorized" }),
			{ status: 401, headers: { "Content-Type": "application/json" } }
		);
	}

	const {
		messages,
		nodes,
		edges,
	}: { messages: WorkflowUIMessage[]; nodes: FlowNode[]; edges: FlowEdge[] } =
		await req.json();

	const stream = createUIMessageStream<WorkflowUIMessage>({
		execute: ({ writer }) =>
			executeWorkflow({ nodes, edges, messages, writer }),
	});

	return createUIMessageStreamResponse({ stream });
}
