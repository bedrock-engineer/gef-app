import type { ColumnInfo, ZID, MeasurementVar } from "./gef-schemas";
import { getMeasurementVarValue } from "./gef-common";
import { findColumnByQuantity } from "./gef-cpt";

/**
 * GEF Quantity Numbers for depth-related columns
 */
const QUANTITY_NUMBERS = {
  PENETRATION_LENGTH: 1,
  INCLINATION_RESULTANT: 8,
  INCLINATION_NS: 9,
  INCLINATION_EW: 10,
  CORRECTED_DEPTH: 11,
} as const;

const PRE_EXCAVATED_DEPTH_MEASUREMNTVAR_ID = 13;

/**
 * Calculate true depth (corrected for inclination) from penetration length
 *
 * Based on pygef implementation:
 * - If depth column (quantity 11) exists, use it directly
 * - If inclination exists, calculate: depth = cumsum(cos(inclination) * delta_penetration)
 * - Otherwise, depth = penetration length (no correction)
 */
function calculateTrueDepth(
  data: Array<Record<string, number>>,
  columnInfo: Array<ColumnInfo>,
): Array<Record<string, number>> {
  // Check if corrected depth already exists (quantity 11)
  const correctedDepthCol = findColumnByQuantity(
    columnInfo,
    QUANTITY_NUMBERS.CORRECTED_DEPTH,
  );

  if (correctedDepthCol) {
    // Already have corrected depth, add as 'trueDepth' alias
    return data.map((row) => ({
      ...row,
      trueDepth: Math.abs(row[correctedDepthCol.name] ?? 0),
    }));
  }

  // Find penetration length and inclination columns
  const penetrationCol = findColumnByQuantity(
    columnInfo,
    QUANTITY_NUMBERS.PENETRATION_LENGTH,
  );
  const inclinationCol = findColumnByQuantity(
    columnInfo,
    QUANTITY_NUMBERS.INCLINATION_RESULTANT,
  );

  if (!penetrationCol) {
    // No penetration length, can't calculate
    return data;
  }

  const penetrationKey = penetrationCol.name;

  if (!inclinationCol) {
    // No inclination data, true depth = penetration length
    return data.map((row) => ({
      ...row,
      trueDepth: Math.abs(row[penetrationKey] ?? 0),
    }));
  }

  const inclinationKey = inclinationCol.name;

  // Calculate corrected depth using inclination
  // depth_i = sum(cos(inclination_j) * (penetration_j - penetration_{j-1}))
  const result: Array<Record<string, number>> = [];
  let cumulativeDepth = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i]!;
    const penetration = row[penetrationKey] ?? 0;
    const inclinationDeg = row[inclinationKey] ?? 0;

    if (i === 0) {
      // First row: depth = penetration length
      cumulativeDepth = Math.abs(penetration);
    } else {
      const prevPenetration = data[i - 1]![penetrationKey] ?? 0;
      const deltaPenetration = Math.abs(penetration - prevPenetration);

      // Convert degrees to radians and apply cosine correction
      const correctionFactor = Math.cos((inclinationDeg * Math.PI) / 180);
      const correctedDelta = correctionFactor * deltaPenetration;

      cumulativeDepth += correctedDelta;
    }

    result.push({
      ...row,
      trueDepth: cumulativeDepth,
    });
  }

  return result;
}

/**
 * Calculate elevation (height relative to datum, e.g., NAP) from true depth
 *
 * Formula: elevation = ZID.height - trueDepth
 *
 * Where:
 * - ZID.height = elevation of the reference level (e.g., ground level at +5.0m NAP)
 * - trueDepth = inclination-corrected depth
 */
function calculateElevation(
  data: Array<Record<string, number>>,
  zid: ZID | undefined,
): Array<Record<string, number>> {
  if (!zid) {
    // No height reference, can't calculate elevation
    return data;
  }

  const referenceHeight = zid.height;

  return data.map((row) => {
    const trueDepth = row.trueDepth;
    if (trueDepth === undefined) {
      return row;
    }

    return {
      ...row,
      elevation: referenceHeight - trueDepth,
    };
  });
}

export type Row = Record<string, number> & {
  preExcavatedDepth: number;
  isVoid: boolean;
};

/**
 * Add computed depth columns to GEF data
 *
 * Adds:
 * - trueDepth: Inclination-corrected depth (positive, increasing down)
 * - elevation: Height relative to datum like NAP (can be negative)
 *
 * Handles pre-excavated depth (MEASUREMENTVAR 13) which indicates
 * soil was removed before testing, so first measurements start at that depth.
 */
export function addComputedDepthColumns(
  data: Array<Row>,
  columnInfo: Array<ColumnInfo>,
  zid: ZID | undefined,
  measurementVars: Array<MeasurementVar> | undefined,
): Array<Record<string, number>> {
  // Get pre-excavated depth if present
  const preExcavatedDepth = measurementVars
    ? (getMeasurementVarValue(
        measurementVars,
        PRE_EXCAVATED_DEPTH_MEASUREMNTVAR_ID,
      ) ?? 0)
    : 0;

  // First calculate true depth
  let result = calculateTrueDepth(data, columnInfo);

  // Then calculate elevation if ZID is available
  // Pre-excavated depth doesn't affect elevation calculation since
  // the penetration length is still measured from the reference level
  result = calculateElevation(result, zid);

  // Mark rows in pre-excavation zone as void
  // Per GEF spec section 3.6.2, data in pre-excavation zone should be treated as void
  if (preExcavatedDepth > 0) {
    const penetrationCol = findColumnByQuantity(
      columnInfo,
      QUANTITY_NUMBERS.PENETRATION_LENGTH,
    );
    const penetrationKey = penetrationCol?.name;

    result = result.map((row) => {
      const penetration = penetrationKey ? (row[penetrationKey] ?? 0) : 0;
      const isVoid = penetration < preExcavatedDepth;

      return {
        ...row,
        preExcavatedDepth,
        isVoid,
      };
    });
  }

  return result;
}
