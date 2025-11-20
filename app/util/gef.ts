import { parseGefHeaders, type ColumnInfo, type GefHeaders } from "./gef-schemas";
import initGefFileToMap, { parse_gef_wasm } from "../pkg/gef_file_to_map.js";
import z from "zod";
import type { BoreLayer } from "./gef-bore-schemas";

const FRICTION_KEYWORDS = ["friction", "wrijving", "ratio", "getal"];
const CONE_KEYWORDS = ["cone", "conisch", "puntdruk", "qc", "resistance"];

export const DEPTH_KEYWORDS = [
  "penetration",
  "sondeer",
  "length",
  "diepte",
  "lengte",
];

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

  console.log({ normalizedRows });

  return {
    data: normalizedRows,
    headers,
    columnInfo,
  };
}

function findColumnByKeywords(
  columns: Array<ColumnInfo>,
  unit: string,
  keywords: Array<string>
): ColumnInfo | undefined {
  return columns.find((col) => {
    const nameLower = col.name.toLowerCase();
    // Extract unit code from formats like "m (meter)" or "MPa (megaPascal)"
    const unitCode = col.unit.split(/\s+/)[0];
    return unitCode === unit && keywords.some((kw) => nameLower.includes(kw));
  });
}

function detectChartAxes(columnInfo: Array<ColumnInfo>) {
  // Y-axis: depth/penetration length
  const yColumn = findColumnByKeywords(columnInfo, "m", DEPTH_KEYWORDS);

  // X-axis candidates: exclude depth column
  const xCandidates = columnInfo.filter(
    (col) => col.colNum !== yColumn?.colNum
  );

  // Prefer: friction ratio (%), then cone resistance (MPa), then first available
  const xColumn =
    findColumnByKeywords(xCandidates, "MPa", CONE_KEYWORDS) ??
    findColumnByKeywords(xCandidates, "%", FRICTION_KEYWORDS) ??
    xCandidates[0];

  return {
    yAxis: yColumn
      ? { key: yColumn.name, unit: yColumn.unit, name: yColumn.name }
      : null,
    xAxis: xColumn
      ? { key: xColumn.name, unit: xColumn.unit, name: xColumn.name }
      : null,
    availableColumns: columnInfo.map((col) => ({
      key: col.name,
      unit: col.unit,
      name: col.name,
    })),
  };
}

export type GefFileType = "CPT" | "BORE";

export interface GefCptData {
  fileType: "CPT";
  data: Array<Record<string, number>>;
  headers: GefHeaders;
  chartAxes: {
    yAxis: { key: string; unit: string; name: string } | null;
    xAxis: { key: string; unit: string; name: string } | null;
    availableColumns: Array<{ key: string; unit: string; name: string }>;
  };
}

export interface GefBoreData {
  fileType: "BORE";
  layers: BoreLayer[];
  headers: GefHeaders;
}

export type GefData = GefCptData | GefBoreData;

function detectFileType(headers: GefHeaders): GefFileType {
  const reportCode = headers.REPORTCODE?.code?.toLowerCase() ?? "";
  if (reportCode.includes("bore")) {
    return "BORE";
  }
  return "CPT";
}

function parseGefBoreData(dataString: string, headersMap: GEFHeadersMap): { layers: BoreLayer[]; headers: GefHeaders } {
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

  const layers: BoreLayer[] = records.map((record) => {
    // Split by column separator, handling both numeric and text columns
    const parts = record.split(columnSeparator).map((p) => p.trim());

    // Parse numeric columns (first N columns based on COLUMNINFO)
    const numericValues = parts.slice(0, columnInfo.length).map((val, index) => {
      const num = parseFloat(val);
      const voidValue = voidValuesMap.get(index + 1);
      return num === voidValue ? null : num;
    });

    // Parse text columns (remaining parts, strip quotes)
    const textParts = parts.slice(columnInfo.length).map((t) =>
      t.replace(/^'|'$/g, "").trim()
    ).filter((t) => t.length > 0);

    // Find depth columns by quantity number
    const depthTopIdx = columnInfo.findIndex((c) => c.quantityNumber === 1 || c.name.toLowerCase().includes("bovenkant"));
    const depthBottomIdx = columnInfo.findIndex((c) => c.quantityNumber === 2 || c.name.toLowerCase().includes("onderkant"));

    // Default to columns 0 and 1 if not found
    const depthTop = numericValues[depthTopIdx >= 0 ? depthTopIdx : 0] ?? 0;
    const depthBottom = numericValues[depthBottomIdx >= 0 ? depthBottomIdx : 1] ?? 0;

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
      // Map other numeric columns if present
      sandMedian: numericValues[2] ?? null,
      gravelMedian: numericValues[3] ?? null,
      clayPercent: numericValues[4] ?? null,
      siltPercent: numericValues[5] ?? null,
      sandPercent: numericValues[6] ?? null,
      gravelPercent: numericValues[7] ?? null,
      organicPercent: numericValues[8] ?? null,
    };
  });

  return { layers, headers };
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
    return {
      fileType: "BORE",
      layers,
      headers,
    };
  }

  // CPT file
  const { data, columnInfo, headers } = parseGefData(a.data, a.headers.headers);
  const chartAxes = detectChartAxes(columnInfo);

  return {
    fileType: "CPT",
    data,
    headers,
    chartAxes,
  };
}
