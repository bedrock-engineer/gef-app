/**
 * Content-Security-Policy for production documents. Every external origin
 * the browser contacts must be listed here; a new API, tile host, or CDN
 * added elsewhere in the app needs a matching entry or the browser blocks
 * the request (check the console for CSP violation reports).
 */
export function contentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    // The nonce covers React Router's inline hydration scripts and the
    // JSON-LD block in root.tsx. 'wasm-unsafe-eval' lets the gef-parser
    // WASM module instantiate.
    `script-src 'self' 'nonce-${nonce}' 'wasm-unsafe-eval' https://counterscale.bedrock-engineer.workers.dev`,
    // 'unsafe-inline' is for style attributes set by Observable Plot,
    // MapLibre, and the Sentry feedback widget.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    // data:/blob: for MapLibre icons and chart exports; Counterscale
    // reports pageviews via an image pixel.
    "img-src 'self' data: blob: https://counterscale.bedrock-engineer.workers.dev",
    [
      "connect-src 'self'",
      "https://api.pdok.nl", // locatieserver geocoding
      "https://service.pdok.nl", // BRT/luchtfoto tiles (MapLibre fetches tiles via fetch)
      "https://tile.openstreetmap.org",
      "https://geo.api.vlaanderen.be", // GRB basemap tiles for Flanders
      "https://counterscale.bedrock-engineer.workers.dev",
      "https://*.sentry.io", // error + feedback ingest
    ].join(" "),
    // 'self' for the PWA service worker, blob: for MapLibre's bundled worker.
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}
