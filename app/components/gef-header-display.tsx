import type { TFunction } from "i18next";
import { DownloadIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Button,
  Disclosure,
  DisclosurePanel,
  Heading,
} from "react-aria-components";
import { useTranslation } from "react-i18next";
import type { GefData, GefFileType } from "~/gef/gef-common";
import type { GefBoreHeaders, GefCptHeaders } from "~/gef/gef-schemas";
import { findBoreMeasurementVariable } from "../gef/gef-bore";
import type { ProcessedMetadata } from "../gef/gef-cpt";
import {
  belgianMeasurementTextVariables,
  belgianMeasurementVariables,
  detectGefExtension,
  dutchMeasurementTextVariables,
  dutchMeasurementVariables,
  findCptMeasurementVariable,
  type GefExtension,
} from "../gef/gef-cpt";
import { formatGefDate } from "../gef/gef-metadata-processed";
import {
  BoreCompactInfo,
  getBoreMeasurementTextItems,
} from "./bore-header-items";
import { CardTitle } from "./card";
import {
  countryCodeTranslationMap,
  formatNumericValue,
  getLocalizedDescription,
  type HeaderItem,
} from "./common-header-items";
import { CopyButton } from "./copy-button";
import { CptCompactInfo, getCptMeasurementTextItems } from "./cpt-header-items";

function findMeasurementVariableByFileType(
  id: number,
  fileType: GefFileType,
  extension: GefExtension
) {
  if (fileType === "BORE") {
    return findBoreMeasurementVariable(id);
  }
  return findCptMeasurementVariable(id, extension);
}

function getMeasurementTextItems(
  processed: ProcessedMetadata,
  categories: Array<string>,
  locale = "nl"
): Array<HeaderItem> {
  if (processed.fileType === "BORE") {
    return getBoreMeasurementTextItems(processed, categories, locale);
  }
  return getCptMeasurementTextItems(processed, categories, locale);
}

interface CompactHeaderProps {
  filename: string;
  data: GefData;
  onDownload: () => void;
}

export function CompactGefHeader({
  filename,
  data,
  onDownload,
}: CompactHeaderProps) {
  const { t } = useTranslation();

  const { processed, headers, fileType } = data;

  const dateTimeStr =
    processed.startDate && processed.startTime
      ? `${processed.startDate} ${processed.startTime}`
      : processed.startDate;

  const elevationValue = processed.surfaceElevation?.toFixed(2) ?? null;
  const elevationDisplay = elevationValue
    ? `${elevationValue}m ${processed.heightSystem?.name}`
    : null;

  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
        <div>
          <div className="font-bold text-lg text-gray-900 flex items-center gap-1">
            {processed.testId ?? t("unknownTest")}
            {processed.testId && (
              <CopyButton value={processed.testId} label={t("copyTestId")} />
            )}
          </div>

          <p className="text-gray-600 ">{filename}</p>

          {processed.projectId && (
            <p className="text-gray-600 flex items-center gap-1">
              {processed.projectId}
            </p>
          )}
          {processed.companyName && (
            <p className="text-gray-600">{processed.companyName}</p>
          )}

          {fileType == "CPT" ? (
            <DownloadCSVButton onDownload={onDownload} />
          ) : null}
        </div>

        <dl
          className="text-gray-700 space-y-1 grid gap-x-2"
          style={{ gridTemplateColumns: "auto 1fr" }}
        >
          {dateTimeStr && (
            <>
              <dt className="text-gray-500">{t("date")}</dt>
              <dd className="flex items-center gap-1">
                {dateTimeStr}
                <CopyButton value={dateTimeStr} label={t("copyDate")} />
              </dd>
            </>
          )}

          {processed.coordinateSystem && (
            <>
              <dt className="text-gray-500">{t("locationLabel")}</dt>
              <dd>
                <div>
                  <span className="font-semibold">
                    {processed.coordinateSystem.name}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {" "}
                    ({processed.coordinateSystem.epsg})
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {processed.originalX?.toFixed(2)},{" "}
                  {processed.originalY?.toFixed(2)}
                  <CopyButton
                    value={`${processed.originalX?.toFixed(2)}, ${processed.originalY?.toFixed(2)}`}
                    label={t("copyCoordinates")}
                  />
                </div>

                {processed.wgs84 && (
                  <>
                    <div className="mt-2">
                      <span className="font-semibold">WGS84</span>
                      <span className="text-gray-400 text-sm">
                        {" "}
                        (EPSG:4326)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {processed.wgs84.lat.toFixed(6)},{" "}
                      {processed.wgs84.lon.toFixed(6)}
                      <CopyButton
                        value={`${processed.wgs84.lat.toFixed(6)}, ${processed.wgs84.lon.toFixed(6)}`}
                        label={t("copyWgs84")}
                      />
                    </div>
                  </>
                )}
              </dd>
            </>
          )}

          {elevationDisplay && (
            <>
              <dt className="text-gray-500">{t("groundLevel")}</dt>
              <dd className="flex items-center gap-1">
                {elevationDisplay}
                {elevationValue && (
                  <CopyButton
                    value={elevationValue}
                    label={t("copyElevation")}
                  />
                )}
              </dd>
            </>
          )}

          {fileType === "CPT" && (
            <CptCompactInfo processed={processed} lastScan={headers.LASTSCAN} />
          )}

          {fileType === "BORE" && <BoreCompactInfo data={data} />}
        </dl>
      </div>
    </div>
  );
}

function DownloadCSVButton({ onDownload }: { onDownload: () => void }) {
  const { t } = useTranslation();

  return (
    <Button
      onPress={() => {
        onDownload();
      }}
      className="button transition-colors mt-4"
    >
      {t("downloadCsv")} <DownloadIcon size={14} />
    </Button>
  );
}

interface DetailedHeaderProps {
  data: GefData;
}

export function DetailedGefCptHeaders({ data }: DetailedHeaderProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { headers, fileType, processed } = data;

  const extension = detectGefExtension(
    headers.MEASUREMENTTEXT?.map((mt) => mt.id),
    headers.MEASUREMENTVAR?.map((v) => v.id)
  );

  const sections = [
    {
      id: "project",
      title: t("projectInformation"),
      items: getProjectInfo(headers, processed, t, locale),
    },
    {
      id: "test_info",
      title: t("testInformation"),
      items: getTestInfo(headers, processed, fileType, extension, t),
    },
    {
      id: "coordinates",
      title: t("coordinatesLocation"),
      items: getCoordinatesInfo(headers, processed, t, locale),
    },
    {
      id: "equipment",
      title: t("equipmentCapabilities"),
      items: getEquipmentInfo(headers, processed, fileType, extension, locale),
    },
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
      id: "data_structure",
      title: t("dataStructure"),
      items: getDataStructure(headers, t),
    },
    {
      id: "calibration",
      title: t("calibrationData"),
      items: getCalibrationData(headers, fileType, extension, locale),
    },
    {
      id: "metadata",
      title: t("fileMetadata"),
      items: getFileMetadata(headers, t),
    },
    {
      id: "comments",
      title: t("comments"),
      items: getComments(headers, t),
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

      <div className="grid grid-cols-2 gap-x-2 gap-y-2 items-start">
        {sections.map((section) => (
          <Disclosure
            key={section.id}
            className="border border-gray-300 rounded-md overflow-hidden"
          >
            <Heading>
              <Button
                slot="trigger"
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-100 flex items-center justify-between text-left transition-color"
              >
                <span className="font-medium text-gray-800">
                  {section.title}
                </span>
                <span className="text-gray-500 data-expanded:hidden">+</span>
                <span className="text-gray-500 hidden data-expanded:inline">
                  −
                </span>
              </Button>
            </Heading>

            <DisclosurePanel className=" bg-white">
              <dl className="space-y-2 p-4">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[200px_1fr] gap-4 text-sm"
                  >
                    <dt className="text-gray-600">{item.label}</dt>
                    <dd className="text-gray-900 font-mono text-xs">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </DisclosurePanel>
          </Disclosure>
        ))}
      </div>
    </div>
  );
}

function getProjectInfo(
  headers: GefBoreHeaders | GefCptHeaders,
  processed: ProcessedMetadata,
  t: TFunction,
  locale: string
) {
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

  // Address and country still need raw headers
  const company = headers.COMPANYID;
  if (company) {
    if (company.address) {
      items.push({ label: t("address"), value: company.address });
    }

    if (company.countryCode) {
      const countryKey =
        countryCodeTranslationMap[
          company.countryCode as keyof typeof countryCodeTranslationMap
        ];

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (countryKey) {
        items.push({
          label: t("country"),
          value: t(countryKey),
        });
      }
    }
  }

  const measuremenTextItems = getMeasurementTextItems(
    processed,
    [
      "project_info",
      "standards",
      "location",
      "personnel",
      "data_management",
      "related_investigations",
    ],
    locale
  );
  const a = items.concat(measuremenTextItems);

  return a;
}

function getTestInfo(
  headers: GefBoreHeaders | GefCptHeaders,
  processed: ProcessedMetadata,
  fileType: GefFileType,
  extension: GefExtension,
  t: TFunction
) {
  const items: Array<{ label: string; value: string }> = [];

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
    const varInfo = findMeasurementVariableByFileType(id, fileType, extension);

    if (
      varInfo &&
      ["test_type", "test_execution", "site_conditions"].includes(
        varInfo.category
      )
    ) {
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
        label: varInfo.description,
        value: unit && unit !== "-" ? `${displayValue} ${unit}` : displayValue,
      });
    }
  });

  return items;
}

function getCoordinatesInfo(
  headers: GefBoreHeaders | GefCptHeaders,
  processed: ProcessedMetadata,
  t: TFunction,
  locale: string
) {
  const items: Array<HeaderItem> = [];

  items.push(
    ...getMeasurementTextItems(
      processed,
      [
        "coordinates",
        "reference_system",
        "elevation_determination",
        "position_determination",
      ],
      locale
    )
  );

  if (processed.coordinateSystem) {
    items.push({
      label: t("coordinateSystem"),
      value: `${processed.coordinateSystem.name} ${processed.coordinateSystem.epsg}`,
    });

    // Use raw headers for delta values
    const xyid = headers.XYID;
    if (xyid) {
      items.push({
        label: t("xCoordinate"),
        value: `${xyid.x.toFixed()} m ± ${xyid.deltaX.toFixed()}`,
      });

      items.push({
        label: t("yCoordinate"),
        value: `${xyid.y.toFixed()} m ± ${xyid.deltaY.toFixed()}`,
      });
    }
  }

  if (processed.heightSystem) {
    items.push({
      label: t("heightSystem"),
      value: processed.heightSystem.name,
    });

    const zid = headers.ZID;
    if (zid) {
      items.push({
        label: t("surfaceLevel"),
        value: `${zid.height.toFixed()} m ± ${zid.deltaZ.toFixed()}`,
      });
    }
  }

  return items;
}

function getEquipmentInfo(
  headers: GefBoreHeaders | GefCptHeaders,
  processed: ProcessedMetadata,
  fileType: GefFileType,
  extension: GefExtension,
  locale: string
) {
  const items: Array<HeaderItem> = [];

  items.push(
    ...getMeasurementTextItems(
      processed,
      [
        "equipment",
        "drilling_methods",
        "drilling_equipment",
        "drilling_segments",
      ],
      locale
    )
  );

  headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
    const varInfo = findMeasurementVariableByFileType(id, fileType, extension);
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

function getDataStructure(
  headers: GefBoreHeaders | GefCptHeaders,
  t: TFunction
) {
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
    // Create a map of column number to min/max values
    const minMaxMap = new Map<number, { min: number; max: number }>();

    headers.COLUMNMINMAX?.forEach(({ columnNumber, min, max }) => {
      minMaxMap.set(columnNumber, { min, max });
    });

    items.push({
      label: t("dataColumns"),
      value: (
        <table>
          <thead>
            <tr>
              <th className="border border-gray-300 px-2 py-1 text-left">
                Name
              </th>
              <th className="border border-gray-300 px-2 py-1 text-left">
                Unit
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
          {headers.COLUMNINFO.map((col, index) => {
            const colNum = index + 1;
            const minMax = minMaxMap.get(colNum);
            return (
              <tr key={col.name}>
                <td className="border border-gray-300 px-2 py-1">{col.name}</td>
                <td className="border border-gray-300 px-2 py-1">{col.unit}</td>
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
        </table>
      ),
    });
  }

  return items;
}

function getCalibrationData(
  headers: GefBoreHeaders | GefCptHeaders,
  fileType: GefFileType,
  extension: GefExtension,
  locale: string
) {
  const items: Array<{ label: string; value: string }> = [];

  headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
    const varInfo = findMeasurementVariableByFileType(id, fileType, extension);
    if (varInfo?.category === "calibration" && parseFloat(value) !== 0) {
      const displayValue = formatNumericValue(value);
      items.push({
        label: getLocalizedDescription(varInfo, locale),
        value: unit ? `${displayValue} ${unit}` : displayValue,
      });
    }
  });

  return items;
}

function getFileMetadata(headers: GefBoreHeaders, t: TFunction) {
  const items: Array<{ label: string; value: string }> = [];

  if (headers.GEFID) {
    items.push({
      label: t("gefVersion"),
      value: `${headers.GEFID.major}.${headers.GEFID.minor}.${headers.GEFID.patch}`,
    });
  }

  if (headers.REPORTCODE) {
    items.push({
      label: t("reportCode"),
      value: `${headers.REPORTCODE.code} v${headers.REPORTCODE.major}.${headers.REPORTCODE.minor}.${headers.REPORTCODE.patch}`,
    });
  }

  if (headers.MEASUREMENTCODE) {
    // If it has version info, show it; otherwise just show the code
    const hasVersion =
      headers.MEASUREMENTCODE.major > 0 ||
      headers.MEASUREMENTCODE.minor > 0 ||
      headers.MEASUREMENTCODE.patch > 0;
    const value = hasVersion
      ? `${headers.MEASUREMENTCODE.code} v${headers.MEASUREMENTCODE.major}.${headers.MEASUREMENTCODE.minor}.${headers.MEASUREMENTCODE.patch}`
      : headers.MEASUREMENTCODE.code;
    items.push({
      label: t("measurementCode"),
      value,
    });
  }

  if (headers.FILEDATE) {
    items.push({
      label: t("fileDate"),
      value: formatGefDate(headers.FILEDATE),
    });
  }

  if (headers.FILEOWNER) {
    items.push({ label: t("fileOwner"), value: headers.FILEOWNER });
  }
  if (headers.OS) {
    items.push({ label: t("operatingSystem"), value: headers.OS });
  }

  return items;
}

function getConditionsInfo(processed: ProcessedMetadata, locale: string) {
  return getMeasurementTextItems(
    processed,
    [
      "conditions",
      "general",
      "infrastructure",
      "measurements",
      "sample_condition",
      "monitoring_wells",
    ],
    locale
  );
}

function getProcessingInfo(processed: ProcessedMetadata, locale: string) {
  return getMeasurementTextItems(processed, ["processing"], locale);
}

function getCalculationsInfo(processed: ProcessedMetadata, locale: string) {
  return getMeasurementTextItems(processed, ["calculations"], locale);
}

function getComments(headers: GefBoreHeaders | GefCptHeaders, t: TFunction) {
  const items: Array<HeaderItem> = [];

  if (headers.COMMENT && headers.COMMENT.length > 0) {
    headers.COMMENT.forEach((comment, index) => {
      items.push({
        label: `${t("comment")} ${index + 1}`,
        value: comment,
      });
    });
  }

  return items;
}

function getExtensionInfo(
  headers: GefBoreHeaders | GefCptHeaders,
  extension: GefExtension,
  t: TFunction
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
      const varInfo = dutchMeasurementTextVariables.find((v) => v.id === id);
      if (varInfo) {
        items.push({
          label: varInfo.description,
          value: text,
        });
      }
    });

    // Add Dutch MEASUREMENTVAR fields with values
    headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
      const varInfo = dutchMeasurementVariables.find((v) => v.id === id);
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
      const varInfo = belgianMeasurementTextVariables.find((v) => v.id === id);
      if (varInfo) {
        items.push({
          label: varInfo.description,
          value: text,
        });
      }
    });

    // Add Belgian MEASUREMENTVAR fields with values
    headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
      const varInfo = belgianMeasurementVariables.find((v) => v.id === id);
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
