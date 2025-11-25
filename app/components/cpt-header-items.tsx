import { useTranslation } from "react-i18next";
import type { ProcessedMetadata } from "../util/gef-cpt";
import {
  getLocalizedDescription,
  type HeaderItem
} from "./common-header-items";
import { CopyButton } from "./copy-button";

// CPT-specific measurement text items - now uses processed data
export function getCptMeasurementTextItems(
  processed: ProcessedMetadata,
  categories: Array<string>,
  locale = "en"
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];

  // Get text items matching the categories
  for (const [_key, textItem] of Object.entries(processed.texts)) {
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

interface CptCompactInfoProps {
  processed: ProcessedMetadata;
  lastScan: number | undefined;
}

export function CptCompactInfo({ processed, lastScan }: CptCompactInfoProps) {
  const { t } = useTranslation();

  const waterLevel =
    processed.measurements
      .groundwaterLevelWithRespectToDatumOfHeightSystemInZid;
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
