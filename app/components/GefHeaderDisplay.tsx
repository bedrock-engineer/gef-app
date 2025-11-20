import {
  Button,
  Disclosure,
  DisclosurePanel,
  Heading,
} from "react-aria-components";
import { measurementTextIds, measurementVariables } from "../util/gef-metadata";
import {
  COORDINATE_SYSTEMS,
  HEIGHT_SYSTEM_MAP,
  type GefHeaders,
  type XYID,
} from "../util/gef-schemas";
import type { ReactNode } from "react";

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

// Helper function to extract MEASUREMENTTEXT items by category
function getMeasurementTextItems(
  headers: GefHeaders,
  categories: Array<string>
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];
  const measurementTexts = headers.MEASUREMENTTEXT;

  if (!measurementTexts) return items;

  measurementTexts.forEach(({ id, text }) => {
    if (!(id in measurementTextIds)) return;

    const textInfo = measurementTextIds[id as keyof typeof measurementTextIds];

    if (!text || text === "-" || text === "0") return;

    if (textInfo.category === "reserved") return;

    if (!categories.includes(textInfo.category)) return;

    // Decode standardized codes for coordinate methods (IDs 42 & 43)
    let displayValue = text;

    if ("standardizedCodes" in textInfo && textInfo.standardizedCodes) {
      const decoded =
        textInfo.standardizedCodes[
          text as keyof typeof textInfo.standardizedCodes
        ];

      if (decoded) displayValue = `${text} (${decoded})`;
    }

    items.push({ label: textInfo.description, value: displayValue });
  });

  return items;
}

interface CompactHeaderProps {
  headers: GefHeaders;
  onDownload: () => void;
}

export function CompactGefHeader({ headers, onDownload }: CompactHeaderProps) {
  const testId = headers.TESTID;
  const projectId = headers.PROJECTID;
  const company = headers.COMPANYID;

  const dateTimeStr = headers.STARTDATE
    ? formatDate(headers.STARTDATE, headers.STARTTIME)
    : null;

  const xyid = headers.XYID;

  const zid = headers.ZID;
  const heightSystem = zid ? HEIGHT_SYSTEM_MAP[zid.code] || zid.code : null;
  const elevation = zid ? `${zid.height}m ${heightSystem}` : null;

  const endDepthMeasurementVar = headers.MEASUREMENTVAR?.find(
    ({ id }) => id === 16
  );
  const lastScan = headers.LASTSCAN;

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <div className="font-bold text-lg text-gray-900">
            {testId ?? "Unknown Test"}
          </div>
          {projectId && <div className="text-gray-600">{projectId}</div>}
          {company && <div className="text-gray-600">{company.name}</div>}

          <Button
            onPress={() => {
              onDownload();
            }}
            className="px-3 py-2 mt-2 border hover:bg-blue-100 rounded-sm transition-colors"
          >
            Download CSV
          </Button>
        </div>

        <dl
          className="text-gray-700 space-y-1 grid gap-x-2"
          style={{ gridTemplateColumns: "auto 1fr" }}
        >
          {dateTimeStr && (
            <>
              <dt className="text-gray-500">Date:</dt>
              <dd>{dateTimeStr}</dd>
            </>
          )}

          {xyid && <CoordSystemDescription xyid={xyid} />}

          {elevation && (
            <>
              <dt className="text-gray-500">Elevation:</dt>
              <dd>{elevation}</dd>
            </>
          )}

          {endDepthMeasurementVar && (
            <>
              <dt className="text-gray-500">Depth:</dt>
              <dd>
                {endDepthMeasurementVar.value} ({endDepthMeasurementVar.unit})
              </dd>
            </>
          )}

          {lastScan && (
            <>
              <dt className="text-gray-500">Scan #:</dt>
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
}

function CoordSystemDescription({ xyid }: { xyid: NonNullable<XYID> }) {
  const coordSystemCode = xyid.coordinateSystem;

  const coordSystem = COORDINATE_SYSTEMS[coordSystemCode];

  return (
    <>
      <dt className="text-gray-500">Location:</dt>
      <div>
        <dd className="font-mono">
          {coordSystem.name} ({coordSystem.epsg})
        </dd>
        <dd className="font-mono">
          {xyid.x}, {xyid.y}
        </dd>
      </div>
    </>
  );
}

export function DetailedGefHeaders({ headers }: DetailedHeaderProps) {
  const sections = [
    {
      id: "project",
      title: "Project Information",
      items: getProjectInfo(headers),
    },
    {
      id: "test_info",
      title: "Test Information",
      items: getTestInfo(headers),
    },
    {
      id: "coordinates",
      title: "Coordinates & Location",
      items: getCoordinatesInfo(headers),
    },
    {
      id: "equipment",
      title: "Equipment & Capabilities",
      items: getEquipmentInfo(headers),
    },
    {
      id: "conditions",
      title: "Test Conditions & Remarks",
      items: getConditionsInfo(headers),
    },
    {
      id: "processing",
      title: "Data Processing",
      items: getProcessingInfo(headers),
    },
    {
      id: "calculations",
      title: "Calculations & Formulas",
      items: getCalculationsInfo(headers),
    },
    {
      id: "data_structure",
      title: "Data Structure",
      items: getDataStructure(headers),
    },
    {
      id: "calibration",
      title: "Calibration Data",
      items: getCalibrationData(headers),
    },
    {
      id: "metadata",
      title: "File Metadata",
      items: getFileMetadata(headers),
    },
  ].filter((section) => section.items.length > 0);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Technical Details
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

function getProjectInfo(headers: GefHeaders) {
  const items: Array<HeaderItem> = [];

  if (headers.PROJECTID)
    items.push({ label: "Project ID", value: headers.PROJECTID });
  if (headers.TESTID) items.push({ label: "Test ID", value: headers.TESTID });

  const company = headers.COMPANYID;
  if (company) {
    items.push({ label: "Company", value: company.name });
    if (company.address)
      items.push({ label: "Address", value: company.address });
    if (company.companyId)
      items.push({ label: "Company ID", value: company.companyId });
  }

  const a = items.concat(
    getMeasurementTextItems(headers, ["project_info", "standards"])
  );

  return a;
}

function getTestInfo(headers: GefHeaders) {
  const items: Array<{ label: string; value: string }> = [];

  if (headers.STARTDATE) {
    items.push({
      label: "Start Date",
      value: formatDate(headers.STARTDATE),
    });
  }

  if (headers.STARTTIME) {
    const t = headers.STARTTIME;
    items.push({
      label: "Start Time",
      value: `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(
        2,
        "0"
      )}:${String(t.second).padStart(2, "0")}`,
    });
  }

  headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
    const varInfo = measurementVariables.find((v) => v.id === id);

    if (
      varInfo &&
      ["test_type", "test_execution", "site_conditions"].includes(
        varInfo.category
      )
    ) {
      let displayValue = value;
      if ("options" in varInfo && varInfo.options) {
        const option = varInfo.options.find(
          (o) => o.value.toString() === value
        );
        if (option) displayValue = option.meaning;
      }
      items.push({
        label: varInfo.description,
        value: unit && unit !== "-" ? `${displayValue} ${unit}` : displayValue,
      });
    }
  });

  return items;
}

function getCoordinatesInfo(headers: GefHeaders) {
  const items: Array<HeaderItem> = [];

  items.push(...getMeasurementTextItems(headers, ["coordinates"]));

  const xyid = headers.XYID;
  if (xyid) {
    const coordSystem = COORDINATE_SYSTEMS[xyid.coordinateSystem];

    items.push({
      label: "Coordinate System",
      value: `${coordSystem.name} ${coordSystem.epsg} (${xyid.coordinateSystem})`,
    });

    items.push({
      label: "X Coordinate",
      value: `${xyid.x} ± ${xyid.deltaX} m`,
    });

    items.push({
      label: "Y Coordinate",
      value: `${xyid.y} ± ${xyid.deltaY} m`,
    });
  }

  const zid = headers.ZID;

  if (zid) {
    const heightSystem = HEIGHT_SYSTEM_MAP[zid.code];
    items.push({ label: "Height System", value: heightSystem });
    items.push({
      label: "Surface Level",
      value: `${zid.height} ± ${zid.deltaZ} m`,
    });
  }

  return items;
}

function getEquipmentInfo(headers: GefHeaders) {
  const items: Array<HeaderItem> = [];

  items.push(...getMeasurementTextItems(headers, ["equipment"]));

  headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
    const varInfo = measurementVariables.find((v) => v.id === id);
    if (!varInfo || !["equipment", "capabilities"].includes(varInfo.category))
      return;

    let displayValue = value;
    if ("options" in varInfo && varInfo.options) {
      const option = varInfo.options.find(
        (o: any) => o.value.toString() === value
      );
      if (option) {
        displayValue = option.meaning;
      }
    }

    items.push({
      label: varInfo.description,
      value: unit && unit !== "-" ? `${displayValue} ${unit}` : displayValue,
    });
  });

  return items;
}

function getDataStructure(headers: GefHeaders) {
  const items: Array<{ label: string; value: ReactNode }> = [];

  if (headers.COLUMN)
    items.push({ label: "Number of Columns", value: String(headers.COLUMN) });

  if (headers.LASTSCAN)
    items.push({ label: "Number of Scans", value: String(headers.LASTSCAN) });

  if (headers.DATAFORMAT)
    items.push({ label: "Data Format", value: headers.DATAFORMAT });

  if (headers.COLUMNINFO) {
    items.push({
      label: "Data Columns",
      value: (
        <ul className="list list-disc list-inside">
          {headers.COLUMNINFO.map((col) => (
            <li key={col.name}>
              {col.name} ({col.unit})
            </li>
          ))}
        </ul>
      ),
    });
  }

  return items;
}

function getCalibrationData(headers: GefHeaders) {
  const items: Array<{ label: string; value: string }> = [];

  headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
    const varInfo = measurementVariables.find((v) => v.id === id);
    if (varInfo?.category === "calibration" && value !== "0.000000") {
      items.push({
        label: varInfo.description,
        value: unit ? `${value} ${unit}` : value,
      });
    }
  });

  return items;
}

function getFileMetadata(headers: GefHeaders) {
  const items: Array<{ label: string; value: string }> = [];

  if (headers.GEFID)
    items.push({
      label: "GEF Version",
      value: `${headers.GEFID.major}.${headers.GEFID.minor}.${headers.GEFID.patch}`,
    });

  if (headers.REPORTCODE) {
    items.push({
      label: "Report Code",
      value: `${headers.REPORTCODE.code} v${headers.REPORTCODE.major}.${headers.REPORTCODE.minor}.${headers.REPORTCODE.patch}`,
    });
  }

  if (headers.FILEDATE) {
    items.push({
      label: "File Date",
      value: formatDate(headers.FILEDATE),
    });
  }

  if (headers.FILEOWNER)
    items.push({ label: "File Owner", value: headers.FILEOWNER });
  if (headers.OS) items.push({ label: "Operating System", value: headers.OS });

  return items;
}

function getConditionsInfo(headers: GefHeaders) {
  return getMeasurementTextItems(headers, [
    "conditions",
    "general",
    "infrastructure",
    "measurements",
  ]);
}

function getProcessingInfo(headers: GefHeaders) {
  return getMeasurementTextItems(headers, ["processing"]);
}

function getCalculationsInfo(headers: GefHeaders) {
  return getMeasurementTextItems(headers, ["calculations"]);
}
