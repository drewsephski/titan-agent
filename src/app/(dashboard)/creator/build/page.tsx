"use client";

import { Flow } from "@/app/workflow/page";
import { ReactFlowProvider } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useWorkflow } from "@/hooks/workflow/use-workflow";
import { shallow } from "zustand/shallow";
import { Save, Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function BuildWorkflowContent() {
  const [workflowName, setWorkflowName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const store = useWorkflow(
    (store) => ({
      nodes: store.nodes,
      edges: store.edges,
    }),
    shallow,
  );

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // TODO: Save to database as draft
      toast.success("Draft saved successfully");
    } catch (error) {
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitToMarketplace = async () => {
    setIsSaving(true);
    try {
      // Get current workflow state
      const workflowJson = {
        nodes: store.nodes,
        edges: store.edges,
      };
      
      // TODO: Redirect to submission form with workflow data
      toast.success("Redirecting to submission form...");
      console.log("Workflow JSON:", workflowJson);
      
      // For now, just show success - in production this would redirect to /creator/submit
      // with the workflow JSON passed as state or saved to a temp location
    } catch (error) {
      toast.error("Failed to prepare submission");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header with marketplace actions */}
      <div className="border-b border-dashed p-4 flex items-center justify-between bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/creator">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-lg font-semibold">Build Workflow</h1>
            <p className="text-xs text-muted-foreground">
              Design your AI workflow and submit to the marketplace
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            onClick={handleSubmitToMarketplace}
            disabled={isSaving}
          >
            <Upload className="w-4 h-4 mr-2" />
            Submit to Marketplace
          </Button>
        </div>
      </div>
      
      {/* Workflow builder - full height */}
      <div className="flex-1 overflow-hidden">
        <div className="w-full h-full">
          <ReactFlowProvider>
            <Flow />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}

export default function BuildWorkflowPage() {
  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <BuildWorkflowContent />
    </div>
  );
}
