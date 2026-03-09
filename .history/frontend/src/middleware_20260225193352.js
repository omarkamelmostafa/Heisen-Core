// frontend/src/middleware.js
import { NextResponse } from "next/server";

// Cookie key used by cookie-service for access tokens (indicator)
const ACCESS_TOKEN_COOKIE_KEY = "access_token";

// Routes that should be accessible without authentication
const PUBLIC_AUTH_ROUTES = [
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

// Prefixes for routes that require authentication
const PROTECTED_ROUTE_PREFIXES = ["/dashboard", "/app"];

export function middleware(request) {
  const { nextUrl, cookies } = request;
  const pathname = nextUrl.pathname;

  // We can also check for session cookie as an indicator
  const isAuthenticated = cookies.has(ACCESS_TOKEN_COOKIE_KEY);

  const isAuthRoute = PUBLIC_AUTH_ROUTES.includes(pathname);
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // If user is not authenticated and tries to access a protected route,
  // redirect to login with returnUrl
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("returnUrl", `${pathname}${nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and hits an auth route, send them away to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Root redirect: if authenticated -> dashboard, if not -> login
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    } else {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  // Attach pathname header for downstream usage (e.g. layout content)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Specify which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - root images/svgs
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)",
  ],
};
