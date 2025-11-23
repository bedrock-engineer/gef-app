import {
  parseGefHeaders,
  HEIGHT_SYSTEMS,
  type ColumnInfo,
  type GefHeaders,
  type SpecimenVar,
  type SpecimenText,
  type ZID,
} from "./gef-schemas";
import initGefFileToMap, { parse_gef_wasm } from "../pkg/gef_file_to_map.js";
import z from "zod";
import type { BoreLayer, BoreSpecimen } from "./gef-bore";
import { addComputedDepthColumns } from "./depth-correction";
import { columnQuantities } from "./gef-metadata";

export const DEPTH_KEYWORDS = [
  "penetration",
  "sondeer",
  "length",
  "diepte",
  "lengte",
];

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
  const quantity = columnQuantities.find((q) => q.id === col.quantityNumber);
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
    if (!depthCol) return row;

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
}

export interface GefBoreData {
  fileType: "BORE";
  layers: Array<BoreLayer>;
  specimens: Array<BoreSpecimen>;
  headers: GefHeaders;
  warnings: Array<string>;
}

export type GefData = GefCptData | GefBoreData;

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
        const quantityInfo = columnQuantities.find((q) => q.id === quantityNum);
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
        if (!colInfo) continue;

        const values = data
          .map((row) => row[colInfo.name])
          .filter((v): v is number => v !== null && v !== undefined);

        if (values.length === 0) continue;

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

function parseGefBoreData(
  dataString: string,
  headersMap: GEFHeadersMap
): { layers: Array<BoreLayer>; headers: GefHeaders } {
  const headers = parseGefHeaders(headersMap);
  const columnSeparator = headers.COLUMNSEPARATOR ?? ";";
  const columnInfo = headers.COLUMNINFO ?? [];

  // Split by record separator and filter empty lines
  const recordSeparator = "!";
  const records = dataString
    .split(recordSeparator)
    .map((r) => r.trim())
    .filter((r) => r.length > 0);

  // Create void values map
  const voidValuesMap = new Map(
    headers.COLUMNVOID?.map(({ columnNumber, voidValue }) => [
      columnNumber,
      voidValue,
    ]) ?? []
  );

  const layers: Array<BoreLayer> = records.map((record) => {
    // Split by column separator, handling both numeric and text columns
    const parts = record
      .split(columnSeparator)
      .map((p) => p.trim())
      .filter((p) => p !== "");

    // Parse numeric columns (first N columns based on COLUMNINFO)
    const numericValues = parts
      .slice(0, columnInfo.length)
      .map((val, index) => {
        const num = parseFloat(val);
        const voidValue = voidValuesMap.get(index + 1);
        return num === voidValue ? null : num;
      });

    // Parse text columns (remaining parts, strip quotes)
    const textParts = parts
      .slice(columnInfo.length)
      .map((t) => t.replace(/^'|'$/g, "").trim())
      .filter((t) => t.length > 0);

    // Find depth columns by quantity number
    const depthTopIdx = columnInfo.findIndex(
      (c) =>
        c.quantityNumber === 1 || c.name.toLowerCase().includes("bovenkant")
    );
    const depthBottomIdx = columnInfo.findIndex(
      (c) =>
        c.quantityNumber === 2 || c.name.toLowerCase().includes("onderkant")
    );

    // Default to columns 0 and 1 if not found
    const depthTop = numericValues[depthTopIdx >= 0 ? depthTopIdx : 0] ?? 0;
    const depthBottom =
      numericValues[depthBottomIdx >= 0 ? depthBottomIdx : 1] ?? 0;

    // First text part is the main soil code
    const soilCode = textParts[0] ?? "";
    const additionalCodes = textParts.slice(1);

    // Check if last additional code is a description (not a standard code)
    let description: string | undefined;
    if (additionalCodes.length > 0) {
      const lastCode = additionalCodes[additionalCodes.length - 1];
      // If it contains spaces or is longer than typical codes, treat as description
      if (lastCode && (lastCode.includes(" ") || lastCode.length > 10)) {
        description = additionalCodes.pop();
      }
    }

    return {
      depthTop,
      depthBottom,
      soilCode,
      additionalCodes,
      description,

      sandMedian: numericValues[2] ?? null,
      gravelMedian: numericValues[3] ?? null,

      sandPercent: numericValues[6] ?? null,

      organicPercent: numericValues[8] ?? null,
    };
  });

  return { layers, headers };
}

function parseGefBoreSpecimens(headers: GefHeaders): Array<BoreSpecimen> {
  const specimenVars = headers.SPECIMENVAR ?? [];
  const specimenTexts = headers.SPECIMENTEXT ?? [];

  // Get number of specimens from SPECIMENVAR id=1
  const countVar = specimenVars.find((v) => v.id === 1);
  const specimenCount = countVar ? Math.floor(countVar.value) : 0;

  if (specimenCount === 0) {
    return [];
  }

  // Create lookup maps for quick access
  const varMap = new Map<number, SpecimenVar>();
  for (const v of specimenVars) {
    varMap.set(v.id, v);
  }

  const textMap = new Map<number, SpecimenText>();
  for (const t of specimenTexts) {
    textMap.set(t.id, t);
  }

  // Collect remarks from SPECIMENTEXT 1-5
  const remarks: Array<string> = [];
  for (let i = 1; i <= 5; i++) {
    const remark = textMap.get(i);
    if (remark?.text) {
      remarks.push(remark.text);
    }
  }

  const specimens: Array<BoreSpecimen> = [];

  for (let k = 1; k <= specimenCount; k++) {
    // Get SPECIMENVAR values using formula: 4 + 7k, 5 + 7k, etc.
    const depthTopVar = varMap.get(4 + 7 * k);
    const depthBottomVar = varMap.get(5 + 7 * k);
    const diameterMonsterVar = varMap.get(6 + 7 * k);
    const diameterApparaatVar = varMap.get(7 + 7 * k);

    // Get SPECIMENTEXT values using formula: 4 + 7k, 5 + 7k, etc.
    const monstercodeText = textMap.get(4 + 7 * k);
    const monsterdatumText = textMap.get(5 + 7 * k);
    const monstertijdText = textMap.get(6 + 7 * k);
    const geroerdText = textMap.get(7 + 7 * k);
    const monstersteekapparaatText = textMap.get(8 + 7 * k);
    const dikDunwandigText = textMap.get(9 + 7 * k);
    const monstermethodeText = textMap.get(10 + 7 * k);

    const specimen: BoreSpecimen = {
      specimenNumber: k,
      depthTop: depthTopVar?.value ?? 0,
      depthBottom: depthBottomVar?.value ?? 0,
      diameterMonster: diameterMonsterVar?.value ?? null,
      diameterMonstersteekapparaat: diameterApparaatVar?.value ?? null,
      monstercode: monstercodeText?.text,
      monsterdatum: monsterdatumText?.text,
      monstertijd: monstertijdText?.text,
      geroerdOngeroerd: geroerdText?.text,
      monstersteekapparaat: monstersteekapparaatText?.text,
      dikDunwandig: dikDunwandigText?.text,
      monstermethode: monstermethodeText?.text,
      remarks: k === 1 ? remarks : undefined, // Only include remarks on first specimen
    };

    specimens.push(specimen);
  }

  return specimens;
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
    return {
      fileType: "BORE",
      layers,
      specimens,
      headers,
      warnings,
    };
  }

  // CPT file
  const { data, columnInfo, headers } = parseGefData(a.data, a.headers.headers);
  const chartAxes = detectChartAxes(columnInfo, data, headers.ZID);
  const preExcavationLayers = parsePreExcavationLayers(headers);
  const warnings = generateWarnings(headers, a.headers.headers, "CPT", data);

  return {
    fileType: "CPT",
    data,
    headers,
    chartAxes,
    preExcavationLayers,
    warnings,
  };
}
