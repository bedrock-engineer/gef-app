import { useTranslation } from "react-i18next";
import { getMeasurementVarValue } from "~/util/gef-common";
import {
  decodeBoreMeasurementText,
  findBoreMeasurementTextVariable,
  findBoreMeasurementVariable,
} from "../util/gef-bore";
import type { GefBoreData } from "../util/gef-cpt";
import type { GefHeaders } from "../util/gef-schemas";
import {
  formatNumericValue,
  getLocalizedDescription,
  type HeaderItem,
} from "./common-header-items";

// BORE-specific lookup functions
export function findBoreMeasurementTextVariableById(id: number) {
  return findBoreMeasurementTextVariable(id);
}

export function findBoreMeasurementVariableById(id: number) {
  return findBoreMeasurementVariable(id);
}

export function decodeBoreMeasurementTextValue(
  id: number,
  text: string
): string {
  return decodeBoreMeasurementText(id, text);
}

// BORE-specific measurement text items
export function getBoreMeasurementTextItems(
  headers: GefHeaders,
  categories: Array<string>,
  locale = "en"
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

// BORE-specific measurement var items
export function getBoreMeasurementVarItems(
  headers: GefHeaders,
  categories: Array<string>,
  locale: string
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];

  headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
    const varInfo = findBoreMeasurementVariable(id);
    if (!varInfo || !categories.includes(varInfo.category)) {
      return;
    }

    const displayValue = formatNumericValue(value);

    items.push({
      label: getLocalizedDescription(varInfo, locale),
      value: unit && unit !== "-" ? `${displayValue} ${unit}` : displayValue,
    });
  });

  return items;
}

// BORE-specific compact info component
export function BoreCompactInfo({ data }: { data: GefBoreData }) {
  const { t } = useTranslation();
  const { headers } = data;

  // Get key BORE measurementtext values
  const datumBoring = headers.MEASUREMENTTEXT?.find((mt) => mt.id === 16);
  const plaatsnaam = headers.MEASUREMENTTEXT?.find((mt) => mt.id === 3);
  const boorbedrijf = headers.MEASUREMENTTEXT?.find((mt) => mt.id === 13);

  // Get end depth from MEASUREMENTVAR 16
  const measurementVars = headers.MEASUREMENTVAR ?? [];
  const finalDepth = getMeasurementVarValue(measurementVars, 16) ?? null;

  if (!datumBoring && !plaatsnaam && !boorbedrijf && finalDepth === null) {
    return null;
  }

  return (
    <>
      {datumBoring && (
        <>
          <dt className="font-medium text-gray-500">{t("boringDate")}</dt>
          <dd>{datumBoring.text}</dd>
        </>
      )}
      {plaatsnaam && (
        <>
          <dt className="font-medium text-gray-500">{t("placeName")}</dt>
          <dd>{plaatsnaam.text}</dd>
        </>
      )}
      {boorbedrijf && (
        <>
          <dt className="font-medium text-gray-500">{t("drillingCompany")}</dt>
          <dd>{boorbedrijf.text}</dd>
        </>
      )}
      {finalDepth !== null && (
        <>
          <dt className="font-medium text-gray-500">{t("depth")}</dt>
          <dd>{finalDepth.toFixed(2)}m</dd>
        </>
      )}
    </>
  );
}
