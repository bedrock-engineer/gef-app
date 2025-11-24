import z from "zod";
import initGefFileToMap, { parse_gef_wasm } from "../pkg/gef_file_to_map.js";
import { convertToWGS84, type WGS84Coords } from "./coordinates";
import { addComputedDepthColumns } from "./depth-correction";
import {
  parseGefBoreData,
  parseGefBoreSpecimens,
  type BoreLayer,
  type BoreSpecimen,
} from "./gef-bore";
import {
  heightDeterminationCodes,
  placeDeterminationCodes,
} from "./gef-common";
import { formatGefDate, formatGefTime } from "./gef-metadata-processed";
import {
  COORDINATE_SYSTEMS,
  HEIGHT_SYSTEMS,
  parseGefHeaders,
  type ColumnInfo,
  type GefHeaders,
  type ZID,
} from "./gef-schemas";

export const DEPTH_KEYWORDS = [
  "penetration",
  "sondeer",
  "length",
  "diepte",
  "lengte",
];

export type GefExtension = "standard" | "dutch" | "belgian";

// CPT Column Quantity IDs - derived from columnQuantities in gef-metadata
// These are the standard GEF quantity numbers for CPT data
export const CPT_QUANTITY = {
  LENGTH: 1,
  CONE_RESISTANCE: 2,
  FRICTION_RESISTANCE: 3,
  FRICTION_NUMBER: 4,
  PORE_PRESSURE_U2: 6,
  INCLINATION: 8,
  CORRECTED_DEPTH: 11,
  CORRECTED_CONE_RESISTANCE: 13,
} as const;

/**
 * Get standardized display name for a column based on its quantity number
 */
function getColumnDisplayName(col: ColumnInfo): string {
  const quantity = cptColumnQuantities.find((q) => q.id === col.quantityNumber);
  if (quantity) {
    return quantity.symbol
      ? `${quantity.name} (${quantity.symbol})`
      : quantity.name;
  }
  return col.name;
}

/**
 * Extract unit code from verbose unit strings like "MPa (megaPascal)" -> "MPa"
 */
function getUnitCode(unit: string): string {
  return unit.split(/\s+/)[0] ?? unit;
}

/**
 * Find column by quantity number
 */
export function findColumnByQuantity(
  columns: Array<ColumnInfo>,
  quantityNumber: number
): ColumnInfo | undefined {
  return columns.find((col) => col.quantityNumber === quantityNumber);
}

export type GEFHeadersMap = Map<string, Array<Array<string>>>;

function parseGefData(dataString: string, headersMap: GEFHeadersMap) {
  const headers = parseGefHeaders(headersMap);
  const lines = dataString.trim().split("\n");
  const columnSeparator = headers.COLUMNSEPARATOR ?? /\s+/;
  const columnInfo = headers.COLUMNINFO ?? [];

  const rows = lines.map((line) =>
    line
      .trim()
      .split(columnSeparator)
      .filter((val) => val.trim() !== "")
      .map((val) => parseFloat(val.trim()))
  );

  // Create void values map from parsed COLUMNVOID
  const voidValuesMap = new Map(
    headers.COLUMNVOID?.map(({ columnNumber, voidValue }) => [
      columnNumber,
      voidValue,
    ]) ?? []
  );

  // Replace void values with null
  const rowsWithoutVoidValues = rows.map((row) =>
    row.map((value, index) => {
      const voidValue = voidValuesMap.get(index + 1);
      return value === voidValue ? null : value;
    })
  );

  // Create object rows with column names
  const columnNames = columnInfo.map((col) => col.name);
  const tidyRows = rowsWithoutVoidValues.map((row) => {
    const entries = columnNames.map((name, i) => [name, row[i]]);
    return Object.fromEntries(entries);
  });

  // Normalize depth values to absolute (some GEF files use negative depths)
  const depthCol = columnInfo.find((col) => {
    const nameLower = col.name.toLowerCase();
    return (
      col.unit === "m" && DEPTH_KEYWORDS.some((kw) => nameLower.includes(kw))
    );
  });

  const normalizedRows: Array<Record<string, number>> = tidyRows.map((row) => {
    if (!depthCol) {
      return row;
    }

    const depthKey = depthCol.name;
    const depthValue = row[depthKey];

    if (typeof depthValue === "number") {
      return { ...row, [depthKey]: Math.abs(depthValue) };
    }
    return row;
  });

  // Add computed depth columns (trueDepth, elevation)
  const dataWithComputedColumns = addComputedDepthColumns(
    normalizedRows,
    columnInfo,
    headers.ZID,
    headers.MEASUREMENTVAR
  );

  return {
    data: dataWithComputedColumns,
    headers,
    columnInfo,
  };
}

interface ChartColumn {
  key: string;
  unit: string;
  name: string;
}

function detectChartAxes(
  columnInfo: Array<ColumnInfo>,
  data: Array<Record<string, number>>,
  zid: ZID | undefined
) {
  // Y-axis: prefer quantity 1 (penetration length), then corrected depth (11), then keyword fallback
  const yColumn =
    findColumnByQuantity(columnInfo, CPT_QUANTITY.LENGTH) ??
    findColumnByQuantity(columnInfo, CPT_QUANTITY.CORRECTED_DEPTH) ??
    columnInfo.find((col) => {
      const nameLower = col.name.toLowerCase();
      return (
        col.unit === "m" && DEPTH_KEYWORDS.some((kw) => nameLower.includes(kw))
      );
    });

  // X-axis candidates: exclude depth column
  const xCandidates = columnInfo.filter(
    (col) => col.colNum !== yColumn?.colNum
  );

  // X-axis: prefer quantity 2 (cone resistance), then corrected cone (13), then friction number (4)
  const xColumn =
    findColumnByQuantity(xCandidates, CPT_QUANTITY.CONE_RESISTANCE) ??
    findColumnByQuantity(xCandidates, CPT_QUANTITY.CORRECTED_CONE_RESISTANCE) ??
    findColumnByQuantity(xCandidates, CPT_QUANTITY.FRICTION_NUMBER) ??
    xCandidates[0];

  // Build available Y-axis options
  const yAxisOptions: Array<ChartColumn> = [];

  // Add original penetration length
  if (yColumn) {
    yAxisOptions.push({
      key: yColumn.name,
      unit: getUnitCode(yColumn.unit),
      name: getColumnDisplayName(yColumn),
    });
  }

  // Add corrected depth from file (quantity 11) if available and different from yColumn
  const correctedDepthCol = findColumnByQuantity(
    columnInfo,
    CPT_QUANTITY.CORRECTED_DEPTH
  );
  if (correctedDepthCol && correctedDepthCol.colNum !== yColumn?.colNum) {
    yAxisOptions.push({
      key: correctedDepthCol.name,
      unit: getUnitCode(correctedDepthCol.unit),
      name: getColumnDisplayName(correctedDepthCol),
    });
  }

  // Add computed true depth if available
  const hasTrueDepth = data.length > 0 && data[0]?.trueDepth !== undefined;
  if (hasTrueDepth) {
    yAxisOptions.push({
      key: "trueDepth",
      unit: "m",
      name: "True Depth (inclination corrected)",
    });
  }

  // Add elevation if ZID is available
  const hasElevation = data.length > 0 && data[0]?.elevation !== undefined;
  if (hasElevation && zid) {
    const heightSystem = HEIGHT_SYSTEMS[zid.code].name;

    yAxisOptions.push({
      key: "elevation",
      unit: `m ${heightSystem}`,
      name: `Elevation (${heightSystem})`,
    });
  }

  return {
    yAxis: yAxisOptions[0] ?? null,
    xAxis: xColumn
      ? {
          key: xColumn.name,
          unit: getUnitCode(xColumn.unit),
          name: getColumnDisplayName(xColumn),
        }
      : null,
    availableColumns: columnInfo.map((col) => ({
      key: col.name,
      unit: getUnitCode(col.unit),
      name: getColumnDisplayName(col),
    })),
    yAxisOptions,
  };
}

export type GefFileType = "CPT" | "BORE";

// Processed metadata for display - computed once during parsing
export interface ProcessedMetadata {
  filename: string;
  fileType: GefFileType;
  wgs84: WGS84Coords | null;
  projectId: string | undefined;
  testId: string | undefined;
  companyName: string | undefined;
  startDate: string | undefined;
  startTime: string | undefined;
  coordinateSystem: {
    code: string;
    name: string;
    nameEn: string;
    epsg: string | null;
  } | null;
  originalX: number | undefined;
  originalY: number | undefined;
  heightSystem: {
    code: string;
    name: string;
    nameEn: string;
    epsg: string | null;
  } | null;
  surfaceElevation: number | undefined;
}

// Pre-excavation layer for CPT files
// Describes soil that was removed before cone penetration testing
export interface PreExcavationLayer {
  depthTop: number; // Top of layer (m)
  depthBottom: number; // Bottom of layer (m) - from SPECIMENVAR value
  description: string; // Soil description
}

export interface GefCptData {
  fileType: "CPT";
  data: Array<Record<string, number>>;
  headers: GefHeaders;
  chartAxes: {
    yAxis: { key: string; unit: string; name: string } | null;
    xAxis: { key: string; unit: string; name: string } | null;
    availableColumns: Array<{ key: string; unit: string; name: string }>;
    yAxisOptions: Array<{ key: string; unit: string; name: string }>;
  };
  preExcavationLayers: Array<PreExcavationLayer>;
  warnings: Array<string>;
  processed: ProcessedMetadata;
}

export interface GefBoreData {
  fileType: "BORE";
  layers: Array<BoreLayer>;
  specimens: Array<BoreSpecimen>;
  headers: GefHeaders;
  warnings: Array<string>;
  processed: ProcessedMetadata;
}

export type GefData = GefCptData | GefBoreData;

// Process raw headers into display-ready metadata
function processMetadata(
  filename: string,
  fileType: GefFileType,
  headers: GefHeaders
): ProcessedMetadata {
  const wgs84 = headers.XYID
    ? convertToWGS84({
        coordinateSystem: headers.XYID.coordinateSystem,
        x: headers.XYID.x,
        y: headers.XYID.y,
      })
    : null;

  const coordinateSystem = headers.XYID
    ? {
        code: headers.XYID.coordinateSystem,
        name: COORDINATE_SYSTEMS[headers.XYID.coordinateSystem].name,
        nameEn: COORDINATE_SYSTEMS[headers.XYID.coordinateSystem].nameEn,
        epsg: COORDINATE_SYSTEMS[headers.XYID.coordinateSystem].epsg,
      }
    : null;

  const heightSystem = headers.ZID
    ? {
        code: headers.ZID.code,
        name: HEIGHT_SYSTEMS[headers.ZID.code].name,
        nameEn: HEIGHT_SYSTEMS[headers.ZID.code].nameEn,
        epsg: HEIGHT_SYSTEMS[headers.ZID.code].epsg,
      }
    : null;

  return {
    filename,
    fileType,
    wgs84,
    projectId: headers.PROJECTID,
    testId: headers.TESTID,
    companyName: headers.COMPANYID?.name,
    startDate: headers.STARTDATE ? formatGefDate(headers.STARTDATE) : undefined,
    startTime: headers.STARTTIME ? formatGefTime(headers.STARTTIME) : undefined,
    coordinateSystem,
    originalX: headers.XYID?.x,
    originalY: headers.XYID?.y,
    heightSystem,
    surfaceElevation: headers.ZID?.height,
  };
}

function generateWarnings(
  headers: GefHeaders,
  headersMap: GEFHeadersMap,
  fileType: GefFileType = "CPT",
  data?: Array<Record<string, number | null>>
): Array<string> {
  const warnings: Array<string> = [];

  // Check for missing or invalid ZID
  const rawZid = headersMap.get("ZID")?.[0];

  if (!rawZid || rawZid.length === 0) {
    warnings.push("Missing ZID (height reference system) - defaulting to NAP");
  } else {
    const heightCode = rawZid[0]?.trim();
    if (heightCode && !(heightCode in HEIGHT_SYSTEMS)) {
      warnings.push(
        `Unknown height system code "${heightCode}" - defaulting to NAP`
      );
    }
    if (rawZid.length < 2) {
      warnings.push("ZID missing height value - defaulting to 0");
    }
  }

  // Check for missing XYID (location)
  if (!headers.XYID) {
    warnings.push("Missing XYID (coordinates) - location unknown");
  }

  // Check for COLUMNINFO missing quantityNumber (4th element per spec)
  const rawColumnInfo = headersMap.get("COLUMNINFO");
  if (rawColumnInfo) {
    const missingQuantityNumbers = rawColumnInfo.filter(
      (col) => col.length < 4
    );
    if (missingQuantityNumbers.length > 0) {
      warnings.push(
        `${missingQuantityNumbers.length} COLUMNINFO entries missing quantity number - defaulting to 0`
      );
    }
  }

  // CPT-specific validations
  if (fileType === "CPT" && headers.COLUMNINFO) {
    const columnInfo = headers.COLUMNINFO;

    // Check for duplicate quantity numbers
    const quantityMap = new Map<number, Array<number>>();
    for (const col of columnInfo) {
      if (col.quantityNumber > 0) {
        const existing = quantityMap.get(col.quantityNumber) ?? [];
        existing.push(col.colNum);
        quantityMap.set(col.quantityNumber, existing);
      }
    }

    for (const [quantityNum, colNums] of quantityMap) {
      if (colNums.length > 1) {
        const quantityInfo = cptColumnQuantities.find(
          (q) => q.id === quantityNum
        );
        const quantityName = quantityInfo?.name ?? `Quantity ${quantityNum}`;
        warnings.push(
          `Duplicate quantity number: ${quantityName} (${quantityNum}) assigned to columns ${colNums.join(", ")}`
        );
      }
    }

    // Check for required parameters (per GEF-CPT spec)
    const hasLength = columnInfo.some(
      (col) => col.quantityNumber === CPT_QUANTITY.LENGTH
    );
    const hasConeResistance = columnInfo.some(
      (col) => col.quantityNumber === CPT_QUANTITY.CONE_RESISTANCE
    );

    if (!hasLength) {
      warnings.push(
        "Missing required parameter: Penetration length (quantity 1)"
      );
    }
    if (!hasConeResistance) {
      warnings.push("Missing required parameter: Cone resistance (quantity 2)");
    }

    // Validate COLUMNMINMAX bounds if present
    const columnMinMax = headers.COLUMNMINMAX;
    if (columnMinMax && data && data.length > 0) {
      for (const { columnNumber, min, max } of columnMinMax) {
        const colInfo = columnInfo.find((c) => c.colNum === columnNumber);
        if (!colInfo) {
          continue;
        }

        const values = data
          .map((row) => row[colInfo.name])
          .filter((v): v is number => v !== null && v !== undefined);

        if (values.length === 0) {
          continue;
        }

        const actualMin = Math.min(...values);
        const actualMax = Math.max(...values);

        if (actualMin < min || actualMax > max) {
          warnings.push(
            `Column ${columnNumber} (${colInfo.name}): actual range [${actualMin.toFixed(3)}, ${actualMax.toFixed(3)}] exceeds declared range [${min}, ${max}]`
          );
        }
      }
    }
  }

  return warnings;
}

function detectFileType(headers: GefHeaders): GefFileType {
  const reportCode = headers.REPORTCODE?.code?.toLowerCase() ?? "";

  // Check for unsupported file types
  if (reportCode.includes("diss")) {
    throw new Error(
      "GEF-DISS-Report (dissipation test) files are not supported"
    );
  }
  if (reportCode.includes("siev")) {
    throw new Error("GEF-SIEVE files are not supported");
  }

  if (reportCode.includes("bore")) {
    return "BORE";
  }
  return "CPT";
}

// Parse pre-excavation layers from SPECIMENVAR in CPT files
// Per spec: value is bottom depth, description is soil type
// Layers are ordered by ID (1, 2, 3...) with each value being the cumulative depth
function parsePreExcavationLayers(
  headers: GefHeaders
): Array<PreExcavationLayer> {
  const specimenVars = headers.SPECIMENVAR ?? [];

  if (specimenVars.length === 0) {
    return [];
  }

  // Sort by ID to ensure correct order
  const sorted = [...specimenVars].sort((a, b) => a.id - b.id);

  const layers: Array<PreExcavationLayer> = [];
  let previousDepth = 0;

  for (const sv of sorted) {
    layers.push({
      depthTop: previousDepth,
      depthBottom: sv.value,
      description: sv.description || sv.unit, // description or fall back to unit field
    });
    previousDepth = sv.value;
  }

  return layers;
}

const gefToMapSchema = z.object({
  data: z.string(),
  headers: z.object({
    headers: z.map(z.string(), z.array(z.array(z.string()))),
  }),
});

export async function parseGefFile(file: File): Promise<GefData> {
  await initGefFileToMap();

  const gefContent = await file.text();
  const gefMap: unknown = parse_gef_wasm(gefContent);

  const a = gefToMapSchema.parse(gefMap);

  // First parse headers to detect file type
  const headersForDetection = parseGefHeaders(a.headers.headers);
  const fileType = detectFileType(headersForDetection);

  if (fileType === "BORE") {
    const { layers, headers } = parseGefBoreData(a.data, a.headers.headers);
    const specimens = parseGefBoreSpecimens(headers);
    const warnings = generateWarnings(headers, a.headers.headers, "BORE");
    const processed = processMetadata(file.name, "BORE", headers);
    return {
      fileType: "BORE",
      layers,
      specimens,
      headers,
      warnings,
      processed,
    };
  }

  // CPT file
  const { data, columnInfo, headers } = parseGefData(a.data, a.headers.headers);
  const chartAxes = detectChartAxes(columnInfo, data, headers.ZID);
  const preExcavationLayers = parsePreExcavationLayers(headers);
  const warnings = generateWarnings(headers, a.headers.headers, "CPT", data);
  const processed = processMetadata(file.name, "CPT", headers);

  return {
    fileType: "CPT",
    data,
    headers,
    chartAxes,
    preExcavationLayers,
    warnings,
    processed,
  };
}

export const cptColumnQuantities = [
  {
    id: 1,
    name: "Penetration length",
    nameNl: "Sondeerlengte",
    unit: "m",
    description: "Depth of cone tip below fixed horizontal surface",
    descriptionNl: "Diepte van conuspunt onder vast horizontaal oppervlak",
    required: true,
    category: "primary",
    symbol: null,
  },
  {
    id: 2,
    name: "Measured cone resistance",
    nameNl: "Gemeten conusweerstand",
    unit: "MPa",
    description: "Direct cone tip resistance measurement",
    descriptionNl: "Directe conuspunt weerstandsmeting",
    required: true,
    category: "primary",
    symbol: "qc",
  },
  {
    id: 3,
    name: "Friction resistance",
    nameNl: "Wrijvingsweerstand",
    unit: "MPa",
    description: "Sleeve friction measurement",
    descriptionNl: "Mantelwrijvingsmeting",
    required: false,
    category: "friction",
    symbol: null,
  },
  {
    id: 4,
    name: "Friction number",
    nameNl: "Wrijvingsgetal",
    unit: "%",
    description: "Friction ratio percentage",
    descriptionNl: "Wrijvingsratio percentage",
    required: false,
    category: "friction",
    symbol: null,
  },
  {
    id: 5,
    name: "Pore pressure u1",
    nameNl: "Waterspanning u1",
    unit: "MPa",
    description: "Pore pressure at cone tip",
    descriptionNl: "Waterspanning bij conuspunt",
    required: false,
    category: "pore_pressure",
    symbol: "u1",
  },
  {
    id: 6,
    name: "Pore pressure u2",
    nameNl: "Waterspanning u2",
    unit: "MPa",
    description: "Pore pressure at cone shoulder",
    descriptionNl: "Waterspanning bij conusschouder",
    required: false,
    category: "pore_pressure",
    symbol: "u2",
  },
  {
    id: 7,
    name: "Pore pressure u3",
    nameNl: "Waterspanning u3",
    unit: "MPa",
    description: "Pore pressure at friction sleeve",
    descriptionNl: "Waterspanning bij wrijvingsmantel",
    required: false,
    category: "pore_pressure",
    symbol: "u3",
  },
  {
    id: 8,
    name: "Inclination (resultant)",
    nameNl: "Helling (resultante)",
    unit: "degrees",
    description: "Total inclination from vertical",
    descriptionNl: "Totale helling t.o.v. verticaal",
    required: false,
    category: "inclination",
    symbol: null,
  },
  {
    id: 9,
    name: "Inclination N-S",
    nameNl: "Helling N-Z",
    unit: "degrees",
    description: "North-South inclination component",
    descriptionNl: "Noord-Zuid hellingscomponent",
    required: false,
    category: "inclination",
    symbol: null,
  },
  {
    id: 10,
    name: "Inclination E-W",
    nameNl: "Helling O-W",
    unit: "degrees",
    description: "East-West inclination component",
    descriptionNl: "Oost-West hellingscomponent",
    required: false,
    category: "inclination",
    symbol: null,
  },
  {
    id: 11,
    name: "Corrected depth",
    nameNl: "Gecorrigeerde diepte",
    unit: "m",
    description: "Corrected depth below fixed horizontal surface",
    descriptionNl: "Gecorrigeerde diepte onder vast horizontaal oppervlak",
    required: false,
    category: "calculated",
    symbol: null,
  },
  {
    id: 12,
    name: "Time",
    nameNl: "Tijd",
    unit: "s",
    description: "Time of measurement",
    descriptionNl: "Tijd van meting",
    required: false,
    category: "measurement_info",
    symbol: null,
  },
  {
    id: 13,
    name: "Corrected cone resistance",
    nameNl: "Gecorrigeerde conusweerstand",
    unit: "MPa",
    description: "Cone resistance corrected for pore pressure effects",
    descriptionNl: "Conusweerstand gecorrigeerd voor waterspanningseffecten",
    required: false,
    category: "calculated",
    symbol: "qt",
  },
  {
    id: 14,
    name: "Net cone resistance",
    nameNl: "Netto conusweerstand",
    unit: "MPa",
    description: "Net cone resistance",
    descriptionNl: "Netto conusweerstand",
    required: false,
    category: "calculated",
    symbol: "qn",
  },
  {
    id: 15,
    name: "Pore ratio",
    nameNl: "Poriënratio",
    unit: "-",
    description: "Pore pressure ratio",
    descriptionNl: "Waterspanningsratio",
    required: false,
    category: "calculated",
    symbol: "Bq",
  },
  {
    id: 16,
    name: "Cone resistance number",
    nameNl: "Conusweerstandsgetal",
    unit: "-",
    description: "Normalized cone resistance",
    descriptionNl: "Genormaliseerde conusweerstand",
    required: false,
    category: "calculated",
    symbol: "Nm",
  },
  {
    id: 17,
    name: "Weight per unit volume",
    nameNl: "Volumegewicht",
    unit: "kN/m³",
    description: "Unit weight of soil",
    descriptionNl: "Volumegewicht van grond",
    required: false,
    category: "soil_properties",
    symbol: "γ",
  },
  {
    id: 18,
    name: "In-situ initial pore pressure",
    nameNl: "In-situ initiële waterspanning",
    unit: "MPa",
    description: "Initial pore water pressure",
    descriptionNl: "Initiële poriënwaterdruk",
    required: false,
    category: "soil_properties",
    symbol: "u0",
  },
  {
    id: 19,
    name: "Total vertical soil pressure",
    nameNl: "Totale verticale grondspanning",
    unit: "MPa",
    description: "Total overburden stress",
    descriptionNl: "Totale deklaagspanning",
    required: false,
    category: "soil_properties",
    symbol: "σv0",
  },
  {
    id: 20,
    name: "Effective vertical soil pressure",
    nameNl: "Effectieve verticale grondspanning",
    unit: "MPa",
    description: "Effective overburden stress",
    descriptionNl: "Effectieve deklaagspanning",
    required: false,
    category: "soil_properties",
    symbol: "σ'v0",
  },
  {
    id: 21,
    name: "Inclination in X direction",
    nameNl: "Helling in X-richting",
    unit: "degrees",
    description: "X-direction inclination component",
    descriptionNl: "X-richting hellingscomponent",
    required: false,
    category: "inclination",
    symbol: null,
  },
  {
    id: 22,
    name: "Inclination in Y direction",
    nameNl: "Helling in Y-richting",
    unit: "degrees",
    description: "Y-direction inclination component",
    descriptionNl: "Y-richting hellingscomponent",
    required: false,
    category: "inclination",
    symbol: null,
  },
  {
    id: 23,
    name: "Electric conductivity",
    nameNl: "Elektrische geleidbaarheid",
    unit: "S/m",
    description: "Electrical conductivity measurement",
    descriptionNl: "Elektrische geleidbaarheidsmeting",
    required: false,
    category: "additional_measurements",
    symbol: null,
  },
  {
    id: 24,
    name: "Reserved for future use",
    nameNl: "Gereserveerd voor toekomstig gebruik",
    unit: null,
    description: "Reserved slot",
    descriptionNl: "Gereserveerde positie",
    required: false,
    category: "reserved",
    symbol: null,
  },
  {
    id: 25,
    name: "Reserved for future use",
    nameNl: "Gereserveerd voor toekomstig gebruik",
    unit: null,
    description: "Reserved slot",
    descriptionNl: "Gereserveerde positie",
    required: false,
    category: "reserved",
    symbol: null,
  },
  {
    id: 26,
    name: "Reserved for future use",
    nameNl: "Gereserveerd voor toekomstig gebruik",
    unit: null,
    description: "Reserved slot",
    descriptionNl: "Gereserveerde positie",
    required: false,
    category: "reserved",
    symbol: null,
  },
  {
    id: 27,
    name: "Reserved for future use",
    nameNl: "Gereserveerd voor toekomstig gebruik",
    unit: null,
    description: "Reserved slot",
    descriptionNl: "Gereserveerde positie",
    required: false,
    category: "reserved",
    symbol: null,
  },
  {
    id: 28,
    name: "Reserved for future use",
    nameNl: "Gereserveerd voor toekomstig gebruik",
    unit: null,
    description: "Reserved slot",
    descriptionNl: "Gereserveerde positie",
    required: false,
    category: "reserved",
    symbol: null,
  },
  {
    id: 29,
    name: "Reserved for future use",
    nameNl: "Gereserveerd voor toekomstig gebruik",
    unit: null,
    description: "Reserved slot",
    descriptionNl: "Gereserveerde positie",
    required: false,
    category: "reserved",
    symbol: null,
  },
  {
    id: 30,
    name: "Reserved for future use",
    nameNl: "Gereserveerd voor toekomstig gebruik",
    unit: null,
    description: "Reserved slot",
    descriptionNl: "Gereserveerde positie",
    required: false,
    category: "reserved",
    symbol: null,
  },
  {
    id: 31,
    name: "Magnetic field strength Bx",
    nameNl: "Magnetische veldsterkte Bx",
    unit: "nT",
    description: "Magnetic field strength in X direction",
    descriptionNl: "Magnetische veldsterkte in X-richting",
    required: false,
    category: "magnetic_measurements",
    symbol: "Bx",
  },
  {
    id: 32,
    name: "Magnetic field strength By",
    nameNl: "Magnetische veldsterkte By",
    unit: "nT",
    description: "Magnetic field strength in Y direction",
    descriptionNl: "Magnetische veldsterkte in Y-richting",
    required: false,
    category: "magnetic_measurements",
    symbol: "By",
  },
  {
    id: 33,
    name: "Magnetic field strength Bz",
    nameNl: "Magnetische veldsterkte Bz",
    unit: "nT",
    description: "Magnetic field strength in Z direction",
    descriptionNl: "Magnetische veldsterkte in Z-richting",
    required: false,
    category: "magnetic_measurements",
    symbol: "Bz",
  },
  {
    id: 34,
    name: "Total magnetic field strength",
    nameNl: "Totale magnetische veldsterkte",
    unit: "nT",
    description: "Total magnetic field strength",
    descriptionNl: "Totale magnetische veldsterkte",
    required: false,
    category: "magnetic_measurements",
    symbol: "Btot",
  },
  {
    id: 35,
    name: "Magnetic inclination",
    nameNl: "Magnetische inclinatie",
    unit: "degrees",
    description: "Magnetic field inclination angle",
    descriptionNl: "Magnetische veld inclinatiehoek",
    required: false,
    category: "magnetic_measurements",
    symbol: null,
  },
  {
    id: 36,
    name: "Magnetic declination",
    nameNl: "Magnetische declinatie",
    unit: "degrees",
    description: "Magnetic field declination angle",
    descriptionNl: "Magnetische veld declinatiehoek",
    required: false,
    category: "magnetic_measurements",
    symbol: null,
  },
  // DOV (Belgian) column quantities
  {
    id: 128,
    name: "Totale weerstand",
    nameNl: "Totale weerstand",
    unit: "MPa",
    description: "Totale conusweerstand Qt",
    descriptionNl: "Totale conusweerstand Qt",
    required: false,
    category: "dov_measurements",
    symbol: "Qt",
  },
  {
    id: 129,
    name: "Temperatuur",
    nameNl: "Temperatuur",
    unit: "°C",
    description: "Temperatuurmeting",
    descriptionNl: "Temperatuurmeting",
    required: false,
    category: "dov_measurements",
    symbol: "T",
  },
] as const;

export const cptMeasurementVariables = [
  {
    id: 1,
    defaultValue: 1000,
    unit: "mm²",
    description: "Nominal surface area of cone tip",
    descriptionNl: "Nominaal oppervlak van conuspunt",
    category: "equipment",
    dataType: "float",
  },
  {
    id: 2,
    defaultValue: 15000,
    unit: "mm²",
    description: "Nominal surface area of friction sleeve",
    descriptionNl: "Nominaal oppervlak van wrijvingsmantel",
    category: "equipment",
    dataType: "float",
  },
  {
    id: 3,
    defaultValue: null,
    unit: "-",
    description: "Net surface area quotient of cone tip",
    descriptionNl: "Netto oppervlaktequotiënt van conuspunt",
    category: "equipment",
    dataType: "float",
  },
  {
    id: 4,
    defaultValue: null,
    unit: "-",
    description: "Net surface area quotient of friction sleeve",
    descriptionNl: "Netto oppervlaktequotiënt van wrijvingsmantel",
    category: "equipment",
    dataType: "float",
  },
  {
    id: 5,
    defaultValue: 100,
    unit: "mm",
    description: "Distance of cone to centre of friction sleeve",
    descriptionNl: "Afstand van conus tot midden wrijvingsmantel",
    category: "equipment",
    dataType: "float",
  },
  {
    id: 6,
    defaultValue: null,
    unit: "-",
    description: "Friction present",
    descriptionNl: "Wrijving aanwezig",
    category: "capabilities",
    dataType: "enum",
    options: [
      { value: 0, meaning: "no" },
      { value: 1, meaning: "yes" },
    ],
  },
  {
    id: 7,
    defaultValue: null,
    unit: "-",
    description: "PPT u1 present",
    descriptionNl: "PPT u1 aanwezig",
    category: "capabilities",
    dataType: "enum",
    options: [
      { value: 0, meaning: "no" },
      { value: 1, meaning: "yes" },
    ],
  },
  {
    id: 8,
    defaultValue: null,
    unit: "-",
    description: "PPT u2 present",
    descriptionNl: "PPT u2 aanwezig",
    category: "capabilities",
    dataType: "enum",
    options: [
      { value: 0, meaning: "no" },
      { value: 1, meaning: "yes" },
    ],
  },
  {
    id: 9,
    defaultValue: null,
    unit: "-",
    description: "PPT u3 present",
    descriptionNl: "PPT u3 aanwezig",
    category: "capabilities",
    dataType: "enum",
    options: [
      { value: 0, meaning: "no" },
      { value: 1, meaning: "yes" },
    ],
  },
  {
    id: 10,
    defaultValue: null,
    unit: "-",
    description: "Inclination measurement present",
    descriptionNl: "Hellingsmeting aanwezig",
    category: "capabilities",
    dataType: "enum",
    options: [
      { value: 0, meaning: "no" },
      { value: 1, meaning: "yes" },
    ],
  },
  {
    id: 11,
    defaultValue: null,
    unit: "-",
    description: "Use of back-flow compensator",
    descriptionNl: "Gebruik van terugstroomcompensator",
    category: "equipment",
    dataType: "enum",
    options: [
      { value: 0, meaning: "no" },
      { value: 1, meaning: "yes" },
    ],
  },
  {
    id: 12,
    defaultValue: null,
    unit: "-",
    description: "Type of cone penetration test",
    descriptionNl: "Type conuspenetratietest",
    category: "test_type",
    dataType: "enum",
    options: [
      { value: 0, meaning: "electronic penetration test" },
      { value: 1, meaning: "mechanical discontinue" },
      { value: 2, meaning: "mechanical continue" },
    ],
  },
  {
    id: 13,
    defaultValue: null,
    unit: "m",
    description: "Pre-excavated depth",
    descriptionNl: "Voorontgraven diepte",
    category: "site_conditions",
    dataType: "float",
  },
  {
    id: 14,
    defaultValue: null,
    unit: "m",
    description:
      "Groundwater level (with respect to datum of height system in ZID)",
    descriptionNl: "Grondwaterstand (t.o.v. datum van hoogtestelsel in ZID)",
    category: "site_conditions",
    dataType: "float",
  },
  {
    id: 15,
    defaultValue: null,
    unit: "m",
    description: "Water depth (for offshore activities)",
    descriptionNl: "Waterdiepte (voor offshore activiteiten)",
    category: "site_conditions",
    dataType: "float",
  },
  {
    id: 16,
    defaultValue: null,
    unit: "m",
    description: "End depth of penetration test",
    descriptionNl: "Einddiepte van penetratietest",
    category: "test_execution",
    dataType: "float",
  },
  {
    id: 17,
    defaultValue: null,
    unit: "-",
    description: "Stop criteria",
    descriptionNl: "Stopcriteria",
    category: "test_execution",
    dataType: "enum",
    options: [
      { value: 0, meaning: "end depth reached" },
      { value: 1, meaning: "max. penetration force" },
      { value: 2, meaning: "cone value" },
      { value: 3, meaning: "max. friction value" },
      { value: 4, meaning: "max. PPT value" },
      { value: 5, meaning: "max. inclination value" },
      { value: 6, meaning: "obstacle" },
      { value: 7, meaning: "danger of buckling" },
    ],
  },
  {
    id: 20,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement of cone before penetration test",
    descriptionNl: "Nulmeting van conus vóór penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 21,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement of cone after penetration test",
    descriptionNl: "Nulmeting van conus na penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 22,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement friction before penetration test",
    descriptionNl: "Nulmeting wrijving vóór penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 23,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement friction after penetration test",
    descriptionNl: "Nulmeting wrijving na penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 24,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement PPT u1 before penetration test",
    descriptionNl: "Nulmeting PPT u1 vóór penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 25,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement PPT u1 after penetration test",
    descriptionNl: "Nulmeting PPT u1 na penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 26,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement PPT u2 before penetration test",
    descriptionNl: "Nulmeting PPT u2 vóór penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 27,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement PPT u2 after penetration test",
    descriptionNl: "Nulmeting PPT u2 na penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 28,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement PPT u3 before penetration test",
    descriptionNl: "Nulmeting PPT u3 vóór penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 29,
    defaultValue: null,
    unit: "MPa",
    description: "Zero measurement PPT u3 after penetration test",
    descriptionNl: "Nulmeting PPT u3 na penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 30,
    defaultValue: null,
    unit: "degrees",
    description: "Zero measurement inclination before penetration test",
    descriptionNl: "Nulmeting helling vóór penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 31,
    defaultValue: null,
    unit: "degrees",
    description: "Zero measurement inclination after penetration test",
    descriptionNl: "Nulmeting helling na penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 32,
    defaultValue: null,
    unit: "degrees",
    description: "Zero measurement inclination NS before penetration test",
    descriptionNl: "Nulmeting helling NZ vóór penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 33,
    defaultValue: null,
    unit: "degrees",
    description: "Zero measurement inclination NS after penetration test",
    descriptionNl: "Nulmeting helling NZ na penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 34,
    defaultValue: null,
    unit: "degrees",
    description: "Zero measurement inclination EW before penetration test",
    descriptionNl: "Nulmeting helling OW vóór penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 35,
    defaultValue: null,
    unit: "degrees",
    description: "Zero measurement inclination EW after penetration test",
    descriptionNl: "Nulmeting helling OW na penetratietest",
    category: "calibration",
    dataType: "float",
  },
  {
    id: 41,
    defaultValue: null,
    unit: "km",
    description: "Mileage",
    descriptionNl: "Kilometrering",
    category: "location",
    dataType: "float",
  },
  {
    id: 42,
    defaultValue: null,
    unit: "degrees",
    description: "Orientation between X axis inclination and North",
    descriptionNl: "Oriëntatie tussen X-as helling en Noord",
    category: "location",
    dataType: "float",
  },
] as const;

export const cptMeasurementTextVariables = [
  {
    id: 1,
    description: "Client",
    descriptionNl: "Opdrachtgever",
    category: "project_info",
    example: "ABC Engineering Company",
  },
  {
    id: 2,
    description: "Name of the project",
    descriptionNl: "Naam van het project",
    category: "project_info",
    example: "Highway A1 Extension",
  },
  {
    id: 3,
    description: "Name of the location",
    descriptionNl: "Naam van de locatie",
    category: "project_info",
    example: "Rotterdam Port Area",
  },
  {
    id: 4,
    description: "Cone type and serial number",
    descriptionNl: "Conustype en serienummer",
    category: "equipment",
    example: "Fugro Type A, Serial 12345",
  },
  {
    id: 5,
    description: "Mass and geometry of probe apparatus, including anchoring",
    descriptionNl:
      "Massa en geometrie van sondeerinstallatie, inclusief verankering",
    category: "equipment",
    example: "Mass: 2500kg, Length: 15m, Anchoring: hydraulic",
  },
  {
    id: 6,
    description: "Applied standard, including class",
    descriptionNl: "Toegepaste norm, inclusief klasse",
    category: "standards",
    example: "NEN 5140 Class 1, NEN 3680",
  },
  {
    id: 7,
    description: "Own coordinate system",
    descriptionNl: "Eigen coördinatenstelsel",
    category: "coordinates",
    example: "Local site grid, origin at building corner",
  },
  {
    id: 8,
    description: "Own reference level",
    descriptionNl: "Eigen referentieniveau",
    category: "coordinates",
    example: "Site datum +5.00m above MSL",
  },
  {
    id: 9,
    description: "Fixed horizontal level (usually: ground level or flow bed)",
    descriptionNl: "Vast horizontaal niveau (meestal: maaiveld of stroombed)",
    category: "coordinates",
    example: "+2.35m NAP",
  },
  {
    id: 10,
    description:
      "Orientation direction biaxial inclination measurement (N-direction)",
    descriptionNl: "Oriëntatierichting biaxiale hellingsmeting (N-richting)",
    category: "measurements",
    example: "North = 0°, magnetic declination +2°",
  },
  {
    id: 11,
    description: "Unusual circumstances",
    descriptionNl: "Bijzondere omstandigheden",
    category: "conditions",
    example: "Heavy rain during test, vibrations from nearby construction",
  },
  {
    id: 12,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 13,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 14,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 15,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 16,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 17,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 18,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 19,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 20,
    description: "Correction method for zero drift",
    descriptionNl: "Correctiemethode voor nuldrift",
    category: "processing",
    example: "Linear interpolation between pre/post zero measurements",
  },
  {
    id: 21,
    description: "Method for processing interruptions",
    descriptionNl: "Methode voor verwerking van onderbrekingen",
    category: "processing",
    example: "Data gap filled using adjacent measurements",
  },
  {
    id: 22,
    description: "Remarks",
    descriptionNl: "Opmerkingen",
    category: "general",
    example: "Test performed according to project specifications",
  },
  {
    id: 23,
    description: "Remarks",
    descriptionNl: "Opmerkingen",
    category: "general",
    example: "Groundwater encountered at 3.2m depth",
  },
  {
    id: 24,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 25,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 26,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 27,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 28,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 29,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 30,
    description: "Calculation formula or reference for column number",
    descriptionNl: "Berekeningsformule of referentie voor kolomnummer",
    category: "calculations",
    example: "Friction ratio = (fs/qc) × 100%",
  },
  {
    id: 31,
    description: "Calculation formula or reference for column number",
    descriptionNl: "Berekeningsformule of referentie voor kolomnummer",
    category: "calculations",
    example: "Corrected cone resistance = qc + u2(1-a)",
  },
  {
    id: 32,
    description: "Calculation formula or reference for column number",
    descriptionNl: "Berekeningsformule of referentie voor kolomnummer",
    category: "calculations",
    example: "Net cone resistance = qc - σvo",
  },
  {
    id: 33,
    description: "Calculation formula or reference for column number",
    descriptionNl: "Berekeningsformule of referentie voor kolomnummer",
    category: "calculations",
    example: "Pore pressure ratio = (u2 - u0) / (qc - σvo)",
  },
  {
    id: 34,
    description: "Calculation formula or reference for column number",
    descriptionNl: "Berekeningsformule of referentie voor kolomnummer",
    category: "calculations",
    example:
      "Soil behavior type index = sqrt((3.47-log10(Qt))^2 + (log10(Fr)+1.22)^2)",
  },
  {
    id: 35,
    description: "Calculation formula or reference for column number",
    descriptionNl: "Berekeningsformule of referentie voor kolomnummer",
    category: "calculations",
    example: "Normalized cone resistance = (qc - σvo) / σ'vo",
  },
  {
    id: 36,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 37,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 38,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 39,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 40,
    description: "Reserved for future use",
    descriptionNl: "Gereserveerd voor toekomstig gebruik",
    category: "reserved",
    example: null,
  },
  {
    id: 41,
    description: "Highway, railway or dike code",
    descriptionNl: "Rijksweg-, spoorweg- of dijkcode",
    category: "infrastructure",
    example: "Railway line A16, km 23.4",
  },
  {
    id: 42,
    description: "Method for determination of ZID (height)",
    descriptionNl: "Methode voor bepaling van ZID (hoogte)",
    category: "coordinates",
    example: "MMET (Measured, surveying)",
    standardizedCodes: heightDeterminationCodes,
  },
  {
    id: 43,
    description: "Method for determination of XYID (position)",
    descriptionNl: "Methode voor bepaling van XYID (positie)",
    category: "coordinates",
    example: "LMET (Measured, surveying)",
    standardizedCodes: placeDeterminationCodes,
  },
  {
    id: 44,
    description: "Orientation of X axis of inclination measurement",
    descriptionNl: "Oriëntatie van X-as van hellingsmeting",
    category: "measurements",
    example: "X-axis aligned with magnetic north",
  },
] as const;

export type CptMeasurementVariable = (typeof cptMeasurementVariables)[number];
export type CptMeasurementTextVariable =
  (typeof cptMeasurementTextVariables)[number];

// =============================================================================
// DUTCH EXTENSIONS (BRO + VOTB)
// BRO: Basis Registratie Ondergrond - regulatory submission fields
// VOTB: Vereniging Ondernemers Technisch Bodemonderzoek - industry fields
// =============================================================================

export const dutchMeasurementTextVariables = [
  // BRO fields (101-114 submission, 115-128 registration tracking)
  {
    id: 101,
    description: "Data holder",
    descriptionNl: "Bronhouder",
    category: "bro_submission",
    example: "Bronhouder, 52605825, 31",
  },
  {
    id: 102,
    description: "Delivery framework",
    descriptionNl: "Kader aanlevering",
    category: "bro_submission",
    example: "opdracht publieke taakuitvoering",
  },
  {
    id: 103,
    description: "Investigation purpose",
    descriptionNl: "Kader inwinning",
    category: "bro_submission",
    example: "overig onderzoek",
  },
  {
    id: 104,
    description: "Location surveyor",
    descriptionNl: "Uitvoerder locatiebepaling",
    category: "bro_submission",
    example: "24257098, 31",
  },
  {
    id: 105,
    description: "Location determination date",
    descriptionNl: "Datum locatiebepaling",
    category: "bro_submission",
    example: "2019, 01, 29",
  },
  {
    id: 106,
    description: "Elevation surveyor",
    descriptionNl: "Uitvoerder verticale positiebepaling",
    category: "bro_submission",
    example: "24257098, 31",
  },
  {
    id: 107,
    description: "Elevation determination date",
    descriptionNl: "Datum verticale positiebepaling",
    category: "bro_submission",
    example: "2019, 01, 29",
  },
  {
    id: 108,
    description: "Surface conditions",
    descriptionNl: "Hoedanigheid oppervlakte",
    category: "bro_submission",
    example: "verhard",
  },
  {
    id: 109,
    description: "Dissipation test performed",
    descriptionNl: "Dissipatietest uitgevoerd",
    category: "bro_submission",
    example: "nee",
  },
  {
    id: 110,
    description: "Expert correction performed",
    descriptionNl: "Expertcorrectie uitgevoerd",
    category: "bro_submission",
    example: "ja",
  },
  {
    id: 111,
    description: "Additional investigation performed",
    descriptionNl: "Aanvullend onderzoek uitgevoerd",
    category: "bro_submission",
    example: "nee",
  },
  {
    id: 112,
    description: "Reporting date",
    descriptionNl: "Rapportagedatum onderzoek",
    category: "bro_submission",
    example: "2019, 01, 31",
  },
  {
    id: 113,
    description: "Last processing date",
    descriptionNl: "Datum laatste bewerking",
    category: "bro_submission",
    example: "2019, 01, 30",
  },
  {
    id: 114,
    description: "Investigation date",
    descriptionNl: "Datum onderzoek",
    category: "bro_submission",
    example: "2019, 01, 29",
  },
  {
    id: 115,
    description: "Quality regime",
    descriptionNl: "Kwaliteitsregime",
    category: "bro_registration",
    example: "IMBRO/A",
  },
  {
    id: 116,
    description: "Registration timestamp",
    descriptionNl: "Tijdstip registratie object",
    category: "bro_registration",
    example: "2019-02-15T10:30:00",
  },
  {
    id: 117,
    description: "Registration status",
    descriptionNl: "Registratiestatus",
    category: "bro_registration",
    example: "voltooid",
  },
  {
    id: 118,
    description: "Registration completion timestamp",
    descriptionNl: "Tijdstip voltooiing registratie",
    category: "bro_registration",
    example: "2019-02-15T10:30:00",
  },
  {
    id: 119,
    description: "Corrected indicator",
    descriptionNl: "Gecorrigeerd",
    category: "bro_registration",
    example: "nee",
  },
  {
    id: 120,
    description: "Last correction timestamp",
    descriptionNl: "Tijdstip laatste correctie",
    category: "bro_registration",
    example: null,
  },
  {
    id: 121,
    description: "Under investigation",
    descriptionNl: "In onderzoek",
    category: "bro_registration",
    example: "nee",
  },
  {
    id: 122,
    description: "Under investigation since",
    descriptionNl: "In onderzoek sinds",
    category: "bro_registration",
    example: null,
  },
  {
    id: 123,
    description: "Removed from registration",
    descriptionNl: "Uit registratie genomen",
    category: "bro_registration",
    example: "nee",
  },
  {
    id: 124,
    description: "Removal timestamp",
    descriptionNl: "Tijdstip uit registratie genomen",
    category: "bro_registration",
    example: null,
  },
  {
    id: 125,
    description: "Re-registered",
    descriptionNl: "Weer in registratie genomen",
    category: "bro_registration",
    example: "nee",
  },
  {
    id: 126,
    description: "Re-registration timestamp",
    descriptionNl: "Tijdstip weer in registratie genomen",
    category: "bro_registration",
    example: null,
  },
  {
    id: 127,
    description: "Standardized location reference system",
    descriptionNl: "Gestandaardiseerde locatie referentiestelsel",
    category: "bro_registration",
    example: "EPSG:28992",
  },
  {
    id: 128,
    description: "Coordinate transformation",
    descriptionNl: "Coördinaattransformatie",
    category: "bro_registration",
    example: "nee",
  },
  // VOTB fields (1100+)
  {
    id: 1100,
    description: "Filter material type for pore pressure filter",
    descriptionNl: "Type filtermateriaal voor waterspanningsfilter",
    category: "votb_equipment",
    example: "sintered steel",
  },
  {
    id: 1101,
    description: "Use of friction reducer",
    descriptionNl: "Gebruik kleefbreker",
    category: "votb_equipment",
    example: "ja",
  },
  {
    id: 1102,
    description: "Type of friction reducer",
    descriptionNl: "Type kleefbreker",
    category: "votb_equipment",
    example: "mechanical",
  },
  {
    id: 1103,
    description: "Fluid type for wash boring",
    descriptionNl: "Type vloeistof bij spoelsondering",
    category: "votb_equipment",
    example: "water",
  },
  {
    id: 1104,
    description: "Inclinometer position",
    descriptionNl: "Positie hellingmeter",
    category: "votb_equipment",
    example: "in cone",
  },
  {
    id: 1105,
    description: "Dissipation test with closed pressure clamp",
    descriptionNl: "Dissipatietest met gesloten drukklem",
    category: "votb_test",
    example: "nee",
  },
  {
    id: 1106,
    description: "Postal code for project location",
    descriptionNl: "Postcode voor de projectlocatie",
    category: "votb_location",
    example: "3011 AA",
  },
  {
    id: 1107,
    description: "Street name of project location",
    descriptionNl: "Straatnaam van de projectlocatie",
    category: "votb_location",
    example: "Coolsingel",
  },
  {
    id: 1108,
    description: "City of project location",
    descriptionNl: "Plaats van de projectlocatie",
    category: "votb_location",
    example: "Rotterdam",
  },
  {
    id: 1109,
    description: "Province of project location",
    descriptionNl: "Provincie waarin de projectlocatie is gelegen",
    category: "votb_location",
    example: "Zuid-Holland",
  },
  {
    id: 1110,
    description: "Country of project",
    descriptionNl: "Land waar het project in is gelegen",
    category: "votb_location",
    example: "Nederland",
  },
] as const;

export const dutchMeasurementVariables = [
  // BRO measurement variables (101-130)
  {
    id: 101,
    unit: "m",
    description: "Penetration length",
    descriptionNl: "Sondeertrajectlengte",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 102,
    unit: "m",
    description: "Depth",
    descriptionNl: "Diepte",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 103,
    unit: "s",
    description: "Elapsed time",
    descriptionNl: "Verlopen tijd",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 104,
    unit: "MPa",
    description: "Cone resistance",
    descriptionNl: "Conusweerstand",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 105,
    unit: "MPa",
    description: "Corrected cone resistance",
    descriptionNl: "Gecorrigeerde conusweerstand",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 106,
    unit: "MPa",
    description: "Net cone resistance",
    descriptionNl: "Netto conusweerstand",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 107,
    unit: "nT",
    description: "Magnetic field strength x",
    descriptionNl: "Magnetische veldsterkte x",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 108,
    unit: "nT",
    description: "Magnetic field strength y",
    descriptionNl: "Magnetische veldsterkte y",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 109,
    unit: "nT",
    description: "Magnetic field strength z",
    descriptionNl: "Magnetische veldsterkte z",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 110,
    unit: "nT",
    description: "Total magnetic field strength",
    descriptionNl: "Totale magnetische veldsterkte",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 111,
    unit: "S/m",
    description: "Electrical conductivity",
    descriptionNl: "Electrische geleidbaarheid",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 112,
    unit: "degrees",
    description: "Inclination east-west",
    descriptionNl: "Helling oost-west",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 113,
    unit: "degrees",
    description: "Inclination north-south",
    descriptionNl: "Helling noord-zuid",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 114,
    unit: "degrees",
    description: "Inclination x",
    descriptionNl: "Helling x",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 115,
    unit: "degrees",
    description: "Inclination y",
    descriptionNl: "Helling y",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 116,
    unit: "degrees",
    description: "Resultant inclination",
    descriptionNl: "Hellingresultante",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 117,
    unit: "degrees",
    description: "Magnetic inclination",
    descriptionNl: "Magnetische inclinatie",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 118,
    unit: "degrees",
    description: "Magnetic declination",
    descriptionNl: "Magnetische declinatie",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 119,
    unit: "MPa",
    description: "Local friction",
    descriptionNl: "Plaatselijke wrijving",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 120,
    unit: "-",
    description: "Pore ratio",
    descriptionNl: "Poriënratio",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 121,
    unit: "°C",
    description: "Temperature",
    descriptionNl: "Temperatuur",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 122,
    unit: "MPa",
    description: "Pore pressure u1",
    descriptionNl: "Waterspanning u1",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 123,
    unit: "MPa",
    description: "Pore pressure u2",
    descriptionNl: "Waterspanning u2",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 124,
    unit: "%",
    description: "Friction ratio",
    descriptionNl: "Wrijvingsgetal",
    category: "bro_data",
    dataType: "float",
  },
  {
    id: 130,
    unit: "mm",
    description: "Cone diameter before test",
    descriptionNl: "Conusdiameter voor test",
    category: "bro_equipment",
    dataType: "float",
  },
  // VOTB measurement variables (1100+)
  {
    id: 1100,
    unit: "µm",
    description: "Pore diameter of filter material",
    descriptionNl: "Poriëndiameter filtermateriaal waterspanningsfilter",
    category: "votb_equipment",
    dataType: "float",
  },
  {
    id: 1101,
    unit: "mm",
    description: "Filter diameter behind cone tip",
    descriptionNl: "Diameter filter achter conuspunt",
    category: "votb_equipment",
    dataType: "float",
  },
  {
    id: 1102,
    unit: "mm",
    description: "Distance friction reducer to cone tip",
    descriptionNl: "Afstand kleefbreker tot conuspunt",
    category: "votb_equipment",
    dataType: "float",
  },
  {
    id: 1103,
    unit: "°C",
    description: "Cone temperature before test",
    descriptionNl: "Temperatuur conus voor test",
    category: "votb_calibration",
    dataType: "float",
  },
  {
    id: 1104,
    unit: "°C",
    description: "Ambient temperature before test",
    descriptionNl: "Temperatuur omgeving voor test",
    category: "votb_calibration",
    dataType: "float",
  },
] as const;

// =============================================================================
// BELGIAN EXTENSIONS (DOV - Databank Ondergrond Vlaanderen)
// =============================================================================

export const belgianMeasurementTextVariables = [
  {
    id: 100,
    description: "Testtype",
    category: "dov_execution",
    example: "sondering",
  },
  {
    id: 130,
    description: "Watermeting tijdstip",
    category: "dov_execution",
    example: "voor sondering",
  },
  {
    id: 131,
    description: "Grondsoort bij conus",
    category: "dov_execution",
    example: "zand",
  },
  {
    id: 132,
    description: "Buisgewichtcorrectie",
    category: "dov_execution",
    example: "ja",
  },
  {
    id: 133,
    description: "Stanggewichtcorrectie",
    category: "dov_execution",
    example: "ja",
  },
  {
    id: 134,
    description: "Kalibratiedatum",
    category: "dov_calibration",
    example: "2019-01-15",
  },
  {
    id: 135,
    description: "Conus calibratie datum",
    category: "dov_calibration",
    example: "2019-01-15",
  },
  {
    id: 136,
    description: "Leverancier conus",
    category: "dov_equipment",
    example: "Fugro",
  },
  {
    id: 137,
    description: "Methode verzadiging voor U conus",
    category: "dov_equipment",
    example: "glycerine",
  },
  {
    id: 138,
    description: "Conustype",
    category: "dov_equipment",
    example: "electric",
  },
  {
    id: 139,
    description: "Opvullen van sondeergat",
    category: "dov_execution",
    example: "ja",
  },
  {
    id: 140,
    description: "Afwijkingen van de norm",
    category: "dov_remarks",
    example: "geen",
  },
  {
    id: 141,
    description: "Reden vroegtijdig stoppen",
    category: "dov_remarks",
    example: "obstakel",
  },
  {
    id: 142,
    description: "Hernemen sondering",
    category: "dov_remarks",
    example: "hervat na herpositionering",
  },
  {
    id: 143,
    description: "Speciale opstellingen",
    category: "dov_remarks",
    example: "platform gemonteerd",
  },
  {
    id: 144,
    description: "Waarneming tijdens uitvoering",
    category: "dov_remarks",
    example: "grondwater instroming waargenomen",
  },
] as const;

export const belgianMeasurementVariables = [
  // Calibratie nulpunten
  {
    id: 155,
    unit: "MPa",
    description: "Nulpunt Qt voor de meting",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 156,
    unit: "MPa",
    description: "Nulpunt Qt na de meting",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 157,
    unit: "°C",
    description: "Nulpunt T voor de meting",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 158,
    unit: "°C",
    description: "Nulpunt T na de meting",
    category: "dov_calibration",
    dataType: "float",
  },
  // Uitvoering
  {
    id: 130,
    unit: "-",
    description: "Indringing",
    category: "dov_execution",
    dataType: "float",
  },
  {
    id: 131,
    unit: "m",
    description: "Dichtvallen sondeergat op",
    category: "dov_execution",
    dataType: "float",
  },
  {
    id: 132,
    unit: "m",
    description: "Diepte plaatsen kleefvanger",
    category: "dov_execution",
    dataType: "float",
  },
  {
    id: 133,
    unit: "m",
    description: "Diepte plaatsen verlengbuis",
    category: "dov_execution",
    dataType: "float",
  },
  {
    id: 134,
    unit: "-",
    description: "Aantal buizen",
    category: "dov_execution",
    dataType: "float",
  },
  {
    id: 135,
    unit: "m",
    description: "Gemeten sondeerlengte",
    category: "dov_execution",
    dataType: "float",
  },
  {
    id: 138,
    unit: "kN",
    description: "Totale drukkracht bij einde sondering",
    category: "dov_execution",
    dataType: "float",
  },
  {
    id: 139,
    unit: "-",
    description: "Conuspenetrometer klasse (NBN EN ISO 22476-1:2023)",
    category: "dov_equipment",
    dataType: "string",
  },
  // Calibratiegegevens
  {
    id: 140,
    unit: "kPa",
    description: "Max. toelaatbare meetonzekerheid qc",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 141,
    unit: "kPa/°C",
    description: "Omgevingstemperatuurstabiliteit qc",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 142,
    unit: "kPa/°C",
    description: "Wisselende temperatuurstabiliteit qc",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 143,
    unit: "kPa/N",
    description: "Conusbelastingsinvloed qc",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 144,
    unit: "kPa",
    description: "Max. toelaatbare meetonzekerheid fs",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 145,
    unit: "kPa/°C",
    description: "Omgevingstemperatuurstabiliteit fs",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 146,
    unit: "kPa/°C",
    description: "Wisselende temperatuurstabiliteit fs",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 147,
    unit: "kPa/N",
    description: "Conusbelastingsinvloed fs",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 148,
    unit: "kPa",
    description: "Max. toelaatbare meetonzekerheid u",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 149,
    unit: "kPa/°C",
    description: "Omgevingstemperatuurstabiliteit u",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 150,
    unit: "kPa/°C",
    description: "Wisselende temperatuurstabiliteit u",
    category: "dov_calibration",
    dataType: "float",
  },
  {
    id: 151,
    unit: "kPa/N",
    description: "Conusbelastingsinvloed u",
    category: "dov_calibration",
    dataType: "float",
  },
  // Voerbuizen - paren van op/tot dieptes
  {
    id: 200,
    unit: "m",
    description: "Voerbuis 1 tot",
    category: "dov_guide_tubes",
    dataType: "float",
  },
  {
    id: 201,
    unit: "m",
    description: "Voerbuis 1 op",
    category: "dov_guide_tubes",
    dataType: "float",
  },
  // IDs 202-239 volgen hetzelfde patroon voor voerbuizen 2-20
  // Boringen - paren van van/tot dieptes
  {
    id: 250,
    unit: "m",
    description: "Boring 0 van",
    category: "dov_borings",
    dataType: "float",
  },
  {
    id: 251,
    unit: "m",
    description: "Boring 0 tot",
    category: "dov_borings",
    dataType: "float",
  },
  // IDs 252-289 volgen hetzelfde patroon voor boringen 1-19
  // Optrekkingen - dieptes
  {
    id: 300,
    unit: "m",
    description: "Optrekking 1",
    category: "dov_retractions",
    dataType: "float",
  },
  // IDs 301-349 volgen hetzelfde patroon voor optrekkingen 2-50
  // Stopzettingen - dieptes
  {
    id: 350,
    unit: "m",
    description: "Stopzetting 1",
    category: "dov_stops",
    dataType: "float",
  },
  {
    id: 351,
    unit: "m",
    description: "Stopzetting 2",
    category: "dov_stops",
    dataType: "float",
  },
  {
    id: 352,
    unit: "m",
    description: "Stopzetting 3",
    category: "dov_stops",
    dataType: "float",
  },
  {
    id: 353,
    unit: "m",
    description: "Stopzetting 4",
    category: "dov_stops",
    dataType: "float",
  },
  {
    id: 354,
    unit: "m",
    description: "Stopzetting 5",
    category: "dov_stops",
    dataType: "float",
  },
] as const;

/**
 * Detect which GEF extension is used based on file headers
 */
export function detectGefExtension(
  measurementTextIds?: Array<number>,
  measurementVarIds?: Array<number>
): GefExtension {
  const textIds = measurementTextIds ?? [];
  const varIds = measurementVarIds ?? [];

  // Dutch BRO fields (101-128) or VOTB fields (1100+)
  const hasDutchTextIds = textIds.some(
    (id) => (id >= 101 && id <= 128) || id >= 1100
  );
  const hasDutchVarIds = varIds.some(
    (id) => (id >= 101 && id <= 130) || id >= 1100
  );
  if (hasDutchTextIds || hasDutchVarIds) {
    return "dutch";
  }

  // Belgian DOV fields: MEASUREMENTTEXT (135-144), MEASUREMENTVAR (130-354)
  const hasBelgianTextIds = textIds.some((id) => id >= 135 && id <= 144);
  const hasBelgianVarIds = varIds.some(
    (id) => (id >= 130 && id <= 158) || (id >= 200 && id <= 354)
  );
  if (hasBelgianTextIds || hasBelgianVarIds) {
    return "belgian";
  }

  return "standard";
}

/**
 * Get CPT measurement text variables for a given extension
 */
export function getCptMeasurementTextVariablesForExtension(
  extension: GefExtension
) {
  const base = [...cptMeasurementTextVariables];

  if (extension === "dutch") {
    return [...base, ...dutchMeasurementTextVariables];
  }
  if (extension === "belgian") {
    return [...base, ...belgianMeasurementTextVariables];
  }

  return base;
}

/**
 * Get CPT measurement variables for a given extension
 */
export function getCptMeasurementVariablesForExtension(
  extension: GefExtension
) {
  const base = [...cptMeasurementVariables];

  if (extension === "dutch") {
    return [...base, ...dutchMeasurementVariables];
  }
  if (extension === "belgian") {
    return [...base, ...belgianMeasurementVariables];
  }

  return base;
}

/**
 * Find a CPT measurement text variable by ID, considering the extension
 */
export function findCptMeasurementTextVariable(
  id: number,
  extension: GefExtension
) {
  const variables = getCptMeasurementTextVariablesForExtension(extension);
  return variables.find((v) => v.id === id);
}

/**
 * Find a CPT measurement variable by ID, considering the extension
 */
export function findCptMeasurementVariable(
  id: number,
  extension: GefExtension
) {
  const variables = getCptMeasurementVariablesForExtension(extension);
  return variables.find((v) => v.id === id);
}

/**
 * Decode a standardized code for a CPT measurement text variable
 * Returns formatted string like "Measured, surveying (MMET)" or the original text if no match
 */
export function decodeMeasurementText(
  id: number,
  text: string,
  extension: GefExtension = "standard"
): string {
  const variable = findCptMeasurementTextVariable(id, extension);
  if (!variable || !("standardizedCodes" in variable)) {
    return text;
  }

  const standardizedCodes = variable.standardizedCodes;
  if (!standardizedCodes) {
    return text;
  }
  const code = standardizedCodes.find(
    (c: { code: string; description: string }) =>
      c.code === text.trim().toUpperCase()
  );
  if (code) {
    return `${code.description} (${code.code})`;
  }

  return text;
}
