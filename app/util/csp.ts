/**
 * Content-Security-Policy for production documents. Every external origin
 * the browser contacts must be listed here; a new API, tile host, or CDN
 * added elsewhere in the app needs a matching entry or the browser blocks
 * the request (check the console for CSP violation reports).
 */
/**
 * Sentry's CSP-violation ingest endpoint, derived from the DSN:
 * https://<key>@<host>/<projectId> → https://<host>/api/<projectId>/security/
 * Referenced by both the report-uri/report-to CSP directives and the
 * Reporting-Endpoints response header set in entry.server.
 */
export function sentryReportEndpoint(): string | undefined {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    return undefined;
  }
  const { username, host, pathname } = new URL(dsn);
  return `https://${host}/api/${pathname.slice(1)}/security/?sentry_key=${username}`;
}

export function contentSecurityPolicy(nonce: string): string {
  const reportEndpoint = sentryReportEndpoint();
  // PostHog serves lazy-loaded extension scripts (session replay recorder,
  // surveys, web vitals, ...) from assets subdomains that differ from the
  // ingest host and change over time, so their docs mandate the wildcard
  // over pinning individual subdomains. CSP host wildcards match nested
  // subdomains, so this covers eu.i and eu-assets.i alike.
  const posthog = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN
    ? "https://*.posthog.com"
    : undefined;
  const list = (...sources: Array<string | undefined>) =>
    sources.filter(Boolean).join(" ");
  return [
    "default-src 'self'",
    // The nonce covers React Router's inline hydration scripts and the
    // JSON-LD block in root.tsx. 'wasm-unsafe-eval' lets the gef-parser
    // WASM module instantiate.
    list(
      `script-src 'self' 'nonce-${nonce}' 'wasm-unsafe-eval'`,
      "https://counterscale.bedrock-engineer.workers.dev",
      posthog,
    ),
    // 'unsafe-inline' is for style attributes set by Observable Plot,
    // MapLibre, and the Sentry feedback widget. PostHog styles its
    // surveys and toolbar.
    list(
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      posthog,
    ),
    list("font-src 'self' https://fonts.gstatic.com", posthog),
    // data:/blob: for MapLibre icons and chart exports; Counterscale
    // reports pageviews via an image pixel.
    list(
      "img-src 'self' data: blob: https://counterscale.bedrock-engineer.workers.dev",
      posthog,
    ),
    // Session replay may reference media assets.
    list("media-src 'self'", posthog),
    list(
      "connect-src 'self'",
      "https://api.pdok.nl", // locatieserver geocoding
      "https://service.pdok.nl", // BRT/luchtfoto tiles (MapLibre fetches tiles via fetch)
      "https://tile.openstreetmap.org",
      "https://geo.api.vlaanderen.be", // GRB basemap tiles for Flanders
      "https://counterscale.bedrock-engineer.workers.dev",
      "https://*.sentry.io", // error + feedback ingest
      posthog,
    ),
    // 'self' for the PWA service worker, blob: for MapLibre's bundled
    // worker and PostHog's session replay compression worker.
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // report-uri is deprecated but the only mechanism Firefox and Safari
    // support; Chrome prefers report-to, resolved via Reporting-Endpoints.
    ...(reportEndpoint
      ? [`report-uri ${reportEndpoint}`, "report-to csp-endpoint"]
      : []),
  ].join("; ");
}
