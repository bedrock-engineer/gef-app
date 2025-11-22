import { initReactI18next } from "react-i18next";
import { createCookie } from "react-router";
import { createI18nextMiddleware } from "remix-i18next/middleware";
import resources from "~/locales";
import "i18next";

// This cookie will be used to store the user locale preference
export const localeCookie = createCookie("lng", {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
});

export const [i18nextMiddleware, getLocale, getInstance] =
  createI18nextMiddleware({
    detection: {
      supportedLanguages: ["nl", "en"],
      fallbackLanguage: "en",
      cookie: localeCookie,
    },
    i18next: { resources },
    plugins: [initReactI18next],
  });

// This adds type-safety to the `t` function
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: typeof resources.en;
  }
}
