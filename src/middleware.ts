import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROOT_HTML } from "@/lib/landing-html";

const BASE_PATH = "/5mins";

export function middleware(request: NextRequest) {
  // Gerçek istek yolu (basePath normalize edilmeden) — landing sadece tam kök / için
  const requestPath = new URL(request.url).pathname;
  const { pathname } = request.nextUrl;

  // murat.org ana sayfa: sadece tam kök path (murat.org/), /5mins değil
  if (requestPath === "/" || requestPath === "") {
    return new NextResponse(ROOT_HTML, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // /5mins altı: pathname basePath ile / veya /login vs. olabilir; pathname ile devam et
  const path = pathname.startsWith(BASE_PATH)
    ? pathname.slice(BASE_PATH.length) || "/"
    : pathname;

  // Allow login page and auth API
  if (path.startsWith("/login") || path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check auth cookie
  const authCookie = request.cookies.get("checkin_auth");
  if (!authCookie || authCookie.value !== "authenticated") {
    // Redirect to login for page requests (with basePath)
    if (!path.startsWith("/api/")) {
      const url = new URL(request.url);
      return NextResponse.redirect(new URL(`${BASE_PATH}/login`, url.origin));
    }
    // Return 401 for API requests
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
