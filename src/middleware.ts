import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected route patterns
const protectedRoutes = [
  "/dashboard",
  "/creator",
  "/admin",
];

// Public routes that should always be accessible
const publicRoutes = [
  "/",
  "/templates",
  "/login",
  "/sign-in",
  "/sign-up",
  "/api/auth",
];

// Routes that require specific roles
const creatorRoutes = ["/creator"];
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a public route
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("better-auth.session") ||
    request.cookies.get("session");

  if (!sessionCookie) {
    // Redirect to login if no session
    const loginUrl = new URL("/sign-in", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For creator routes, we'll check role in the page component
  // This allows for more granular control and custom error messages
  if (creatorRoutes.some((route) => pathname.startsWith(route))) {
    // Let the page handle role checking with requireCreator()
    return NextResponse.next();
  }

  // For admin routes, let the page handle role checking
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
