import { useTranslation } from "react-i18next";
import type { GefBoreData } from "../gef/gef-bore";
import type { ProcessedMetadata } from "../gef/gef-cpt";
import {
  getLocalizedDescription,
  type HeaderItem,
} from "./common-header-items";

export function getBoreMeasurementTextItems(
  processed: ProcessedMetadata,
  categories: Array<string>,
  locale = "nl"
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];

  // Get text items matching the categories
  for (const textItem of Object.values(processed.texts)) {
    if (!categories.includes(textItem.metadata.category)) {
      continue;
    }

    if (!textItem.value || textItem.value === "-" || textItem.value === "0") {
      continue;
    }

    if (textItem.metadata.category === "reserved") {
      continue;
    }

    // Use decoded value if available, otherwise raw value
    const displayValue = textItem.decoded ?? textItem.value;

    items.push({
      label: getLocalizedDescription(textItem.metadata, locale),
      value: displayValue,
    });
  }

  return items;
}

// BORE-specific compact info component
export function BoreCompactInfo({ data }: { data: GefBoreData }) {
  const { t } = useTranslation();
  const { processed } = data;

  const boringDate = processed.texts.datumBoring?.value; // MEASUREMENTTEXT ID 16 = "Datum boring"
  const placeName = processed.texts.plaatsUitvoering?.value; // MEASUREMENTTEXT ID 3 = "Plaats uitvoering"
  const drillingCompany = processed.texts.boorfirma?.value; // MEASUREMENTTEXT ID 13 = "Boorfirma"
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
