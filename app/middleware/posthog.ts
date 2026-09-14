import { PostHog } from "posthog-node";
import type { RouterContextProvider } from "react-router";
import type { Route } from "../+types/root";

export interface PostHogContext extends RouterContextProvider {
  posthog?: PostHog;
}

export const posthogMiddleware: Route.MiddlewareFunction = async (
  { request, context },
  next,
) => {
  const token = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

  if (!token || !host) {
    if (import.meta.env.DEV) {
      const missingVariable = !token
        ? "VITE_PUBLIC_POSTHOG_PROJECT_TOKEN"
        : "VITE_PUBLIC_POSTHOG_HOST";
      throw new Error(
        `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
      );
    }
    return next();
  }

  const posthog = new PostHog(token, {
    host,
    flushAt: 1,
    flushInterval: 0,
    enableExceptionAutocapture: true,
  });
  const sessionId = request.headers.get("X-POSTHOG-SESSION-ID");
  const distinctId = request.headers.get("X-POSTHOG-DISTINCT-ID");

  (context as PostHogContext).posthog = posthog;

  return posthog.withContext(
    {
      sessionId: sessionId ?? undefined,
      distinctId: distinctId ?? undefined,
    },
    async () => {
      try {
        return await next();
      } catch (error) {
        posthog.captureException(error);
        throw error;
      } finally {
        await posthog.shutdown().catch(() => undefined);
      }
    },
  );
};
