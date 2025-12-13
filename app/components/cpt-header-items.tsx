import type { TFunction } from "i18next";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { GefCptHeaders } from "@bedrock-engineer/gef-parser";
import {
  belgianMeasurementTextVariables,
  belgianMeasurementVariables,
  detectGefExtension,
  dutchMeasurementTextVariables,
  dutchMeasurementVariables,
  findCptMeasurementVariable,
  type GefCptData,
  type GefExtension,
  type ProcessedMetadata,
} from "@bedrock-engineer/gef-parser";
import { CardTitle } from "./card";
import {
  countryCodeTranslationMap,
  filterMeasurementTextsByCategories,
  formatNumericValue,
  getCalculationsInfo,
  getComments,
  getConditionsInfo,
  getFileMetadata,
  getLocalizedDescription,
  getProcessingInfo,
  type HeaderItem,
} from "./common-header-items";
import { CopyButton } from "./copy-button";
import {
  CompactHeaderLeftColumn,
  CompactHeaderRightColumn,
  HeaderDisclosurePanels,
  type HeaderSection,
} from "./gef-header-display";

function getCalibrationData(
  headers: GefCptHeaders,
  extension: GefExtension,
  locale: string,
) {
  const items: Array<{ label: string; value: string }> = [];

  headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
    const varInfo = findCptMeasurementVariable(id, extension);

    if (varInfo?.category === "calibration" && value !== 0) {
      const displayValue = formatNumericValue(value);
      items.push({
        label: getLocalizedDescription(varInfo, locale),
        value: unit ? `${displayValue} ${unit}` : displayValue,
      });
    }
  });

  return items;
}

interface CptCompactInfoProps {
  processed: ProcessedMetadata;
  lastScan: number | undefined;
}

function CptCompactInfo({ processed, lastScan }: CptCompactInfoProps) {
  const { t } = useTranslation();

  const waterLevel =
    processed.measurements
      .groundwaterLevelWithRespectToDatumOfHeightSystemInZid;
  const waterLevelDisplay = waterLevel?.value ?? null;

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
          <dd>{finalDepth.value}m</dd>
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

interface CompactCptHeaderProps {
  filename: string;
  data: GefCptData;
}

export function CompactCptHeader({ filename, data }: CompactCptHeaderProps) {
  const { headers, processed } = data;

  return (
    <div className="bg-white border border-gray-300 rounded-sm p-4 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
        <CompactHeaderLeftColumn filename={filename} data={data} />
        <CompactHeaderRightColumn processed={processed}>
          <CptCompactInfo processed={processed} lastScan={headers.LASTSCAN} />
        </CompactHeaderRightColumn>
      </div>
    </div>
  );
}

function getCptProjectInfo(
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

function getCptTestInfo(
  headers: GefCptHeaders,
  processed: ProcessedMetadata,
  extension: GefExtension,
  t: TFunction,
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];

  if (processed.startDate) {
    items.push({
      label: t("startDate"),
      value: processed.startDate,
    });
  }

  if (processed.startTime) {
    items.push({
      label: t("startTime"),
      value: processed.startTime,
    });
  }

  headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
    const varInfo = findCptMeasurementVariable(id, extension);

    if (
      varInfo &&
      ["test_type", "test_execution", "site_conditions"].includes(
        varInfo.category,
      )
    ) {
      let displayValue: string;

      if ("options" in varInfo) {
        const option = (
          varInfo.options as ReadonlyArray<{ value: number; meaning: string }>
        ).find((o) => o.value === value);

        displayValue = option ? option.meaning : formatNumericValue(value);
      } else {
        displayValue = formatNumericValue(value);
      }

      items.push({
        label: varInfo.description,
        value: unit && unit !== "-" ? `${displayValue} ${unit}` : displayValue,
      });
    }
  });

  return items;
}

function getCptCoordinatesInfo(
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

function getCptEquipmentInfo(
  headers: GefCptHeaders,
  processed: ProcessedMetadata,
  extension: GefExtension,
  locale: string,
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];

  items.push(
    ...filterMeasurementTextsByCategories(
      processed,
      [
        "equipment",
        "drilling_methods",
        "drilling_equipment",
        "drilling_segments",
      ],
      locale,
    ),
  );

  headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
    const varInfo = findCptMeasurementVariable(id, extension);
    if (
      !varInfo ||
      ![
        "equipment",
        "capabilities",
        "drilling_equipment",
        "drilling_segments",
        "borehole_geometry",
        "groundwater",
        "monitoring_wells",
      ].includes(varInfo.category)
    ) {
      return;
    }

    let displayValue: string;
    if ("options" in varInfo) {
      const option = (
        varInfo.options as ReadonlyArray<{ value: number; meaning: string }>
      ).find((o) => o.value === value);
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

function getExtensionInfo(
  headers: GefCptHeaders,
  extension: GefExtension,
  t: TFunction,
): Array<HeaderItem> {
  if (extension === "standard") {
    return [];
  }

  const items: Array<HeaderItem> = [];

  if (extension === "dutch") {
    items.push({
      label: t("extensionType"),
      value: "Basis Registratie Ondergrond / VOTB (GEF-CPT v1.1.3)",
    });

    // Add Dutch MEASUREMENTTEXT fields with values
    headers.MEASUREMENTTEXT?.forEach(({ id, text }) => {
      const varInfo =
        dutchMeasurementTextVariables[
          id as keyof typeof dutchMeasurementTextVariables
        ];
      if (varInfo) {
        items.push({
          label: varInfo.description,
          value: text,
        });
      }
    });

    // Add Dutch MEASUREMENTVAR fields with values
    headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
      const varInfo =
        dutchMeasurementVariables[id as keyof typeof dutchMeasurementVariables];
      if (varInfo) {
        const displayValue = formatNumericValue(value);
        items.push({
          label: varInfo.description,
          value:
            unit && unit !== "-" ? `${displayValue} ${unit}` : displayValue,
        });
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (extension === "belgian") {
    items.push({
      label: t("extensionType"),
      value: "Databank Ondergrond Vlaanderen",
    });

    // Add Belgian MEASUREMENTTEXT fields with values
    headers.MEASUREMENTTEXT?.forEach(({ id, text }) => {
      const varInfo =
        belgianMeasurementTextVariables[
          id as keyof typeof belgianMeasurementTextVariables
        ];
      if (varInfo) {
        items.push({
          label: varInfo.description,
          value: text,
        });
      }
    });

    // Add Belgian MEASUREMENTVAR fields with values
    headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
      const varInfo =
        belgianMeasurementVariables[
          id as keyof typeof belgianMeasurementVariables
        ];
      if (varInfo) {
        const displayValue = formatNumericValue(value);
        items.push({
          label: varInfo.description,
          value:
            unit && unit !== "-" ? `${displayValue} ${unit}` : displayValue,
        });
      }
    });
  }

  return items;
}

interface DetailedCptHeaderProps {
  data: GefCptData;
}

export function DetailedCptHeaders({ data }: DetailedCptHeaderProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { headers, processed } = data;

  const extension = detectGefExtension(
    headers.MEASUREMENTTEXT?.map((mt) => mt.id),
    headers.MEASUREMENTVAR?.map((v) => v.id),
  );

  const allSections: Array<HeaderSection> = [
    // CPT-specific sections
    {
      id: "project",
      title: t("projectInformation"),
      items: getCptProjectInfo(processed, t, locale),
    },
    {
      id: "test_info",
      title: t("testInformation"),
      items: getCptTestInfo(headers, processed, extension, t),
    },
    {
      id: "coordinates",
      title: t("coordinatesLocation"),
      items: getCptCoordinatesInfo(processed, t, locale),
    },
    {
      id: "equipment",
      title: t("equipmentCapabilities"),
      items: getCptEquipmentInfo(headers, processed, extension, locale),
    },
    // Shared sections using generic utilities
    {
      id: "conditions",
      title: t("testConditionsRemarks"),
      items: getConditionsInfo(processed, locale),
    },
    {
      id: "processing",
      title: t("dataProcessing"),
      items: getProcessingInfo(processed, locale),
    },
    {
      id: "calculations",
      title: t("calculationsFormulas"),
      items: getCalculationsInfo(processed, locale),
    },
    {
      id: "metadata",
      title: t("fileMetadata"),
      items: getFileMetadata(processed, t),
    },
    {
      id: "comments",
      title: t("comments"),
      items: getComments(processed, t),
    },
    // CPT-only sections
    {
      id: "data_structure",
      title: t("dataStructure"),
      items: getDataStructure(headers, t),
    },
    {
      id: "calibration",
      title: t("calibrationData"),
      items: getCalibrationData(headers, extension, locale),
    },
    {
      id: "extension",
      title: t("extension"),
      items: getExtensionInfo(headers, extension, t),
    },
  ].filter((section) => section.items.length > 0);

  return (
    <div className="space-y-2">
      <CardTitle>{t("technicalDetails")}</CardTitle>
      <HeaderDisclosurePanels sections={allSections} />
    </div>
  );
}

function getDataStructure(headers: GefCptHeaders, t: TFunction) {
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
