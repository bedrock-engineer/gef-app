import * as Sentry from "@sentry/cloudflare";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import type { EntryContext, HandleErrorFunction } from "react-router";
import { isRouteErrorResponse, ServerRouter } from "react-router";
import { contentSecurityPolicy, sentryReportEndpoint } from "~/util/csp";
import { NonceContext } from "~/util/nonce";

export const handleError: HandleErrorFunction = (error, { request }) => {
  // Aborted requests (e.g. the user navigated away mid-load) are not errors,
  // and route error responses (404s from typos and vulnerability scanners
  // probing /.env and the like) are expected traffic — report neither.
  if (!request.signal.aborted && !isRouteErrorResponse(error)) {
    Sentry.captureException(error);
    console.error(error);
  }
};

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  // _loadContext: AppLoadContext,
) {
  let shellRendered = false;
  const userAgent = request.headers.get("user-agent");
  // Only minted in prod: the nonce exists for the prod-only CSP header below,
  // and without that header browsers keep the nonce attribute in the DOM,
  // where the nonce-less client render reports it as a hydration mismatch
  // (visible in dev on react-router's critical CSS link).
  const nonce = import.meta.env.PROD ? crypto.randomUUID() : undefined;

  const body = await renderToReadableStream(
    <NonceContext.Provider value={nonce}>
      <ServerRouter context={routerContext} url={request.url} nonce={nonce} />
    </NonceContext.Provider>,
    {
      // React stamps this nonce on the inline scripts it injects while
      // streaming suspense boundaries.
      nonce,
      onError(error: unknown) {
        responseStatusCode = 500;
        // Log streaming rendering errors from inside the shell.  Don't log
        // errors encountered during initial shell rendering since they'll
        // reject and get logged in handleDocumentRequest.
        if (shellRendered) {
          Sentry.captureException(error);
          console.error(error);
        }
      },
    },
  );
  shellRendered = true;

  // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
  // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
  if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");
  // Dev is excluded: Vite and react-refresh inject inline scripts without
  // a nonce, so the policy would break the dev server.
  if (nonce) {
    responseHeaders.set(
      "Content-Security-Policy",
      contentSecurityPolicy(nonce),
    );
    // Resolves the policy's report-to directive for browsers that use the
    // Reporting API (Chromium); others fall back to report-uri.
    const reportEndpoint = sentryReportEndpoint();
    if (reportEndpoint) {
      responseHeaders.set(
        "Reporting-Endpoints",
        `csp-endpoint="${reportEndpoint}"`,
      );
    }
  }

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
