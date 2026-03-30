// frontend/src/middleware.js
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

// Cookie key used for access tokens
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

  // 1. Handle i18n routing first to get the response (incl. potentially a redirect to default locale)
  const response = handleI18nRouting(request);

  // 2. Simple helper to check if a path matches our localized route lists
  const isPathInList = (list, path) => {
    // Check both raw path and localized versions (e.g. /login and /en/login)
    return list.some(
      (item) =>
        path === item ||
        routing.locales.some((locale) => path === `/${locale}${item}`)
    );
  };

  const isPrefixInList = (list, path) => {
    return list.some((prefix) => {
      if (path === prefix || path.startsWith(`${prefix}/`)) return true;
      return routing.locales.some(
        (locale) =>
          path === `/${locale}${prefix}` ||
          path.startsWith(`/${locale}${prefix}/`)
      );
    });
  };

  const accessToken = cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value;
  const isAuthenticated = Boolean(accessToken);

  const isAuthRoute = isPathInList(PUBLIC_AUTH_ROUTES, pathname);
  const isProtectedRoute = isPrefixInList(PROTECTED_ROUTE_PREFIXES, pathname);

  // Get early return if we are already redirecting for i18n
  if (response.headers.get("x-next-intl-locale")) {
    // If it's a redirect or locale attachment, we let it through first?
    // Actually, we should check auth even on i18n-redirected paths.
  }

  // 3. Auth Redirection Logic
  if (isProtectedRoute && !isAuthenticated) {
    // Determine the locale for the login redirect
    const locale = pathname.split("/")[1];
    const hasValidLocale = routing.locales.includes(locale);
    const loginPath = hasValidLocale ? `/${locale}/login` : "/login";

    const loginUrl = new URL(loginPath, nextUrl);
    loginUrl.searchParams.set("returnUrl", `${pathname}${nextUrl.search}`);
    return Response.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    const locale = pathname.split("/")[1];
    const hasValidLocale = routing.locales.includes(locale);
    const targetPath = hasValidLocale ? `/${locale}/` : "/";

    const targetUrl = new URL(
      nextUrl.searchParams.get("returnUrl") || targetPath,
      nextUrl
    );
    return Response.redirect(targetUrl);
  }

  // 4. Attach pathname header for downstream usage
  response.headers.set("x-pathname", pathname);

  return response;
}

// Specify which paths this middleware should run on
export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",

    // Set a cookie to remember the last locale for all requests that have a locale prefix
    "/(en|es)/:path*",

    // Auth routes (without locale prefix support if they hit directly)
    "/login",
    "/signup",
    "/verify-email",
    "/forgot-password",
    "/reset-password",

    // Protected routes
    "/dashboard/:path*",
    "/app/:path*",
  ],
};
