import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy to handle Shopify account URL patterns.
 *
 * Shopify's password reset / activate emails send links in the format:
 *   /account/reset/[customerId]/[token]
 *   /account/activate/[customerId]/[token]
 *
 * These match our Next.js routes exactly, so they should work automatically
 * when the email template is updated to point to the headless domain.
 *
 * This proxy also protects the /account route so unauthenticated users
 * are redirected to /login.
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow reset and activate routes to pass through without auth check
    if (
        pathname.startsWith("/account/reset") ||
        pathname.startsWith("/account/activate")
    ) {
        return NextResponse.next();
    }

    // Protect /account routes - redirect to home if no token
    // (Customer auth is handled by GoKwik; /login is disabled)
    if (pathname.startsWith("/account")) {
        const token = request.cookies.get("customerAccessToken");
        if (!token) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/account/:path*"],
};
