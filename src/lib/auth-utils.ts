// Client-safe auth utilities - no server-only imports
export type UserRole = "buyer" | "creator" | "admin";

// Type for Better-auth session with our custom role field
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  role?: UserRole | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
  stripeCustomerId?: string | null;
  stripeConnectId?: string | null;
};

export type AuthSession = {
  user: AuthUser;
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
};

export function hasRole(
  userOrSession: { role?: string | null } | { user?: { role?: string | null } } | null,
  role: UserRole | UserRole[]
) {
  if (!userOrSession) return false;
  
  // Extract role from either direct user object or session-like object
  const userRole = 'user' in userOrSession && userOrSession.user
    ? userOrSession.user.role 
    : 'role' in userOrSession 
      ? userOrSession.role 
      : null;
  
  if (!userRole) return false;
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(userRole as UserRole);
}

export function isAdmin(userOrSession: { role?: string | null } | { user?: { role?: string | null } } | null) {
  if (!userOrSession) return false;
  const userRole = 'user' in userOrSession && userOrSession.user
    ? userOrSession.user.role 
    : 'role' in userOrSession 
      ? userOrSession.role 
      : null;
  return userRole === "admin";
}

export function isCreator(userOrSession: { role?: string | null } | { user?: { role?: string | null } } | null) {
  if (!userOrSession) return false;
  const userRole = 'user' in userOrSession && userOrSession.user
    ? userOrSession.user.role 
    : 'role' in userOrSession 
      ? userOrSession.role 
      : null;
  return userRole === "creator" || userRole === "admin";
}

export function isBuyer(userOrSession: { role?: string | null } | { user?: { role?: string | null } } | null) {
  if (!userOrSession) return false;
  const userRole = 'user' in userOrSession && userOrSession.user
    ? userOrSession.user.role 
    : 'role' in userOrSession 
      ? userOrSession.role 
      : null;
  return userRole === "buyer" || userRole === "creator" || userRole === "admin";
}