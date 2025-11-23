import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// Define auth pages (always allow access to avoid race conditions)
const isAuthPage = createRouteMatcher(["/", "/login", "/register"]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/profile(.*)", "/create-quote(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // IMPORTANT: Always allow access to auth pages to avoid race conditions
  // after signup/login. The auth pages handle their own client-side redirects.
  // See: Convex Auth docs - known race condition when redirecting immediately after auth
  if (isAuthPage(request)) {
    return undefined;
  }

  // For protected routes, redirect to login if not authenticated
  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/login");
  }

  // All other routes allowed
  return undefined;
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
