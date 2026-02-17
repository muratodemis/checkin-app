import { ROOT_HTML } from "@/lib/landing-html";

export function GET() {
  return new Response(ROOT_HTML, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
