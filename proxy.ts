import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Optimistic check: verify session cookie exists without hitting the DB
  // (Next.js 16 docs recommend avoiding DB calls in proxy)
  // Full session validation happens in each page/route handler
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("better-auth-session_token");

  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
