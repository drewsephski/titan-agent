# Workflow Builder Integration Guide

## Overview

You now have the simple-ai workflow builder at `/workflow`. Here's how to integrate it into your marketplace.

## Current State

The workflow builder at `src/app/workflow/page.tsx` is a **standalone full-screen builder** that includes:
- Visual drag-and-drop workflow editor (React Flow)
- Chat interface for testing workflows
- Template selector (code-analysis, wikipedia-research, customer-support, wait-demo)
- Node editor panel for configuring agents
- Real-time workflow execution

## Integration Strategy

### 1. Creator Submission Flow (Primary Use)

**User Journey:**
```
Creator Dashboard → Click "Build Workflow" → /workflow/build → Save → Submit to Marketplace
```

**Implementation:**

Create a new route `src/app/(dashboard)/creator/build/page.tsx` that wraps the workflow builder with additional marketplace-specific UI:

```tsx
// src/app/(dashboard)/creator/build/page.tsx
"use client";

import { Flow } from "@/app/workflow/page"; // Reuse the Flow component
import { ReactFlowProvider } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useWorkflow } from "@/hooks/workflow/use-workflow";

export default function BuildWorkflowPage() {
  const [workflowName, setWorkflowName] = useState("");
  
  // Add save/submit functionality
  const handleSaveToMarketplace = async () => {
    // 1. Get current workflow state
    // 2. Upload to your templates table
    // 3. Redirect to submission form
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header with marketplace actions */}
      <div className="border-b p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Build Workflow</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button onClick={handleSaveToMarketplace}>
            Submit to Marketplace
          </Button>
        </div>
      </div>
      
      {/* Workflow builder */}
      <div className="flex-1">
        <ReactFlowProvider>
          <Flow />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
```

### 2. Template Preview (Read-Only)

**User Journey:**
```
Browse Templates → Click Template → Preview workflow visually before buying
```

**Implementation:**

Create `src/components/templates/workflow-preview.tsx`:

```tsx
// Read-only workflow preview for marketplace
"use client";

import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getAllNodeDefinitions } from "@/lib/workflow/nodes";
import type { FlowNode, FlowEdge } from "@/types/workflow";

const nodeDefinitions = getAllNodeDefinitions();
const nodeTypes = {};
for (const definition of nodeDefinitions) {
  nodeTypes[definition.shared.type] = definition.client.component;
}

interface WorkflowPreviewProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export function WorkflowPreview({ nodes, edges }: WorkflowPreviewProps) {
  return (
    <div className="h-[400px] border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false} // Read-only
        nodesConnectable={false}
        elementsSelectable={true} // Allow selection to see details
      >
        <Background />
        <Controls showInteractive={false} />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
```

Use this on the template detail page:

```tsx
// src/app/(marketing)/templates/[slug]/page.tsx
import { WorkflowPreview } from "@/components/templates/workflow-preview";
import { db } from "@/lib/db";

export default async function TemplatePage({ params }: { params: { slug: string } }) {
  const template = await db.query.templates.findFirst({
    where: (t, { eq }) => eq(t.slug, params.slug),
  });
  
  return (
    <div>
      <h1>{template.title}</h1>
      <WorkflowPreview 
        nodes={template.workflowJson.nodes} 
        edges={template.workflowJson.edges} 
      />
    </div>
  );
}
```

### 3. Workflow JSON Structure

The workflow builder stores workflows as JSON. Your `templates.workflowJson` column should store:

```typescript
interface WorkflowJson {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// Example from the builder:
{
  "nodes": [
    {
      "id": "start-1",
      "type": "start",
      "position": { "x": 100, "y": 100 },
      "data": { ... }
    },
    {
      "id": "agent-1", 
      "type": "agent",
      "position": { "x": 300, "y": 100 },
      "data": {
        "model": "gpt-4",
        "systemPrompt": "You are a helpful assistant...",
        "tools": [...]
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "start-1",
      "target": "agent-1"
    }
  ]
}
```

### 4. Key Files from simple-ai

These are now in your project and you can import from them:

| File | Purpose |
|------|---------|
| `src/lib/workflow/nodes/` | All node definitions (agent, if-else, start, end, etc.) |
| `src/lib/workflow/executor.ts` | Executes workflows server-side |
| `src/lib/workflow/validation.ts` | Validates workflow structure |
| `src/lib/templates/index.ts` | Pre-built templates |
| `src/hooks/workflow/use-workflow.ts` | React hook for workflow state |
| `src/types/workflow.ts` | TypeScript types |

### 5. Export/Import Workflows

Add a utility to export workflows from the builder:

```tsx
// src/lib/workflow/export.ts
import type { FlowNode, FlowEdge } from "@/types/workflow";

export function exportWorkflow(nodes: FlowNode[], edges: FlowEdge[]) {
  return JSON.stringify({ nodes, edges }, null, 2);
}

export function importWorkflow(json: string): { nodes: FlowNode[]; edges: FlowEdge[] } {
  return JSON.parse(json);
}
```

### 6. Database Integration

Update your seed script to use real workflow JSON from the templates:

```typescript
// In src/lib/db/seed.ts
import { DEFAULT_TEMPLATE } from "@/lib/templates";

const sampleTemplates = [
  {
    title: "Customer Support Triage",
    slug: "customer-support-triage",
    workflowJson: DEFAULT_TEMPLATE, // Use the actual workflow JSON
    category: "support",
    price: 2900, // $29
    // ...
  }
];
```

## Next Steps

1. **Task 3: Authentication** — The workflow builder needs auth to save/submit
   - Protect `/workflow` or move to `/creator/build`
   - Add user identification to workflow submissions

2. **Task 4: Template Browsing** — Use the preview component
   - Build template cards
   - Add preview modal with read-only workflow view

3. **Task 5: Submission System** — Connect builder to marketplace
   - Add "Submit" button to builder
   - Extract workflow JSON and save to database
   - Redirect to metadata form (title, description, pricing)

## Important Notes

- **The workflow builder needs `OPENAI_API_KEY`** — Add it to `.env.local` for testing
- **The builder is full-screen** — Consider how it fits in your layout (iframe or full page)
- **Workflow execution happens at `/api/workflow`** — This is already set up
- **Templates are stored in `src/lib/templates/`** — You can add marketplace templates here

## Testing

1. Visit `/workflow` — Builder should load
2. Select a template from dropdown — Workflow should populate
3. Test execution — Chat should work (needs OpenAI key)
4. Check nodes — All 6 node types should be available in sidebar
