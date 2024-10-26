import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define route matchers
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/pricing"]);

export default clerkMiddleware((auth, request) => {
  // If it's not a public route, protect it
  if (!isPublicRoute(request)) {
    // Protect all non-public routes
    auth().protect();
  }
});

// Fixed matcher pattern according to Next.js docs
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/api/:path*",
  ],
};
