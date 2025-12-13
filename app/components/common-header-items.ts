import { format } from "d3-format";
import type { TFunction } from "i18next";
import type { ProcessedMetadata } from "@bedrock-engineer/gef-parser";

export interface HeaderItem {
  label: string;
  value: React.ReactNode;
}

export const formatNumericValue = format(".3~f");

export function getLocalizedDescription(
  varInfo: { description: string; descriptionNl?: string } | undefined,
  locale: string,
): string {
  if (!varInfo) {
    return "";
  }
  if (locale === "nl" && varInfo.descriptionNl) {
    return varInfo.descriptionNl;
  }
  return varInfo.description;
}

export const countryCodeTranslationMap = {
  "31": "countryNetherlands",
  "32": "countryBelgium",
  "49": "countryGermany",
} as const;

export function getFileMetadata(processed: ProcessedMetadata, t: TFunction) {
  const items: Array<HeaderItem> = [];

  if (processed.gefVersion) {
    items.push({
      label: t("gefVersion"),
      value: processed.gefVersion,
    });
  }

  if (processed.reportCode) {
    items.push({
      label: t("reportCode"),
      value: processed.reportCode,
    });
  }

  if (processed.measurementCode) {
    items.push({
      label: t("measurementCode"),
      value: processed.measurementCode,
    });
  }

  if (processed.fileDate) {
    items.push({
      label: t("fileDate"),
      value: processed.fileDate,
    });
  }

  if (processed.fileOwner) {
    items.push({ label: t("fileOwner"), value: processed.fileOwner });
  }

  if (processed.operatingSystem) {
    items.push({
      label: t("operatingSystem"),
      value: processed.operatingSystem,
    });
  }

  return items;
}

export function filterMeasurementTextsByCategories(
  processed: ProcessedMetadata,
  categories: Array<string>,
  locale: string,
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];

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

    const displayValue = textItem.decoded ?? textItem.value;

    items.push({
      label: getLocalizedDescription(textItem.metadata, locale),
      value: displayValue,
    });
  }

  return items;
}

export function filterMeasurementsByCategories(
  processed: ProcessedMetadata,
  categories: Array<string>,
  locale: string,
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];

  for (const measurement of Object.values(processed.measurements)) {
    if (!categories.includes(measurement.metadata.category)) {
      continue;
    }

    if (measurement.metadata.category === "reserved") {
      continue;
    }

    const displayValue = formatNumericValue(measurement.value);
    const valueWithUnit =
      measurement.unit && measurement.unit !== "-"
        ? `${displayValue} ${measurement.unit}`
        : displayValue;

    items.push({
      label: getLocalizedDescription(measurement.metadata, locale),
      value: valueWithUnit,
    });
  }

  return items;
}

export function getConditionsInfo(
  processed: ProcessedMetadata,
  locale: string,
) {
  return filterMeasurementTextsByCategories(
    processed,
    [
      "conditions",
      "general",
      "infrastructure",
      "measurements",
      "sample_condition",
      "monitoring_wells",
    ],
    locale,
  );
}

export function getProcessingInfo(
  processed: ProcessedMetadata,
  locale: string,
) {
  return filterMeasurementTextsByCategories(processed, ["processing"], locale);
}

export function getCalculationsInfo(
  processed: ProcessedMetadata,
  locale: string,
) {
  return filterMeasurementTextsByCategories(
    processed,
    ["calculations"],
    locale,
  );
}

export function getComments(processed: ProcessedMetadata, t: TFunction) {
  if (processed.comments.length > 0) {
    return processed.comments.map((comment, index) => ({
      label: `${t("comment")} ${index + 1}`,
      value: comment,
    }));
  }

  return [];
}
