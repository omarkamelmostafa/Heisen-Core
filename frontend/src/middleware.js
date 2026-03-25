// frontend/src/middleware.js
import { NextResponse } from "next/server";

const REFRESH_TOKEN_COOKIE_KEY = "refresh_token";

const PUBLIC_ONLY_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email"
];

const PROTECTED_ROUTES = [
  "/"
];

export async function middleware(request) {
  const { nextUrl, cookies } = request;
  const pathname = nextUrl.pathname;
  
  const hasRefreshCookie = cookies.has(REFRESH_TOKEN_COOKIE_KEY);
  
  const isProtected = PROTECTED_ROUTES.some(route => 
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  );
  const isPublicOnly = PUBLIC_ONLY_ROUTES.some(route => pathname.startsWith(route));

  if (isProtected && !hasRefreshCookie) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("returnTo", `${pathname}${nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicOnly && hasRefreshCookie) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)"
  ],
};
