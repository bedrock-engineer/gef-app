
export const placeDeterminationCodes = [
  {
    code: "LMET",
    description: "Measured, surveying",
    descriptionNl: "Gemeten, landmeting",
  },
  { code: "LGPS", description: "Measured, GPS", descriptionNl: "Gemeten, GPS" },
  {
    code: "LDGM",
    description: "Measured, diff. GPS, > 5 m",
    descriptionNl: "Gemeten, diff. GPS, > 5 m",
  },
  {
    code: "LDGN",
    description: "Measured, diff. GPS, between 1 and 5 m",
    descriptionNl: "Gemeten, diff. GPS, 1 - < 5 m",
  },
  {
    code: "LDGZ",
    description: "Measured, diff. GPS, < 1m",
    descriptionNl: "Gemeten, diff. GPS, < 1m",
  },
  {
    code: "LGOV",
    description: "Measured, other methods",
    descriptionNl: "Gemeten, overige methoden",
  },
  {
    code: "LT10",
    description: "Estimated, Topographic map 1:10.000",
    descriptionNl: "Geschat, Topografische Kaart 1:10.000",
  },
  {
    code: "LT25",
    description: "Estimated, Topographic map 1:25.000",
    descriptionNl: "Geschat, Topografische Kaart 1:25.000",
  },
  {
    code: "LT50",
    description: "Estimated, Topographic map 1:50.000",
    descriptionNl: "Geschat, Topografische Kaart 1:50.000",
  },
  {
    code: "LD01",
    description: "Estimated, detailed map 1:100",
    descriptionNl: "Geschat, detailkaart 1:100",
  },
  {
    code: "LD02",
    description: "Estimated, detailed map 1:200",
    descriptionNl: "Geschat, detailkaart 1:200",
  },
  {
    code: "LD05",
    description: "Estimated, detailed map 1:500",
    descriptionNl: "Geschat, detailkaart 1:500",
  },
  {
    code: "LD10",
    description: "Estimated, detailed map 1:1000",
    descriptionNl: "Geschat, detailkaart 1:1000",
  },
  {
    code: "LD25",
    description: "Estimated, detailed map 1:2500",
    descriptionNl: "Geschat, detailkaart 1:2500",
  },
  {
    code: "LSOV",
    description: "Estimated, other methods",
    descriptionNl: "Geschat, overige methoden",
  },
  {
    code: "LONB",
    description: "Estimated, method unknown",
    descriptionNl: "Geschat, methode onbekend",
  },
];

export const heightDeterminationCodes = [
  {
    code: "MMET",
    description: "Measured, surveying",
    descriptionNl: "Gemeten, landmeting",
  },
  {
    code: "MDGP",
    description: "Measured, differential GPS",
    descriptionNl: "Gemeten, differentieel GPS",
  },
  {
    code: "MGOV",
    description: "Measured, other methods",
    descriptionNl: "Gemeten, overige methoden",
  },
  {
    code: "MH10",
    description: "Estimated, contour map 1:10.000",
    descriptionNl: "Geschat, Hoogtekaart 1:10.000",
  },
  {
    code: "MT25",
    description: "Estimated, Topographic map 1:25.000",
    descriptionNl: "Geschat, Topografische Kaart 1:25.000",
  },
  {
    code: "MT50",
    description: "Estimated, Topographic map 1:50.000",
    descriptionNl: "Geschat, Topografische Kaart 1:50.000",
  },
  {
    code: "MAHN",
    description: "Estimated, Actueel Hoogtebestand Nederland",
    descriptionNl: "Geschat, Actueel Hoogtebestand Nederland",
  },
  {
    code: "MSOV",
    description: "Estimated, other methods",
    descriptionNl: "Geschat, overige bepalingsmethoden",
  },
  {
    code: "MONB",
    description: "Estimated, unknown method",
    descriptionNl: "Geschat, methode onbekend",
  },
  {
    code: "MFIC",
    description: "Fictive value",
    descriptionNl: "Fictieve waarde",
  },
];

// =============================================================================
// EXTENSION DETECTION AND LOOKUP
// =============================================================================

export type GefFileType = "CPT" | "BORE";

/**
 * Get a measurement variable numeric value by ID from parsed headers
 */
export function getMeasurementVarValue(
  measurementVars: Array<{ id: number; value: string; unit: string }>,
  id: number
): number | undefined {
  const mv = getMeasurementVar(measurementVars, id);
  if (!mv) {
    return undefined;
  }
  const value = parseFloat(mv.value);
  return isNaN(value) ? undefined : value;
}

/**
 * Get a measurement variable object by ID from parsed headers
 */
export function getMeasurementVar(
  measurementVars: Array<{ id: number; value: string; unit: string }>,
  id: number
) {
  return measurementVars.find((v) => v.id === id);
}
