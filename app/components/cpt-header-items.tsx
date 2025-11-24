import { useTranslation } from "react-i18next";
import { getMeasurementVarValue } from "~/util/gef-common";
import {
  decodeMeasurementText,
  findCptMeasurementTextVariable,
  findCptMeasurementVariable,
  type GefExtension,
} from "../util/gef-cpt";
import type { GefHeaders } from "../util/gef-schemas";
import { CopyButton } from "./copy-button";
import {
  formatNumericValue,
  getLocalizedDescription,
  type HeaderItem,
} from "./common-header-items";

// CPT-specific lookup functions
export function findCptMeasurementTextVariableById(
  id: number,
  extension: GefExtension
) {
  return findCptMeasurementTextVariable(id, extension);
}

export function findCptMeasurementVariableById(
  id: number,
  extension: GefExtension
) {
  return findCptMeasurementVariable(id, extension);
}

export function decodeCptMeasurementTextValue(
  id: number,
  text: string,
  extension: GefExtension
): string {
  return decodeMeasurementText(id, text, extension);
}

// CPT-specific measurement text items
export function getCptMeasurementTextItems(
  headers: GefHeaders,
  categories: Array<string>,
  extension: GefExtension,
  locale = "en"
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];
  const measurementTexts = headers.MEASUREMENTTEXT;

  if (!measurementTexts) {
    return items;
  }

  measurementTexts.forEach(({ id, text }) => {
    const textInfo = findCptMeasurementTextVariable(id, extension);
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

    const displayValue = decodeMeasurementText(id, text, extension);

    items.push({
      label: getLocalizedDescription(textInfo, locale),
      value: displayValue,
    });
  });

  return items;
}

// CPT-specific measurement var items
export function getCptMeasurementVarItems(
  headers: GefHeaders,
  categories: Array<string>,
  extension: GefExtension,
  locale: string
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];

  headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
    const varInfo = findCptMeasurementVariable(id, extension);
    if (!varInfo || !categories.includes(varInfo.category)) {
      return;
    }

    let displayValue: string;
    if ("options" in varInfo) {
      const numValue = parseFloat(value);
      const option = (
        varInfo.options as ReadonlyArray<{ value: number; meaning: string }>
      ).find((o) => o.value === numValue);
      displayValue = option ? option.meaning : formatNumericValue(value);
    } else {
      displayValue = formatNumericValue(value);
    }

    items.push({
      label: getLocalizedDescription(varInfo, locale),
      value: unit && unit !== "-" ? `${displayValue} ${unit}` : displayValue,
    });
  });

  return items;
}

interface CptCompactInfoProps {
  measurementVars: Array<{
    id: number;
    value: string;
    unit: string;
  }>;
  lastScan: number | undefined;
}

export function CptCompactInfo({
  measurementVars,
  lastScan,
}: CptCompactInfoProps) {
  const { t } = useTranslation();

  const waterLevelValue = getMeasurementVarValue(measurementVars, 42);
  const waterLevelDisplay = waterLevelValue?.toFixed(2) ?? null;

  const endDepthValue = getMeasurementVarValue(measurementVars, 16);

  return (
    <>
      {waterLevelDisplay && (
        <>
          <dt className="text-gray-500">{t("waterLevel")}</dt>
          <dd className="flex items-center gap-1">
            {waterLevelDisplay}m
            <CopyButton value={waterLevelDisplay} label={t("copyWaterLevel")} />
          </dd>
        </>
      )}

      {endDepthValue && (
        <>
          <dt className="text-gray-500">{t("depth")}</dt>
          <dd>{endDepthValue.toFixed(3)}m</dd>
        </>
      )}

      {lastScan && (
        <>
          <dt className="text-gray-500">{t("scanNumber")}</dt>
          <dd>{lastScan}</dd>
        </>
      )}
    </>
  );
}
