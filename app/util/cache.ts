/**
 * Short cache with stale-while-revalidate
 * Cloudflare will cache for 1 hour, browsers for 5 minutes
 * Stale content can be served for 1 day while revalidating
 */
export function documentHeaders() {
  return {
    "Cache-Control":
      "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  };
}
