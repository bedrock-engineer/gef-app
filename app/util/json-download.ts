import {
  ADDITIONAL_SOIL_CODES,
  ANTHROPOGENIC_ADMIXTURES,
  CALCIUM_CONTENT,
  CONSISTENCY,
  GEOLOGICAL_INTERPRETATION,
  GLAUCONITE_CONTENT,
  GRAIN_SHAPE,
  GRAVEL_FRACTIONS,
  GRAVEL_MEDIAN_CLASSES,
  LAYERING,
  MAIN_COLORS,
  NEN5104_SOIL_CODES,
  NON_STANDARD_SOIL_CODES,
  PEAT_AMORPHOSITY,
  PEAT_TYPES,
  ROCK_HARDNESS,
  SAND_COMPACTION,
  SAND_MEDIAN_CLASSES,
  SAND_SPREAD,
  SECONDARY_COLORS,
  SHELL_CONTENT,
  STRATIGRAPHIC_UNITS,
} from "@bedrock-engineer/gef-parser/bore-codes";
import type { GefData } from "@bedrock-engineer/gef-parser";
import { downloadFile } from "./download";

// Combined lookup for all codes
const ALL_CODES: Record<string, string> = {
  ...NEN5104_SOIL_CODES,
  ...NON_STANDARD_SOIL_CODES,
  ...ADDITIONAL_SOIL_CODES,
  ...SECONDARY_COLORS,
  ...MAIN_COLORS,
  ...SAND_MEDIAN_CLASSES,
  ...SAND_SPREAD,
  ...GRAIN_SHAPE,
  ...GRAVEL_MEDIAN_CLASSES,
  ...GRAVEL_FRACTIONS,
  ...PEAT_AMORPHOSITY,
  ...PEAT_TYPES,
  ...CONSISTENCY,
  ...SAND_COMPACTION,
  ...ROCK_HARDNESS,
  ...SHELL_CONTENT,
  ...CALCIUM_CONTENT,
  ...GLAUCONITE_CONTENT,
  ...ANTHROPOGENIC_ADMIXTURES,
  ...LAYERING,
  ...GEOLOGICAL_INTERPRETATION,
  ...STRATIGRAPHIC_UNITS,
};

interface DecodedCode {
  code: string;
  description: string | null;
}

/**
 * Decode a soil code to include both code and description
 */
function decodeCode(code: string): DecodedCode {
  return {
    code,
    description: ALL_CODES[code] ?? null,
  };
}

/**
 * Convert GefData to JSON export format
 */
function convertGefDataToJson(gefData: GefData) {
  const { processed } = gefData;
  const { location, elevation, company } = processed;

  // Build base structure
  const json: Record<string, unknown> = {
    testId: processed.testId ?? null,
    projectId: processed.projectId ?? null,
    fileType: gefData.fileType,
    metadata: {
      filename: processed.filename,
      companyName: company?.name ?? null,
      startDate: processed.startDate ?? null,
      startTime: processed.startTime ?? null,
      coordinates: location?.coordinateSystem
        ? {
            system: {
              name: location.coordinateSystem.name,
              epsg: location.coordinateSystem.epsg,
            },
            x: location.originalX ?? null,
            y: location.originalY ?? null,
            wgs84: location.wgs84
              ? {
                  lat: location.wgs84.lat,
                  lon: location.wgs84.lon,
                }
              : null,
          }
        : null,
      elevation: elevation?.heightSystem
        ? {
            value: elevation.surfaceElevation ?? null,
            system: {
              name: elevation.heightSystem.name,
              epsg: elevation.heightSystem.epsg,
            },
          }
        : null,
    },
  };

  if (gefData.fileType === "CPT") {
    const cptData = gefData;

    // Add columns metadata
    json.columns = (cptData.headers.COLUMNINFO ?? []).map((col) => ({
      name: col.name,
      unit: col.unit,
    }));

    // Add data
    json.data = cptData.data;

    // Add pre-excavation layers if present
    const preExcavationLayers = cptData.processed.preExcavationLayers;
    if (preExcavationLayers.length > 0) {
      json.preExcavationLayers = preExcavationLayers.map((layer) => ({
        depthTop: layer.depthTop,
        depthBottom: layer.depthBottom,
        description: layer.description,
      }));
    }
  } else if (gefData.fileType === "DISS") {
    const dissData = gefData;

    // Add columns metadata
    json.columns = dissData.columnInfo.map((col) => ({
      name: col.name,
      unit: col.unit,
    }));

    // Add data
    json.data = dissData.data;
  } else {
    // BORE file
    const boreData = gefData;

    // Add layers with decoded soil codes
    json.layers = boreData.layers.map((layer) => ({
      depthTop: layer.depthTop,
      depthBottom: layer.depthBottom,
      soilCode: decodeCode(layer.soilCode),
      additionalCodes: layer.additionalCodes.map((code) => decodeCode(code)),
      description: layer.description ?? null,
    }));

    // Add specimens if present
    const { specimens } = boreData.processed;
    if (specimens.length > 0) {
      json.specimens = specimens.map((specimen) => ({
        specimenNumber: specimen.specimenNumber,
        depthTop: specimen.depthTop,
        depthBottom: specimen.depthBottom,
        monstercode: specimen.monstercode ?? null,
        monsterdatum: specimen.monsterdatum ?? null,
        monstertijd: specimen.monstertijd ?? null,
        geroerdOngeroerd: specimen.geroerdOngeroerd ?? null,
        monstersteekapparaat: specimen.monstersteekapparaat ?? null,
        dikDunwandig: specimen.dikDunwandig ?? null,
        monstermethode: specimen.monstermethode ?? null,
        diameterMonster: specimen.diameterMonster ?? null,
        diameterMonstersteekapparaat:
          specimen.diameterMonstersteekapparaat ?? null,
        remarks: specimen.remarks ?? null,
      }));
    }
  }

  return json;
}

/**
 * Download GEF data as JSON file
 */
export function downloadGefDataAsJson(
  gefData: GefData,
  filename: string
): void {
  const jsonData = convertGefDataToJson(gefData);
  const jsonString = JSON.stringify(jsonData, null, 2);

  // Generate filename (replace .gef/.GEF extension with .json)
  const jsonFilename = filename.replace(/\.gef$/i, ".json");

  downloadFile(jsonString, jsonFilename, "application/json;charset=utf-8;");
}
