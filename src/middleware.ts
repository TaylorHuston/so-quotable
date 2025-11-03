import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/profile", "/create-quote"];

  // Public routes that should redirect to dashboard if already authenticated
  const authRoutes = ["/login", "/register"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if user is authenticated by looking for the Convex auth token
  // Convex stores the token in a cookie named `convex-token`
  const authToken = request.cookies.get("convex-token");
  const isAuthenticated = !!authToken;

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    const redirectParam = request.nextUrl.searchParams.get("redirect");

    // Validate redirect parameter to prevent open redirect vulnerability
    // Only allow relative paths starting with / (no external URLs)
    let redirectPath = "/dashboard";
    if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
      // Additional validation: ensure it's a valid internal path
      try {
        const url = new URL(redirectParam, request.url);
        if (url.origin === request.nextUrl.origin) {
          redirectPath = redirectParam;
        }
      } catch {
        // Invalid URL, use default
      }
    }

    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};
