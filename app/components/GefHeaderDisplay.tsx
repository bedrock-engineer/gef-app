import {
  Button,
  Disclosure,
  DisclosurePanel,
  Heading,
} from "react-aria-components";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  decodeMeasurementText,
  detectGefExtension,
  findMeasurementTextVariable,
  findMeasurementVariable,
  dutchMeasurementTextVariables,
  dutchMeasurementVariables,
  belgianMeasurementTextVariables,
  belgianMeasurementVariables,
  type GefExtension,
} from "../util/gef-metadata";
import {
  findBoreMeasurementTextVariable,
  findBoreMeasurementVariable,
  decodeBoreMeasurementText,
} from "../util/gef-bore-metadata";
import {
  COORDINATE_SYSTEMS,
  HEIGHT_SYSTEM_MAP,
  type GefHeaders,
  type XYID,
} from "../util/gef-schemas";
import { convertToWGS84 } from "../util/coordinates";
import type { GefFileType } from "../util/gef";
import type { ReactNode } from "react";
import { CopyButton } from "./CopyButton";

// Helper to get description based on locale
function getLocalizedDescription(
  varInfo: { description: string; descriptionNl?: string } | undefined,
  locale: string
): string {
  if (!varInfo) return "";
  if (locale === "nl" && varInfo.descriptionNl) {
    return varInfo.descriptionNl;
  }
  return varInfo.description;
}

// Unified lookup functions that consider file type
function findMeasurementTextVariableByFileType(
  id: number,
  fileType: GefFileType,
  extension: GefExtension
) {
  if (fileType === "BORE") {
    return findBoreMeasurementTextVariable(id);
  }
  return findMeasurementTextVariable(id, extension);
}

function findMeasurementVariableByFileType(
  id: number,
  fileType: GefFileType,
  extension: GefExtension
) {
  if (fileType === "BORE") {
    return findBoreMeasurementVariable(id);
  }
  return findMeasurementVariable(id, extension);
}

function decodeMeasurementTextByFileType(
  id: number,
  text: string,
  fileType: GefFileType,
  extension: GefExtension
): string {
  if (fileType === "BORE") {
    return decodeBoreMeasurementText(id, text);
  }
  return decodeMeasurementText(id, text, extension);
}

interface HeaderItem {
  label: string;
  value: React.ReactNode;
}

function formatDate(
  date: { year: number; month: number; day: number },
  time?: { hour: number; minute: number; second?: number }
): string {
  const dateObj = new Date(date.year, date.month - 1, date.day);

  if (time) {
    dateObj.setHours(time.hour, time.minute, time.second ?? 0);
    // Format: YYYY-MM-DD HH:MM or YYYY-MM-DD HH:MM:SS
    const dateStr = dateObj.toISOString().slice(0, 10);
    const timeStr =
      time.second !== undefined
        ? dateObj.toISOString().slice(11, 19)
        : dateObj.toISOString().slice(11, 16);

    return `${dateStr} ${timeStr}`;
  }

  // Format: YYYY-MM-DD
  return dateObj.toISOString().slice(0, 10);
}

// TODO replace with d3-format formatter
/**
 * Format a numeric value string, removing unnecessary trailing zeros
 * "0.000000" -> "0", "1.500000" -> "1.5", "1.234567" -> "1.235"
 */
function formatNumericValue(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  // Use up to 3 decimal places, but strip trailing zeros
  return parseFloat(num.toFixed(3)).toString();
}

// Helper function to extract MEASUREMENTTEXT items by category
function getMeasurementTextItems(
  headers: GefHeaders,
  categories: Array<string>,
  fileType: GefFileType,
  extension: GefExtension,
  locale: string = "en"
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];
  const measurementTexts = headers.MEASUREMENTTEXT;

  if (!measurementTexts) return items;

  measurementTexts.forEach(({ id, text }) => {
    const textInfo = findMeasurementTextVariableByFileType(
      id,
      fileType,
      extension
    );
    if (!textInfo) return;

    if (!text || text === "-" || text === "0") return;

    if (textInfo.category === "reserved") return;

    if (!categories.includes(textInfo.category)) return;

    // Decode standardized codes
    const displayValue = decodeMeasurementTextByFileType(
      id,
      text,
      fileType,
      extension
    );

    items.push({ label: getLocalizedDescription(textInfo, locale), value: displayValue });
  });

  return items;
}

interface CompactHeaderProps {
  headers: GefHeaders;
  // fileType: GefFileType;
  onDownload: () => void;
}

export function CompactGefHeader({
  headers,
  // fileType,
  onDownload,
}: CompactHeaderProps) {
  const { t } = useTranslation();
  const testId = headers.TESTID;
  const projectId = headers.PROJECTID;
  const company = headers.COMPANYID;

  const dateTimeStr = headers.STARTDATE
    ? formatDate(headers.STARTDATE, headers.STARTTIME)
    : null;

  const xyid = headers.XYID;
  const wgs84 = xyid ? convertToWGS84(xyid) : null;

  const zid = headers.ZID;
  const heightSystem = zid ? HEIGHT_SYSTEM_MAP[zid.code] : null;
  const elevationValue = zid ? zid.height.toFixed(2) : null;
  const elevationDisplay = zid
    ? `${zid.height.toFixed(2)}m ${heightSystem}`
    : null;

  // Water level (MEASUREMENTVAR 42)
  const waterLevelVar = headers.MEASUREMENTVAR?.find(({ id }) => id === 42);
  const waterLevelValue = waterLevelVar
    ? Number(waterLevelVar.value).toFixed(2)
    : null;

  const endDepthMeasurementVar = headers.MEASUREMENTVAR?.find(
    ({ id }) => id === 16
  );
  const lastScan = headers.LASTSCAN;

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <div className="font-bold text-lg text-gray-900 flex items-center gap-1">
            {testId ?? t("unknownTest")}
            {testId && <CopyButton value={testId} label={t("copyTestId")} />}
          </div>
          {projectId && (
            <div className="text-gray-600 flex items-center gap-1">
              {projectId}
              <CopyButton value={projectId} label={t("copyProjectId")} />
            </div>
          )}
          {company && <div className="text-gray-600">{company.name}</div>}

          <Button
            onPress={() => {
              onDownload();
            }}
            className="px-3 py-2 mt-2 border hover:bg-blue-100 rounded-sm transition-colors"
          >
            {t("downloadCsv")}
          </Button>
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

          {xyid && (
            <>
              <dt className="text-gray-500">{t("locationLabel")}</dt>
              <dd>
                <div className="font-semibold">
                  {COORDINATE_SYSTEMS[xyid.coordinateSystem]?.name ?? t("unknownCoordinateSystem")}{" "}
                  ({COORDINATE_SYSTEMS[xyid.coordinateSystem]?.epsg})
                </div>

                <div className="flex items-center gap-1">
                  {xyid.x.toFixed(2)}, {xyid.y.toFixed(2)}
                  <CopyButton
                    value={`${xyid.x.toFixed(2)}, ${xyid.y.toFixed(2)}`}
                    label={t("copyCoordinates")}
                  />
                </div>

                {wgs84 && (
                  <>
                    <div className="font-semibold">WGS84</div>
                    <div className="flex items-center gap-1">
                      {wgs84.lat.toFixed(6)}, {wgs84.lon.toFixed(6)}
                      <CopyButton
                        value={`${wgs84.lat.toFixed(6)}, ${wgs84.lon.toFixed(6)}`}
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
                  <CopyButton value={elevationValue} label={t("copyElevation")} />
                )}
              </dd>
            </>
          )}

          {waterLevelValue && (
            <>
              <dt className="text-gray-500">{t("waterLevel")}</dt>
              <dd className="flex items-center gap-1">
                {waterLevelValue}m
                <CopyButton value={waterLevelValue} label={t("copyWaterLevel")} />
              </dd>
            </>
          )}

          {endDepthMeasurementVar && (
            <>
              <dt className="text-gray-500">{t("depth")}</dt>
              <dd>
                {Number(endDepthMeasurementVar.value).toFixed(3)} (
                {endDepthMeasurementVar.unit})
              </dd>
            </>
          )}

          {lastScan && (
            <>
              <dt className="text-gray-500">{t("scanNumber")}</dt>
              <dd>{lastScan}</dd>
            </>
          )}
        </dl>
      </div>
    </div>
  );
}

interface DetailedHeaderProps {
  headers: GefHeaders;
  fileType: GefFileType;
}

export function DetailedGefHeaders({ headers, fileType }: DetailedHeaderProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const extension = detectGefExtension(
    headers.MEASUREMENTTEXT?.map((mt) => mt.id),
    headers.MEASUREMENTVAR?.map((v) => v.id)
  );

  const sections = [
    {
      id: "project",
      title: t("projectInformation"),
      items: getProjectInfo(headers, fileType, extension, t),
    },
    {
      id: "test_info",
      title: t("testInformation"),
      items: getTestInfo(headers, fileType, extension, t),
    },
    {
      id: "coordinates",
      title: t("coordinatesLocation"),
      items: getCoordinatesInfo(headers, fileType, extension, t),
    },
    {
      id: "equipment",
      title: t("equipmentCapabilities"),
      items: getEquipmentInfo(headers, fileType, extension, locale),
    },
    {
      id: "conditions",
      title: t("testConditionsRemarks"),
      items: getConditionsInfo(headers, fileType, extension, locale),
    },
    {
      id: "processing",
      title: t("dataProcessing"),
      items: getProcessingInfo(headers, fileType, extension, locale),
    },
    {
      id: "calculations",
      title: t("calculationsFormulas"),
      items: getCalculationsInfo(headers, fileType, extension, locale),
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
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        {t("technicalDetails")}
      </h3>

      {sections.map((section) => (
        <Disclosure
          key={section.id}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <Heading>
            <Button
              slot="trigger"
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors data-[expanded]:bg-gray-100"
            >
              <span className="font-medium text-gray-800">{section.title}</span>
              <span className="text-gray-500 data-[expanded]:hidden">+</span>
              <span className="text-gray-500 hidden data-[expanded]:inline">
                −
              </span>
            </Button>
          </Heading>

          <DisclosurePanel className="p-4 bg-white">
            <dl className="space-y-2">
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
  );
}

function getProjectInfo(
  headers: GefHeaders,
  fileType: GefFileType,
  extension: GefExtension,
  t: TFunction
) {
  const items: Array<HeaderItem> = [];

  if (headers.PROJECTID)
    items.push({ label: t("projectId"), value: headers.PROJECTID });
  if (headers.TESTID) items.push({ label: t("testId"), value: headers.TESTID });

  const company = headers.COMPANYID;
  if (company) {
    items.push({ label: t("company"), value: company.name });
    if (company.address)
      items.push({ label: t("address"), value: company.address });
    if (company.companyId)
      items.push({ label: t("companyId"), value: company.companyId });
  }

  const a = items.concat(
    getMeasurementTextItems(
      headers,
      ["project_info", "standards", "location", "personnel", "data_management", "related_investigations"],
      fileType,
      extension
    )
  );

  return a;
}

function getTestInfo(
  headers: GefHeaders,
  fileType: GefFileType,
  extension: GefExtension,
  t: TFunction
) {
  const items: Array<{ label: string; value: string }> = [];

  if (headers.STARTDATE) {
    items.push({
      label: t("startDate"),
      value: formatDate(headers.STARTDATE),
    });
  }

  if (headers.STARTTIME) {
    const time = headers.STARTTIME;
    items.push({
      label: t("startTime"),
      value: `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(
        2,
        "0"
      )}:${String(time.second).padStart(2, "0")}`,
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
  headers: GefHeaders,
  fileType: GefFileType,
  extension: GefExtension,
  t: TFunction
) {
  const items: Array<HeaderItem> = [];

  items.push(
    ...getMeasurementTextItems(
      headers,
      ["coordinates", "reference_system", "elevation_determination", "position_determination"],
      fileType,
      extension
    )
  );

  const xyid = headers.XYID;
  if (xyid) {
    const coordSystem = COORDINATE_SYSTEMS[xyid.coordinateSystem];

    items.push({
      label: t("coordinateSystem"),
      value: `${coordSystem.name} ${coordSystem.epsg} (${xyid.coordinateSystem})`,
    });

    items.push({
      label: t("xCoordinate"),
      value: `${xyid.x.toFixed()} ± ${xyid.deltaX.toFixed()} m`,
    });

    items.push({
      label: t("yCoordinate"),
      value: `${xyid.y.toFixed()} ± ${xyid.deltaY.toFixed()} m`,
    });
  }

  const zid = headers.ZID;

  if (zid) {
    const heightSystem = HEIGHT_SYSTEM_MAP[zid.code];
    items.push({ label: t("heightSystem"), value: heightSystem });
    items.push({
      label: t("surfaceLevel"),
      value: `${zid.height.toFixed()} ± ${zid.deltaZ.toFixed()} m`,
    });
  }

  return items;
}

function getEquipmentInfo(
  headers: GefHeaders,
  fileType: GefFileType,
  extension: GefExtension,
  locale: string
) {
  const items: Array<HeaderItem> = [];

  items.push(
    ...getMeasurementTextItems(
      headers,
      ["equipment", "drilling_methods", "drilling_equipment", "drilling_segments"],
      fileType,
      extension,
      locale
    )
  );

  headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
    const varInfo = findMeasurementVariableByFileType(id, fileType, extension);
    if (!varInfo || !["equipment", "capabilities", "drilling_equipment", "drilling_segments", "borehole_geometry", "groundwater", "monitoring_wells"].includes(varInfo.category))
      return;

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

function getDataStructure(headers: GefHeaders, t: TFunction) {
  const items: Array<{ label: string; value: ReactNode }> = [];

  if (headers.COLUMN)
    items.push({ label: t("numberOfColumns"), value: String(headers.COLUMN) });

  if (headers.LASTSCAN)
    items.push({ label: t("numberOfScans"), value: String(headers.LASTSCAN) });

  if (headers.DATAFORMAT)
    items.push({ label: t("dataFormat"), value: headers.DATAFORMAT });

  if (headers.COLUMNINFO) {
    // Create a map of column number to min/max values
    const minMaxMap = new Map<number, { min: number; max: number }>();
    headers.COLUMNMINMAX?.forEach(({ columnNumber, min, max }) => {
      minMaxMap.set(columnNumber, { min, max });
    });

    items.push({
      label: t("dataColumns"),
      value: (
        <ul className="list list-disc list-inside">
          {headers.COLUMNINFO.map((col, index) => {
            const colNum = index + 1;
            const minMax = minMaxMap.get(colNum);
            return (
              <li key={col.name}>
                {col.name} ({col.unit})
                {minMax && (
                  <span className="text-gray-500 ml-1">
                    [{minMax.min} – {minMax.max}]
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      ),
    });
  }

  return items;
}

function getCalibrationData(
  headers: GefHeaders,
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

function getFileMetadata(headers: GefHeaders, t: TFunction) {
  const items: Array<{ label: string; value: string }> = [];

  if (headers.GEFID)
    items.push({
      label: t("gefVersion"),
      value: `${headers.GEFID.major}.${headers.GEFID.minor}.${headers.GEFID.patch}`,
    });

  if (headers.REPORTCODE) {
    items.push({
      label: t("reportCode"),
      value: `${headers.REPORTCODE.code} v${headers.REPORTCODE.major}.${headers.REPORTCODE.minor}.${headers.REPORTCODE.patch}`,
    });
  }

  if (headers.FILEDATE) {
    items.push({
      label: t("fileDate"),
      value: formatDate(headers.FILEDATE),
    });
  }

  if (headers.FILEOWNER)
    items.push({ label: t("fileOwner"), value: headers.FILEOWNER });
  if (headers.OS) items.push({ label: t("operatingSystem"), value: headers.OS });

  return items;
}

function getConditionsInfo(
  headers: GefHeaders,
  fileType: GefFileType,
  extension: GefExtension,
  locale: string
) {
  return getMeasurementTextItems(
    headers,
    ["conditions", "general", "infrastructure", "measurements", "sample_condition", "monitoring_wells"],
    fileType,
    extension,
    locale
  );
}

function getProcessingInfo(
  headers: GefHeaders,
  fileType: GefFileType,
  extension: GefExtension,
  locale: string
) {
  return getMeasurementTextItems(headers, ["processing"], fileType, extension, locale);
}

function getCalculationsInfo(
  headers: GefHeaders,
  fileType: GefFileType,
  extension: GefExtension,
  locale: string
) {
  return getMeasurementTextItems(
    headers,
    ["calculations"],
    fileType,
    extension,
    locale
  );
}

function getComments(headers: GefHeaders, t: TFunction) {
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
  headers: GefHeaders,
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
      value: "Dutch BRO/VOTB (GEF-CPT v1.1.3)",
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
      value: "Belgian DOV",
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
