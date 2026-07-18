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

  // In production (https), Better Auth prefixes cookies with __Secure-
  // In development (http), no prefix is added
  const sessionCookie =
    request.cookies.get("__Secure-better-auth.session_token") || // production (https)
    request.cookies.get("better-auth.session_token") ||           // development (http)
    request.cookies.get("__Secure-better-auth-session_token") ||
    request.cookies.get("better-auth-session_token");

  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
