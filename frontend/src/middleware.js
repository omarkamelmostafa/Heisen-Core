import { NextResponse } from "next/server";
import {
  isAuthRoute,
  isProtectedRoute,
  isPublicRoute,
} from "./lib/config/route-config";

// Cookie keys
const ACCESS_TOKEN_COOKIE_KEY = "access_token";
const REFRESH_TOKEN_COOKIE_KEY = "refresh_token";

// API URL for server-side refresh
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const REFRESH_ENDPOINT = `${API_URL}/api/v1/auth/refresh`;

export async function middleware(request) {
  const { nextUrl, cookies } = request;
  const pathname = nextUrl.pathname;

  // 1. Check for basic indicator of authentication (access_token)
  let isAuthenticated = cookies.has(ACCESS_TOKEN_COOKIE_KEY);
  let accessToken = cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value;

  // 2. Silent Refresh Logic: Access token missing but refresh token exists
  if (!isAuthenticated && cookies.has(REFRESH_TOKEN_COOKIE_KEY)) {
    try {
      // Attempt to refresh the token server-side
      const response = await fetch(REFRESH_ENDPOINT, {
        method: "POST",
        headers: {
          Cookie: `${REFRESH_TOKEN_COOKIE_KEY}=${cookies.get(REFRESH_TOKEN_COOKIE_KEY).value}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Since we are in middleware, we need to pass the new cookies to the browser
        const nextResponse = NextResponse.next();

        // Map headers from the refresh response back to the middleware response
        // This includes Set-Cookie for access_token and possibly a new refresh_token
        const setCookieHeaders = response.headers.getSetCookie();
        setCookieHeaders.forEach((cookie) => {
          nextResponse.headers.append("Set-Cookie", cookie);
        });

        // If the refresh was successful, the user is now authenticated
        // We might want to redirect back to the same page to ensure the new token is available in headers
        // but for now we just flag as authenticated
        isAuthenticated = true;

        // If it was a protected route, we must return the nextResponse to ensure cookies are set
        if (isProtectedRoute(pathname)) {
          return nextResponse;
        }
      }
    } catch (error) {
      console.error("Silent refresh failed in middleware:", error);
    }
  }

  // 3. Route Guard Logic
  const _isAuthRoute = isAuthRoute(pathname);
  const _isProtectedRoute = isProtectedRoute(pathname);
  const _isPublicRoute = isPublicRoute(pathname);

  // If user is not authenticated and tries to access a protected route,
  // redirect to login with returnUrl
  if (_isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("returnUrl", `${pathname}${nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and hits an auth route, send them away to dashboard
  if (_isAuthRoute && isAuthenticated) {
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
