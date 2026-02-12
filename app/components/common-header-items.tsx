import { format } from "d3-format";
import type { TFunction } from "i18next";
import type { ReactNode } from "react";
import type {
  GefCptHeaders,
  ProcessedMetadata,
} from "@bedrock-engineer/gef-parser";

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

export function getProjectInfo(
  processed: ProcessedMetadata,
  t: TFunction,
  locale: string,
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];

  if (processed.projectId) {
    items.push({ label: t("projectId"), value: processed.projectId });
  }
  if (processed.testId) {
    items.push({ label: t("testId"), value: processed.testId });
  }

  if (processed.companyName) {
    items.push({ label: t("company"), value: processed.companyName });
  }

  if (processed.companyAddress) {
    items.push({ label: t("address"), value: processed.companyAddress });
  }

  if (processed.companyCountryCode) {
    const countryKey =
      countryCodeTranslationMap[
        processed.companyCountryCode as keyof typeof countryCodeTranslationMap
      ];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (countryKey) {
      items.push({
        label: t("country"),
        value: t(countryKey),
      });
    }
  }

  const measurementTextItems = filterMeasurementTextsByCategories(
    processed,
    [
      "project_info",
      "standards",
      "location",
      "personnel",
      "data_management",
      "related_investigations",
    ],
    locale,
  );

  return items.concat(measurementTextItems);
}

export function getCoordinatesInfo(
  processed: ProcessedMetadata,
  t: TFunction,
  locale: string,
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];

  items.push(
    ...filterMeasurementTextsByCategories(
      processed,
      [
        "coordinates",
        "reference_system",
        "elevation_determination",
        "position_determination",
      ],
      locale,
    ),
  );

  if (processed.coordinateSystem) {
    items.push({
      label: t("coordinateSystem"),
      value: `${processed.coordinateSystem.name} ${processed.coordinateSystem.epsg}`,
    });

    if (
      processed.originalX !== undefined &&
      processed.xUncertainty !== undefined
    ) {
      items.push({
        label: t("xCoordinate"),
        value: `${processed.originalX} m ± ${processed.xUncertainty}`,
      });
    }

    if (
      processed.originalY !== undefined &&
      processed.yUncertainty !== undefined
    ) {
      items.push({
        label: t("yCoordinate"),
        value: `${processed.originalY} m ± ${processed.yUncertainty}`,
      });
    }
  }

  if (processed.heightSystem) {
    items.push({
      label: t("heightSystem"),
      value: processed.heightSystem.name,
    });

    if (
      processed.surfaceElevation !== undefined &&
      processed.elevationUncertainty !== undefined
    ) {
      items.push({
        label: t("surfaceLevel"),
        value: `${processed.surfaceElevation} m ± ${processed.elevationUncertainty}`,
      });
    }
  }

  return items;
}

export function getTestInfo(
  processed: ProcessedMetadata,
  t: TFunction,
  locale: string,
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];

  if (processed.startDate) {
    items.push({ label: t("startDate"), value: processed.startDate });
  }
  if (processed.startTime) {
    items.push({ label: t("startTime"), value: processed.startTime });
  }

  items.push(
    ...filterMeasurementsByCategories(
      processed,
      ["test_type", "test_execution", "site_conditions"],
      locale,
    ),
  );

  return items;
}

type DataStructureHeaders = Pick<
  GefCptHeaders,
  "COLUMN" | "LASTSCAN" | "DATAFORMAT" | "COLUMNINFO" | "COLUMNMINMAX"
>;

export function getDataStructure(
  headers: DataStructureHeaders,
  t: TFunction,
): Array<HeaderItem> {
  const items: Array<{ label: string; value: ReactNode }> = [];

  if (headers.COLUMN) {
    items.push({ label: t("numberOfColumns"), value: String(headers.COLUMN) });
  }

  if (headers.LASTSCAN) {
    items.push({ label: t("numberOfScans"), value: String(headers.LASTSCAN) });
  }

  if (headers.DATAFORMAT) {
    items.push({ label: t("dataFormat"), value: headers.DATAFORMAT });
  }

  if (headers.COLUMNINFO) {
    const minMaxEntries = headers.COLUMNMINMAX?.map(
      ({ columnNumber, min, max }) => [columnNumber, { min, max }] as const,
    );
    const minMaxMap = new Map<number, { min: number; max: number }>(
      minMaxEntries,
    );

    items.push({
      label: t("dataColumns"),
      value: (
        <table>
          <thead>
            <tr>
              <th className="border border-gray-300 px-2 py-1 text-left">
                {t("name")}
              </th>
              <th className="border border-gray-300 px-2 py-1 text-left">
                {t("unit")}
              </th>
              {minMaxMap.size > 0 && (
                <>
                  <th className="border border-gray-300 px-2 py-1 text-left">
                    Min
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-left">
                    Max
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {headers.COLUMNINFO.map((col, index) => {
              const colNum = index + 1;
              const minMax = minMaxMap.get(colNum);
              return (
                <tr key={col.name}>
                  <td className="border border-gray-300 px-2 py-1">
                    {col.name}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {col.unit}
                  </td>
                  {minMax && (
                    <>
                      <td
                        className="border border-gray-300 px-2 py-1 text-right"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {minMax.min}
                      </td>

                      <td
                        className="border border-gray-300 px-2 py-1 text-right"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {minMax.max}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      ),
    });
  }

  return items;
}
