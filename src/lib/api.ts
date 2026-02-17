/**
 * basePath (/5mins) ile API isteklerini tam yola çevirir.
 * apiPath("api/teams")  → "/5mins/api/teams"
 * apiPath("/api/teams") → "/5mins/api/teams"
 */
const BASE_PATH = "/5mins";

export function apiPath(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${clean}`;
}
