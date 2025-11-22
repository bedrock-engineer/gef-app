// GEF-BORE specific metadata definitions
// Based on GEF-BORE-Report specification

import { heightDeterminationCodes, placeDeterminationCodes } from "./gef-metadata";

export const boreMeasurementVariables = [
  // Borehole depth and geometry
  {
    id: 13,
    unit: "m",
    description: "Voorgegraven diepte",
    category: "borehole_geometry",
    dataType: "float",
  },
  {
    id: 16,
    unit: "m",
    description: "Einddiepte",
    category: "borehole_geometry",
    dataType: "float",
  },
  {
    id: 18,
    unit: "m",
    description: "Grondwaterstand direct na boring",
    category: "groundwater",
    dataType: "float",
  },
  {
    id: 14,
    unit: "m",
    description: "GHG (gemiddeld hoogste grondwaterstand)",
    category: "groundwater",
    dataType: "float",
  },
  {
    id: 19,
    unit: "-",
    description: "Aantal peilbuizen",
    category: "monitoring_wells",
    dataType: "integer",
  },

  // Drilling segments - depth of bottom (odd numbers 31-49)
  {
    id: 31,
    unit: "m",
    description: "Diepte onderkant boortraject 1",
    category: "drilling_segments",
    dataType: "float",
  },
  {
    id: 33,
    unit: "m",
    description: "Diepte onderkant boortraject 2",
    category: "drilling_segments",
    dataType: "float",
  },
  {
    id: 35,
    unit: "m",
    description: "Diepte onderkant boortraject 3",
    category: "drilling_segments",
    dataType: "float",
  },
  {
    id: 37,
    unit: "m",
    description: "Diepte onderkant boortraject 4",
    category: "drilling_segments",
    dataType: "float",
  },
  {
    id: 39,
    unit: "m",
    description: "Diepte onderkant boortraject 5",
    category: "drilling_segments",
    dataType: "float",
  },
  {
    id: 41,
    unit: "m",
    description: "Diepte onderkant boortraject 6",
    category: "drilling_segments",
    dataType: "float",
  },
  {
    id: 43,
    unit: "m",
    description: "Diepte onderkant boortraject 7",
    category: "drilling_segments",
    dataType: "float",
  },
  {
    id: 45,
    unit: "m",
    description: "Diepte onderkant boortraject 8",
    category: "drilling_segments",
    dataType: "float",
  },
  {
    id: 47,
    unit: "m",
    description: "Diepte onderkant boortraject 9",
    category: "drilling_segments",
    dataType: "float",
  },
  {
    id: 49,
    unit: "m",
    description: "Diepte onderkant boortraject 10",
    category: "drilling_segments",
    dataType: "float",
  },

  // Drilling pipe diameter (even numbers 32-50)
  {
    id: 32,
    unit: "mm",
    description: "Boorbuisdiameter boortraject 1",
    category: "drilling_equipment",
    dataType: "float",
  },
  {
    id: 34,
    unit: "mm",
    description: "Boorbuisdiameter boortraject 2",
    category: "drilling_equipment",
    dataType: "float",
  },
  {
    id: 36,
    unit: "mm",
    description: "Boorbuisdiameter boortraject 3",
    category: "drilling_equipment",
    dataType: "float",
  },
  {
    id: 38,
    unit: "mm",
    description: "Boorbuisdiameter boortraject 4",
    category: "drilling_equipment",
    dataType: "float",
  },
  {
    id: 40,
    unit: "mm",
    description: "Boorbuisdiameter boortraject 5",
    category: "drilling_equipment",
    dataType: "float",
  },
  {
    id: 42,
    unit: "mm",
    description: "Boorbuisdiameter boortraject 6",
    category: "drilling_equipment",
    dataType: "float",
  },
  {
    id: 44,
    unit: "mm",
    description: "Boorbuisdiameter boortraject 7",
    category: "drilling_equipment",
    dataType: "float",
  },
  {
    id: 46,
    unit: "mm",
    description: "Boorbuisdiameter boortraject 8",
    category: "drilling_equipment",
    dataType: "float",
  },
  {
    id: 48,
    unit: "mm",
    description: "Boorbuisdiameter boortraject 9",
    category: "drilling_equipment",
    dataType: "float",
  },
  {
    id: 50,
    unit: "mm",
    description: "Boorbuisdiameter boortraject 10",
    category: "drilling_equipment",
    dataType: "float",
  },
] as const;

export const boreMeasurementTextVariables = [
  {
    id: 1,
    description: "Opdrachtgever",
    category: "project_info",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 2,
    description: "Doel onderzoek",
    category: "project_info",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 3,
    description: "Plaatsnaam",
    category: "location",
    required: true,
    standardizedCodes: null,
  },
  {
    id: 4,
    description: "Voor toekomstig gebruik gereserveerd",
    category: "reserved",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 5,
    description: "Datum boorbeschrijving",
    category: "project_info",
    required: true,
    standardizedCodes: null,
  },
  {
    id: 6,
    description: "Beschrijver lagen",
    category: "personnel",
    required: true,
    standardizedCodes: null,
  },
  {
    id: 7,
    description: "Lokaal coördinatensysteem",
    category: "coordinates",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 8,
    description: "Lokaal referentiesysteem",
    category: "reference_system",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 9,
    description: "Vast horizontaal niveau",
    category: "reference_system",
    required: true,
    standardizedCodes: null,
  },
  {
    id: 10,
    description: "Voor toekomstig gebruik gereserveerd",
    category: "reserved",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 11,
    description: "Maaiveldhoogtebepaling",
    category: "elevation_determination",
    required: false,
    standardizedCodes:  heightDeterminationCodes
  },
  {
    id: 12,
    description: "Plaatsbepalingmethode",
    category: "position_determination",
    required: false,
    standardizedCodes: placeDeterminationCodes,
  },
  {
    id: 13,
    description: "Boorbedrijf",
    category: "personnel",
    required: true,
    standardizedCodes: null,
  },
  {
    id: 14,
    description: "Vertrouwelijkheid",
    category: "data_management",
    required: false,
    standardizedCodes: [
      { code: "Ja", description: "vertrouwelijk" },
      { code: "Nee", description: "openbaar" },
    ],
  },
  {
    id: 15,
    description: "Einddatum geheimhouding",
    category: "data_management",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 16,
    description: "Datum boring",
    category: "project_info",
    required: true,
    standardizedCodes: null,
  },
  {
    id: 17,
    description: "Vochtigheidstoestand grond",
    category: "sample_condition",
    required: false,
    standardizedCodes: [
      { code: "droog", description: "droge grond" },
      { code: "nat", description: "veldvochtige grond" },
    ],
  },
  {
    id: 18,
    description: "Peilbuis aanwezigheid",
    category: "monitoring_wells",
    required: false,
    standardizedCodes: [
      { code: "Ja", description: "peilbuis aanwezig" },
      { code: "Nee", description: "peilbuis afwezig" },
    ],
  },
  {
    id: 19,
    description: "Einddatum boring",
    category: "project_info",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 20,
    description: "Bij sondering",
    category: "related_investigations",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 21,
    description: "Voor toekomstig gebruik gereserveerd",
    category: "reserved",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 22,
    description: "Voor toekomstig gebruik gereserveerd",
    category: "reserved",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 23,
    description: "Naam boormeester",
    category: "personnel",
    required: false,
    standardizedCodes: null,
  },

  // Drilling methods for segments 1-10 (measurementtext 31-40)
  {
    id: 31,
    description: "Boormethode boortraject 1",
    category: "drilling_methods",
    required: true,
    standardizedCodes: null,
  },
  {
    id: 32,
    description: "Boormethode boortraject 2",
    category: "drilling_methods",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 33,
    description: "Boormethode boortraject 3",
    category: "drilling_methods",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 34,
    description: "Boormethode boortraject 4",
    category: "drilling_methods",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 35,
    description: "Boormethode boortraject 5",
    category: "drilling_methods",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 36,
    description: "Boormethode boortraject 6",
    category: "drilling_methods",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 37,
    description: "Boormethode boortraject 7",
    category: "drilling_methods",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 38,
    description: "Boormethode boortraject 8",
    category: "drilling_methods",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 39,
    description: "Boormethode boortraject 9",
    category: "drilling_methods",
    required: false,
    standardizedCodes: null,
  },
  {
    id: 40,
    description: "Boormethode boortraject 10",
    category: "drilling_methods",
    required: false,
    standardizedCodes: null,
  },
] as const;

export type BoreMeasurementVariable = (typeof boreMeasurementVariables)[number];
export type BoreMeasurementTextVariable =
  (typeof boreMeasurementTextVariables)[number];

/**
 * Find a BORE measurement variable by ID
 */
export function findBoreMeasurementVariable(id: number) {
  return boreMeasurementVariables.find((v) => v.id === id);
}

/**
 * Find a BORE measurement text variable by ID
 */
export function findBoreMeasurementTextVariable(id: number) {
  return boreMeasurementTextVariables.find((v) => v.id === id);
}

/**
 * Decode a standardized code for a BORE measurement text variable
 */
export function decodeBoreMeasurementText(id: number, text: string): string {
  const variable = findBoreMeasurementTextVariable(id);
  if (!variable?.standardizedCodes) {
    return text;
  }

  const code = variable.standardizedCodes.find(
    (c) => c.code.toLowerCase() === text.trim().toLowerCase()
  );
  if (code) {
    return `${code.description} (${code.code})`;
  }

  return text;
}
