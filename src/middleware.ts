import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ROOT_HTML } from "@/lib/landing-html";

const BASE_PATH = "/5mins";

export async function middleware(request: NextRequest) {
  const requestPath = new URL(request.url).pathname;
  const { pathname } = request.nextUrl;

  if (requestPath === "/" || requestPath === "") {
    return new NextResponse(ROOT_HTML, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const path = pathname.startsWith(BASE_PATH)
    ? pathname.slice(BASE_PATH.length) || "/"
    : pathname;

  if (path.startsWith("/login") || path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Create Supabase client that can read/write cookies on this response
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (!path.startsWith("/api/")) {
      const url = new URL(request.url);
      return NextResponse.redirect(new URL(`${BASE_PATH}/login`, url.origin));
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/",
  ],
};
