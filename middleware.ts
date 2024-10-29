import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing",
  "/api/webhooks/stripe",
]);

export default clerkMiddleware((auth, request) => {
  // Allow public routes
  if (isPublicRoute(request)) {
    return;
  }

  // Require authentication for all other routes
  auth().protect();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/api/:path*"],
};
