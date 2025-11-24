import { useTranslation } from "react-i18next";
import {
  decodeMeasurementText,
  findCptMeasurementTextVariable,
  findCptMeasurementVariable,
  type GefExtension,
  type ProcessedMetadata,
} from "../util/gef-cpt";
import type { GefHeaders } from "../util/gef-schemas";
import { CopyButton } from "./copy-button";
import {
  formatNumericValue,
  getLocalizedDescription,
  type HeaderItem,
} from "./common-header-items";

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

interface CptCompactInfoProps {
  processed: ProcessedMetadata;
  lastScan: number | undefined;
}

export function CptCompactInfo({
  processed,
  lastScan,
}: CptCompactInfoProps) {
  const { t } = useTranslation();

  // Try both possible keys for water level (ID 42 = orientationBetweenXAxisInclinationAndNorth in spec, but may be used for water level in practice)
  // or ID 14 = groundwaterLevelWithRespectToDatumOfHeightSystemInZid
  const waterLevel = processed.measurements.orientationBetweenXAxisInclinationAndNorth ??
                      processed.measurements.groundwaterLevelWithRespectToDatumOfHeightSystemInZid;
  const waterLevelDisplay = waterLevel?.value.toFixed(2) ?? null;

  const finalDepth = processed.measurements.endDepthOfPenetrationTest;

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

      {finalDepth && (
        <>
          <dt className="text-gray-500">{t("depth")}</dt>
          <dd>{finalDepth.value.toFixed(3)}m</dd>
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
