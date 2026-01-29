import { useTranslation } from "react-i18next";

export function InstallInstructions() {
  if (typeof window === "undefined") {
    throw Error("InstallInstructions should only render on the client.");
  }

  const { t } = useTranslation();
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = ua.includes('Android');

  if (isIOS) {
    return <>{t("installInstructionsIOS")}</>;
  }

  if (isAndroid) {
    return <>{t("installInstructionsAndroid")}</>;
  }

  return <>{t("installInstructionsDesktop")}</>;
}
