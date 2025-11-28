import z from "zod";
import initGefFileToMap, { parse_gef_wasm } from "../pkg/gef_file_to_map.js";
import {
  parseGefBoreData,
  parseGefBoreSpecimens,
  processBoreMetadata,
  type GefBoreData
} from "./gef-bore";
import {
  detectChartAxes,
  generateCptWarnings,
  parseGefCptData,
  parsePreExcavationLayers,
  processCptMetadata,
  type GefCptData,
} from "./gef-cpt.js";
import {
  HEIGHT_SYSTEMS,
  type GefBoreHeaders,
  type GefCptHeaders,
} from "./gef-schemas";

export type GEFHeadersMap = Map<string, Array<Array<string>>>;

export type GefFileType = "CPT" | "BORE";

export type GefData = GefCptData | GefBoreData;

/**
 * Get a measurement variable object by ID from parsed headers
 */
function getMeasurementVar(
  measurementVars: Array<{ id: number; value: string; unit: string }>,
  id: number,
) {
  return measurementVars.find((v) => v.id === id);
}

/**
 * Get a measurement variable numeric value by ID from parsed headers
 */
export function getMeasurementVarValue(
  measurementVars: Array<{ id: number; value: string; unit: string }>,
  id: number,
): number | undefined {
  const mv = getMeasurementVar(measurementVars, id);
  if (!mv) {
    return undefined;
  }
  const value = parseFloat(mv.value);
  return isNaN(value) ? undefined : value;
}

const gefToMapSchema = z.object({
  data: z.string(),
  headers: z.object({
    headers: z.map(z.string(), z.array(z.array(z.string()))),
  }),
});

function detectFileType(reportCode: string): GefFileType {
  const lowercaseReportCode = reportCode.toLowerCase();

  // Check for unsupported file types
  if (lowercaseReportCode.includes("diss")) {
    throw new Error("dissipationTestNotSupported");
  }
  if (lowercaseReportCode.includes("siev")) {
    throw new Error("sieveTestNotSupported");
  }

  if (lowercaseReportCode.includes("bore")) {
    return "BORE";
  }
  return "CPT";
}

// Generate warnings common to both CPT and BORE files
function generateCommonWarnings(
  filename: string,
  headers: GefCptHeaders | GefBoreHeaders,
  headersMap: GEFHeadersMap,
): Array<string> {
  const warnings: Array<string> = [];

  // Check for missing or invalid ZID
  const rawZid = headersMap.get("ZID")?.[0];

  if (!rawZid || rawZid.length === 0) {
    warnings.push(`missingZidHeader:${filename}`);
  } else {
    const heightCode = rawZid[0]?.trim();
    if (heightCode && !(heightCode in HEIGHT_SYSTEMS)) {
      warnings.push(`unknownHeightSystem:${filename}:${heightCode}`);
    }
    if (rawZid.length < 2) {
      warnings.push(`zidWithoutHeight:${filename}`);
    }
  }

  // Check for missing XYID (location)
  if (!headers.XYID) {
    warnings.push(`missingXyidHeader:${filename}`);
  }

  // Check for COLUMNINFO missing quantityNumber (4th element per spec)
  const rawColumnInfo = headersMap.get("COLUMNINFO");
  if (rawColumnInfo) {
    const missingQuantityNumbers = rawColumnInfo.filter(
      (col) => col.length < 4,
    );
    if (missingQuantityNumbers.length > 0) {
      const count = missingQuantityNumbers.length;
      warnings.push(`missingColumnInfoQuantity:${filename}:${count}`);
    }
  }

  return warnings;
}

export async function parseGefFile(file: File): Promise<GefData> {
  await initGefFileToMap();

  const gefContent = await file.text();
  const gefMap = gefToMapSchema.parse(parse_gef_wasm(gefContent));

  const reportCode =
    gefMap.headers.headers.get("REPORTCODE")?.[0]?.[0] ?? "cpt";

  const fileType = detectFileType(reportCode);

  if (fileType === "BORE") {
    const { layers, headers } = parseGefBoreData(
      gefMap.data,
      gefMap.headers.headers,
    );
    const specimens = parseGefBoreSpecimens(headers);
    const warnings = generateCommonWarnings(
      file.name,
      headers,
      gefMap.headers.headers,
    );
    const processed = processBoreMetadata(file.name, headers);

    return {
      fileType,
      layers,
      specimens,
      headers,
      warnings,
      processed,
    };
  }

  const { data, columnInfo, headers } = parseGefCptData(
    gefMap.data,
    gefMap.headers.headers,
  );
  const chartAxes = detectChartAxes(columnInfo, data, headers.ZID);

  const preExcavationLayers = parsePreExcavationLayers(headers);

  const warnings = [
    ...generateCommonWarnings(file.name, headers, gefMap.headers.headers),
    ...generateCptWarnings(file.name, headers, data),
  ];
  const processed = processCptMetadata(file.name, headers);

  return {
    fileType,
    data,
    headers,
    chartAxes,
    preExcavationLayers,
    warnings,
    processed,
  };
}
