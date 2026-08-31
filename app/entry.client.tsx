import * as Sentry from "@sentry/react-router/cloudflare";
import i18next from "i18next";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { HydratedRouter } from "react-router/dom";
import { registerSW } from "virtual:pwa-register";
import resources from "~/locales";

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
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <HydratedRouter onError={Sentry.sentryOnError} />
        </StrictMode>
      </I18nextProvider>,
    );
  });
}

main().catch(console.error);
