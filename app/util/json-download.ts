import type { GefData } from "~/gef/gef-common";
import type { GefBoreData } from "~/gef/gef-bore";
import type { GefCptData } from "~/gef/gef-cpt";
import {
  NEN5104_SOIL_CODES,
  NON_STANDARD_SOIL_CODES,
  ADDITIONAL_SOIL_CODES,
  SECONDARY_COLORS,
  MAIN_COLORS,
  SAND_MEDIAN_CLASSES,
  SAND_SPREAD,
  GRAIN_SHAPE,
  GRAVEL_MEDIAN_CLASSES,
  GRAVEL_FRACTIONS,
  PEAT_AMORPHOSITY,
  PEAT_TYPES,
  CONSISTENCY,
  SAND_COMPACTION,
  ROCK_HARDNESS,
  SHELL_CONTENT,
  CALCIUM_CONTENT,
  GLAUCONITE_CONTENT,
  ANTHROPOGENIC_ADMIXTURES,
  LAYERING,
  GEOLOGICAL_INTERPRETATION,
  STRATIGRAPHIC_UNITS,
} from "~/gef/gef-bore-codes";
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

  // Build base structure
  const json: Record<string, unknown> = {
    testId: processed.testId ?? null,
    projectId: processed.projectId ?? null,
    fileType: gefData.fileType,
    metadata: {
      filename: processed.filename,
      companyName: processed.companyName ?? null,
      startDate: processed.startDate ?? null,
      startTime: processed.startTime ?? null,
      coordinates: processed.coordinateSystem
        ? {
            system: {
              name: processed.coordinateSystem.name,
              epsg: processed.coordinateSystem.epsg,
            },
            x: processed.originalX ?? null,
            y: processed.originalY ?? null,
            wgs84: processed.wgs84
              ? {
                  lat: processed.wgs84.lat,
                  lon: processed.wgs84.lon,
                }
              : null,
          }
        : null,
      elevation: processed.heightSystem
        ? {
            value: processed.surfaceElevation ?? null,
            system: {
              name: processed.heightSystem.name,
              epsg: processed.heightSystem.epsg,
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
    if (cptData.preExcavationLayers.length > 0) {
      json.preExcavationLayers = cptData.preExcavationLayers.map((layer) => ({
        depthTop: layer.depthTop,
        depthBottom: layer.depthBottom,
        description: layer.description,
      }));
    }
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
    if (boreData.specimens.length > 0) {
      json.specimens = boreData.specimens.map((specimen) => ({
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
