import { useTranslation } from "react-i18next";
import type { GefBoreData } from "../util/gef-bore";
import {
  decodeBoreMeasurementText,
  findBoreMeasurementTextVariable,
} from "../util/gef-bore";
import type { GefBoreHeaders } from "../util/gef-schemas";
import {
  getLocalizedDescription,
  type HeaderItem,
} from "./common-header-items";

// BORE-specific measurement text items
export function getBoreMeasurementTextItems(
  headers: GefBoreHeaders,
  categories: Array<string>,
  locale = "en",
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];
  const measurementTexts = headers.MEASUREMENTTEXT;

  if (!measurementTexts) {
    return items;
  }

  measurementTexts.forEach(({ id, text }) => {
    const textInfo = findBoreMeasurementTextVariable(id);
    if (!textInfo) {
      return;
    }

    if (!text || text === "-" || text === "0") {
      return;
    }

    if (textInfo.category === "reserved") {
      return;
    }

    if (!categories.includes(textInfo.category)) {
      return;
    }

    const displayValue = decodeBoreMeasurementText(id, text);

    items.push({
      label: getLocalizedDescription(textInfo, locale),
      value: displayValue,
    });
  });

  return items;
}

// BORE-specific compact info component
export function BoreCompactInfo({ data }: { data: GefBoreData }) {
  const { t } = useTranslation();
  const { processed } = data;

  const boringDate = processed.texts.datumBoring; // MEASUREMENTTEXT ID 16 = "Datum boring"
  const placeName = processed.texts.plaatsnaam; // MEASUREMENTTEXT ID 3 = "Plaatsnaam"
  const drillingCompany = processed.texts.boorbedrijf; // MEASUREMENTTEXT ID 13 = "Boorbedrijf"
  const finalDepth = processed.measurements.einddiepte; // MEASUREMENTVAR ID 16 = "Einddiepte"

  if (!boringDate && !placeName && !drillingCompany && !finalDepth) {
    return null;
  }

  return (
    <>
      {boringDate && (
        <>
          <dt className="font-medium text-gray-500">{t("boringDate")}</dt>
          <dd>{boringDate}</dd>
        </>
      )}
      {placeName && (
        <>
          <dt className="font-medium text-gray-500">{t("placeName")}</dt>
          <dd>{placeName}</dd>
        </>
      )}
      {drillingCompany && (
        <>
          <dt className="font-medium text-gray-500">{t("drillingCompany")}</dt>
          <dd>{drillingCompany}</dd>
        </>
      )}
      {finalDepth && (
        <>
          <dt className="font-medium text-gray-500">{t("depth")}</dt>
          <dd>{finalDepth.value.toFixed(2)}m</dd>
        </>
      )}
    </>
  );
}
