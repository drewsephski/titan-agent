"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthSession, UserRole } from "@/lib/auth-utils";

export type { UserRole, AuthSession } from "@/lib/auth-utils";

export const getSession = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    return session as AuthSession | null;
}

export const getUser = async () => {
    const session = await getSession();
    return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(role: UserRole | UserRole[]) {
  const session = await requireAuth();
  const roles = Array.isArray(role) ? role : [role];
  const userRole = (session.user.role as UserRole) || "buyer";

  if (!roles.includes(userRole)) {
    redirect("/dashboard");
  }

  return session;
}

export async function requireAdmin() {
  return requireRole("admin");
}

export async function requireCreator() {
  return requireRole(["creator", "admin"]);
}
