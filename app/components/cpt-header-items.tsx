import type { TFunction } from "i18next";
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
  filterMeasurementTextsByCategories,
  formatNumericValue,
  getCalculationsInfo,
  getComments,
  getConditionsInfo,
  getCoordinatesInfo,
  getDataStructure,
  getFileMetadata,
  getLocalizedDescription,
  getProcessingInfo,
  getProjectInfo,
  type HeaderItem,
} from "./common-header-items";
import { CopyButton } from "./copy-button";
import {
  CompactHeaderLeftColumn,
  CompactHeaderRightColumn,
  HeaderContainer,
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
  childCount: number;
}

function CptCompactInfo({
  processed,
  lastScan,
  childCount,
}: CptCompactInfoProps) {
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

      {childCount > 0 && (
        <>
          <dt className="text-gray-500">{t("dissTests")}</dt>
          <dd>{childCount}</dd>
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
    <HeaderContainer>
      <CompactHeaderLeftColumn filename={filename} data={data} />
      <CompactHeaderRightColumn processed={processed}>
        <CptCompactInfo
          processed={processed}
          lastScan={headers.LASTSCAN}
          childCount={headers.CHILD?.length ?? 0}
        />
      </CompactHeaderRightColumn>
    </HeaderContainer>
  );
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

function getChildFilesInfo(
  headers: GefCptHeaders,
  t: TFunction,
): Array<HeaderItem> {
  if (!headers.CHILD || headers.CHILD.length === 0) {
    return [];
  }

  return [
    {
      label: t("childGefFilesCount", { count: headers.CHILD.length }),
      value: (
        <table>
          <thead>
            <tr>
              <th className="border border-gray-300 px-2 py-1 text-left">
                #
              </th>
              <th className="border border-gray-300 px-2 py-1 text-left">
                {t("reference")}
              </th>
              <th className="border border-gray-300 px-2 py-1 text-left">
                {t("depth")}
              </th>
              <th className="border border-gray-300 px-2 py-1 text-left">
                {t("description")}
              </th>
            </tr>
          </thead>
          <tbody>
            {headers.CHILD.map((child) => (
              <tr key={child.index}>
                <td className="border border-gray-300 px-2 py-1">
                  {child.index}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {child.reference}
                </td>
                <td
                  className="border border-gray-300 px-2 py-1 text-right"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {child.value != null
                    ? `${child.value} ${child.unit ?? ""}`
                    : ""}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {[child.quantity, child.explanation]
                    .filter(Boolean)
                    .join(" - ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
  ];
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
      items: getProjectInfo(processed, t, locale),
    },
    {
      id: "test_info",
      title: t("testInformation"),
      items: getCptTestInfo(headers, processed, extension, t),
    },
    {
      id: "coordinates",
      title: t("coordinatesLocation"),
      items: getCoordinatesInfo(processed, t, locale),
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
    {
      id: "child",
      title: t("childGefFiles"),
      items: getChildFilesInfo(headers, t),
    },
  ].filter((section) => section.items.length > 0);

  return (
    <div className="space-y-2">
      <CardTitle>{t("technicalDetails")}</CardTitle>
      <HeaderDisclosurePanels sections={allSections} />
    </div>
  );
}
