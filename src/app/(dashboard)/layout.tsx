"use client"

import ThemeToggler from "@/components/theme/toggler";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/user-profile";
import { siteConfig } from "@/config/site.config";
import { 
  Layout, 
  Settings, 
  User, 
  Workflow, 
  Upload,
  Shield,
  Home,
  Play,
  Save
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { hasRole, type AuthSession } from "@/lib/auth-utils";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-screen flex flex-col">
      <MockNavbar />
      <div className="flex flex-1 overflow-hidden">
        <MockSidebar />
        <div id="main" className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

const MockNavbar = () => {
  return (
    <div id="nav" className="border-b border-dashed flex items-center justify-between">
      <div id="brand" className="h-full md:border-r border-dashed w-[180px] flex items-center justify-center bg-black">
        <Button variant="ghost" className="w-full h-full font-heading text-lg md:text-2xl font-bold gap-3 text-white hover:text-white hover:bg-black" asChild>
          <Link href="/">
            <Image src="/goku.svg" alt="Logo" width={40} height={40} className="w-10 h-10" />
            <span>{siteConfig.name}</span>
          </Link>
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-end h-full border-dashed divide-x">
        <ThemeToggler className="h-full border-dashed size-10 md:size-14" />
        <UserProfile className="size-10 md:size-14" />
      </div>
    </div>
  )
}

interface SavedWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: unknown[];
  edges: unknown[];
  createdAt: string;
}

const MockSidebar = () => {
  const { data: session } = useSession();
  const typedSession = session as AuthSession | null;
  const isCreator = hasRole(typedSession, ["creator", "admin"]);
  const isAdmin = hasRole(typedSession, "admin");
  const pathname = usePathname();
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
  const isPlayground = pathname === "/playground";

  useEffect(() => {
    const syncWorkflows = () => {
      const saved = localStorage.getItem("savedWorkflows");
      if (saved && isPlayground) {
        queueMicrotask(() => setSavedWorkflows(JSON.parse(saved)));
      } else {
        queueMicrotask(() => setSavedWorkflows([]));
      }
    };

    syncWorkflows();

    window.addEventListener("savedWorkflowsUpdated", syncWorkflows);
    return () => window.removeEventListener("savedWorkflowsUpdated", syncWorkflows);
  }, [isPlayground]);

  return (
    <div id="sidebar" className="w-[180px] border-r border-dashed hidden md:block overflow-y-auto">
      <div className="flex flex-col divide-y border-b border-dashed">
        {/* Main Navigation */}
        <div className="py-2">
          <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Main
          </p>
          <Button variant="ghost" className="border-dashed h-12 text-left justify-start pl-8 w-full rounded-none" asChild>
            <Link href="/dashboard">
              <Layout className="w-4 h-4 mr-3" />
              <span>Dashboard</span>
            </Link>
          </Button>
          <Button variant="ghost" className="border-dashed h-12 text-left justify-start pl-8 w-full rounded-none" asChild>
            <Link href="/playground">
              <Play className="w-4 h-4 mr-3" />
              <span>Playground</span>
            </Link>
          </Button>
          <Button variant="ghost" className="border-dashed h-12 text-left justify-start pl-8 w-full rounded-none" asChild>
            <Link href="/dashboard/profile">
              <User className="w-4 h-4 mr-3" />
              <span>Profile</span>
            </Link>
          </Button>
        </div>

        {/* Creator Section - Only for creators/admins */}
        {isCreator && (
          <div className="py-2">
            <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Creator
            </p>
            <Button variant="ghost" className="border-dashed h-12 text-left justify-start pl-8 w-full rounded-none" asChild>
              <Link href="/creator">
                <Home className="w-4 h-4 mr-3" />
                <span>Creator Dashboard</span>
              </Link>
            </Button>
            <Button variant="ghost" className="border-dashed h-12 text-left justify-start pl-8 w-full rounded-none" asChild>
              <Link href="/creator/build">
                <Workflow className="w-4 h-4 mr-3" />
                <span>Build Workflow</span>
              </Link>
            </Button>
            <Button variant="ghost" className="border-dashed h-12 text-left justify-start pl-8 w-full rounded-none" asChild>
              <Link href="/creator/submit">
                <Upload className="w-4 h-4 mr-3" />
                <span>Submit Template</span>
              </Link>
            </Button>
          </div>
        )}

        {/* Admin Section - Only for admins */}
        {isAdmin && (
          <div className="py-2">
            <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Admin
            </p>
            <Button variant="ghost" className="border-dashed h-12 text-left justify-start pl-8 w-full rounded-none" asChild>
              <Link href="/admin">
                <Shield className="w-4 h-4 mr-3" />
                <span>Admin Dashboard</span>
              </Link>
            </Button>
          </div>
        )}

        {/* Saved Workflows - Only on Playground */}
        {isPlayground && savedWorkflows.length > 0 && (
          <div className="py-2">
            <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Saved Workflows
            </p>
            <div className="px-2 space-y-1">
              {savedWorkflows.map((workflow) => (
                <Button
                  key={workflow.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-2 rounded-none"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("loadWorkflow", { detail: workflow }));
                  }}
                >
                  <Save className="w-4 h-4 mr-3 flex-shrink-0" />
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-sm truncate">{workflow.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="py-2">
          <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Settings
          </p>
          <Button variant="ghost" className="border-dashed h-12 text-left justify-start pl-8 w-full rounded-none opacity-50" disabled>
            <Settings className="w-4 h-4 mr-3" />
            <span>Settings</span>
          </Button>
        </div>
      </div>
    </div>
  )
}