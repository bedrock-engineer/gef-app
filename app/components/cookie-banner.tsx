import { usePostHog } from "@posthog/react";
import { useState, useSyncExternalStore } from "react";
import { Button, Dialog } from "react-aria-components";
import { useTranslation } from "react-i18next";

const COOKIE_CONSENT_KEY = "cookie_consent";

type CookieConsent = "accepted" | "declined";

export function getCookieConsent(): CookieConsent | undefined {
  const value = localStorage.getItem(COOKIE_CONSENT_KEY);
  return value === "accepted" || value === "declined" ? value : undefined;
}

const noop = () => undefined;
const subscribeToNothing = () => noop;

/**
 * Non-modal consent dialog: it must not trap focus or block the page,
 * so it renders a bare Dialog in a corner instead of Modal/ModalOverlay.
 * PostHog runs cookieless (memory persistence) until "accepted" flips it
 * to device storage; "declined" keeps it cookieless. See entry.client.tsx
 * for the matching init.
 */
export function CookieBanner() {
  const { t } = useTranslation();
  const posthog = usePostHog();
  // Consent lives in localStorage, so SSR and hydration must render nothing.
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const [decided, setDecided] = useState(false);

  const visible = hydrated && !decided && getCookieConsent() === undefined;
  if (!visible) {
    return null;
  }

  function decide(consent: CookieConsent) {
    localStorage.setItem(COOKIE_CONSENT_KEY, consent);
    if (consent === "accepted") {
      posthog.set_config({ persistence: "localStorage+cookie" });
    }
    setDecided(true);
  }

  return (
    <Dialog
      aria-label={t("cookieBannerLabel")}
      className="fixed bottom-4 left-4 z-50 max-w-xs bg-white border border-gray-300 rounded-sm shadow-lg p-4 outline-none"
    >
      <p className="text-sm text-gray-800 mb-3">{t("cookieBannerText")}</p>
      <div className="flex gap-2">
        <Button
          className="flex-1 px-3 py-1.5 text-sm rounded-sm border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 data-pressed:bg-blue-200 data-pressed:text-blue-800 transition-colors cursor-pointer"
          onPress={() => {
            decide("accepted");
          }}
        >
          {t("cookieBannerAccept")}
        </Button>
        <Button
          className="flex-1 px-3 py-1.5 text-sm rounded-sm border border-gray-300 text-gray-600 hover:bg-gray-100 data-pressed:bg-gray-200 transition-colors cursor-pointer"
          onPress={() => {
            decide("declined");
          }}
        >
          {t("cookieBannerDecline")}
        </Button>
      </div>
    </Dialog>
  );
}
