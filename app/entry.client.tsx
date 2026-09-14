import * as Sentry from "@sentry/react-router/cloudflare";
import { PostHogProvider } from "@posthog/react";
import i18next from "i18next";
import posthog from "posthog-js";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { HydratedRouter } from "react-router/dom";
import { registerSW } from "virtual:pwa-register";
import resources from "~/locales";
import { getCookieConsent } from "~/components/cookie-banner";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enabled: import.meta.env.PROD,
  integrations: [
    // No floating widget button; the form is opened from error boundaries.
    Sentry.feedbackIntegration({
      autoInject: false,
      colorScheme: "system",
    }),
  ],
});

const posthogToken = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN;
const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

if ((!posthogToken || !posthogHost) && import.meta.env.DEV) {
  const missingVariable = !posthogToken
    ? "VITE_PUBLIC_POSTHOG_PROJECT_TOKEN"
    : "VITE_PUBLIC_POSTHOG_HOST";
  throw new Error(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  );
}

if (posthogToken && posthogHost) {
  posthog.init(posthogToken, {
    api_host: posthogHost,
    defaults: "2026-01-30",
    capture_exceptions: true,
    tracing_headers: [window.location.hostname],
    // Cookieless until the CookieBanner records "accepted"; memory persistence
    // stores nothing on the device, so no consent is required for it.
    persistence:
      getCookieConsent() === "accepted" ? "localStorage+cookie" : "memory",
    // The remote-config-loaded Conversations widget writes ph_conv_* to
    // localStorage even with memory persistence, which would break the
    // banner's "nothing stored when declined" promise.
    disable_conversations: true,
  });
}

// Register service worker for offline support
registerSW({ immediate: true });

async function main() {
  await i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      resources,
      supportedLngs: ["nl", "en"],
      fallbackLng: "nl",
      defaultNS: "translation",
      detection: {
        order: ["htmlTag"],
        caches: [],
      },
    });

  startTransition(() => {
    hydrateRoot(
      document,
      <PostHogProvider client={posthog}>
        <I18nextProvider i18n={i18next}>
          <StrictMode>
            <HydratedRouter onError={Sentry.sentryOnError} />
          </StrictMode>
        </I18nextProvider>
      </PostHogProvider>,
    );
  });
}

main().catch(console.error);
