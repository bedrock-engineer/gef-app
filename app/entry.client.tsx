import i18next from "i18next";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { HydratedRouter } from "react-router/dom";
import resources from "~/locales";

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
          <HydratedRouter />
        </StrictMode>
      </I18nextProvider>,
    );
  });
}

main().catch(console.error);
