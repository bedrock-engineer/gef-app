import { type GEFHeadersMap } from "./gef-common";
import type { ProcessedMetadata, ProcessedMeasurement } from "./gef-cpt";
import { processCommonFields } from "./gef-cpt";
import {
  getMeasurementTextKey,
  getMeasurementVarKey,
} from "./gef-measurement-mappings";
import {
  parseGefBoreHeaders,
  type GefBoreHeaders,
  type SpecimenText,
  type SpecimenVar,
} from "./gef-schemas";
import {
  heightDeterminationCodes,
  placeDeterminationCodes,
} from "./location-codes";

export interface GefBoreData {
  fileType: "BORE";
  layers: Array<BoreLayer>;
  specimens: Array<BoreSpecimen>;
  headers: GefBoreHeaders;
  warnings: Array<string>;
  processed: ProcessedMetadata;
}

const boreMeasurementVariables = [
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

// Drilling method codes for GEF-BORE files (NEN 5104)
const DRILLING_METHOD_CODES = {
  ACK: "Ackermann-steekboring",
  AVE: "Avegaarboring",
  AVH: "Holle avegaarboring",
  AVS: "Avegaar-steekboring",
  BES: "Begemann-steekboring",
  BEI: "Beitel",
  BSA: "Beeker-sampler",
  BEV: "Bevriezen",
  CFL: "Counter-flushboring",
  DRC: "Dropcorer",
  EDM: "Edelmanboring",
  GD1: "Geodoff 1 boring",
  GD2: "Geodoff 2 boring",
  GD3: "Geodoff 3 boring",
  GUT: "Guts",
  GRA: "Graven",
  HAH: "Hamon happer",
  HAN: "Handboring",
  HAP: "Hapmonster",
  KER: "Kernboring",
  LEP: "Lepelboring",
  LUC: "Luchtliftboring",
  LUH: "Luchthamer",
  ONT: "Ontsluiting",
  OSC: "Oscorer",
  PIS: "Pistoncorer",
  PUL: "Pulsboring",
  PUH: "Handpuls",
  PUK: "Pulsboring (lichte stelling)",
  PUM: "Pulsboring (mechanisch)",
  RAM: "Ramguts",
  RFL: "Ro-flushboring",
  RIV: "Riverside boring",
  SFC: "Straight-flushboring met core sampling",
  SFL: "Straight-flushboring",
  SLB: "Slibsteker",
  SPI: "Spiraalboring",
  SPO: "Spoelboring",
  SPS: "Spoelboring met steekmonsters",
  SPU: "Spuitboring",
  STE: "Steekboring",
  TRF: "Trilflipboring",
  TRI: "Trilboring",
  VDS: "Van der Staay boring",
  VVH: "Van Veen happer",
  VIB: "Vibrocorer",
  ZEN: "Zenkovitchboring",
  ZUI: "Zuigboring",
} as const;

const boreMeasurementTextVariables = [
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
    standardizedCodes: heightDeterminationCodes,
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
  // Uses standardized codes from NEN 5104
  {
    id: 31,
    description: "Boormethode boortraject 1",
    category: "drilling_methods",
    required: true,
    standardizedCodes: Object.entries(DRILLING_METHOD_CODES).map(([code, description]) => ({
      code,
      description,
    })),
  },
  {
    id: 32,
    description: "Boormethode boortraject 2",
    category: "drilling_methods",
    required: false,
    standardizedCodes: Object.entries(DRILLING_METHOD_CODES).map(([code, description]) => ({
      code,
      description,
    })),
  },
  {
    id: 33,
    description: "Boormethode boortraject 3",
    category: "drilling_methods",
    required: false,
    standardizedCodes: Object.entries(DRILLING_METHOD_CODES).map(([code, description]) => ({
      code,
      description,
    })),
  },
  {
    id: 34,
    description: "Boormethode boortraject 4",
    category: "drilling_methods",
    required: false,
    standardizedCodes: Object.entries(DRILLING_METHOD_CODES).map(([code, description]) => ({
      code,
      description,
    })),
  },
  {
    id: 35,
    description: "Boormethode boortraject 5",
    category: "drilling_methods",
    required: false,
    standardizedCodes: Object.entries(DRILLING_METHOD_CODES).map(([code, description]) => ({
      code,
      description,
    })),
  },
  {
    id: 36,
    description: "Boormethode boortraject 6",
    category: "drilling_methods",
    required: false,
    standardizedCodes: Object.entries(DRILLING_METHOD_CODES).map(([code, description]) => ({
      code,
      description,
    })),
  },
  {
    id: 37,
    description: "Boormethode boortraject 7",
    category: "drilling_methods",
    required: false,
    standardizedCodes: Object.entries(DRILLING_METHOD_CODES).map(([code, description]) => ({
      code,
      description,
    })),
  },
  {
    id: 38,
    description: "Boormethode boortraject 8",
    category: "drilling_methods",
    required: false,
    standardizedCodes: Object.entries(DRILLING_METHOD_CODES).map(([code, description]) => ({
      code,
      description,
    })),
  },
  {
    id: 39,
    description: "Boormethode boortraject 9",
    category: "drilling_methods",
    required: false,
    standardizedCodes: Object.entries(DRILLING_METHOD_CODES).map(([code, description]) => ({
      code,
      description,
    })),
  },
  {
    id: 40,
    description: "Boormethode boortraject 10",
    category: "drilling_methods",
    required: false,
    standardizedCodes: Object.entries(DRILLING_METHOD_CODES).map(([code, description]) => ({
      code,
      description,
    })),
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

// =============================================================================
// BORE Metadata Processing
// =============================================================================

/**
 * Process BORE-specific metadata (MEASUREMENTVAR, MEASUREMENTTEXT)
 * BORE files use different ID schemes than CPT files
 */
export function processBoreMetadata(
  filename: string,
  headers: GefBoreHeaders
): ProcessedMetadata {
  const common = processCommonFields(filename, "BORE", headers);

  // Process all MEASUREMENTVAR values using BORE-specific metadata
  const measurements: Record<string, ProcessedMeasurement> = {};
  
  if (headers.MEASUREMENTVAR) {
    for (const mv of headers.MEASUREMENTVAR) {
      const translationKey = getMeasurementVarKey(
        mv.id,
        boreMeasurementVariables
      );
      if (translationKey) {
        const value = parseFloat(mv.value);
        if (!isNaN(value)) {
          measurements[translationKey] = {
            value,
            unit: mv.unit,
          };
        }
      }
    }
  }

  // Process all MEASUREMENTTEXT values using BORE-specific metadata
  const texts: Record<string, string> = {};
  if (headers.MEASUREMENTTEXT) {
    for (const mt of headers.MEASUREMENTTEXT) {
      const translationKey = getMeasurementTextKey(
        mt.id,
        boreMeasurementTextVariables
      );
      if (translationKey) {
        texts[translationKey] = mt.text;
      }
    }
  }

  return {
    ...common,
    measurements,
    texts,
  };
}

// =============================================================================
// Soil Colors and Types
// =============================================================================

// Soil type colors based on NEN 5104 main classifications
// Main soil type codes and their colors for Boorstaat visualization
export const SOIL_COLORS: Record<string, string> = {
  // Gravel (Grind)
  G: "#D4A574", // tan/brown
  Gf: "#D4A574",
  Gm: "#C4956A",
  Gz: "#E4B584",

  // Sand (Zand)
  Z: "#FFE4A8", // yellow
  Zs1: "#FFE4A8",
  Zs2: "#FFD488",
  Zs3: "#FFC468",
  Zs4: "#FFB448",
  Zg1: "#FFE4A8",
  Zg2: "#FFD488",
  Zg3: "#FFC468",
  Zk1: "#FFECA8",
  Zk2: "#FFDC88",
  Zk3: "#FFCC68",

  // Silt (Leem)
  L: "#98D8C8", // greenish
  Ls1: "#98D8C8",
  Ls2: "#88C8B8",
  Ls3: "#78B8A8",
  Lz1: "#A8E8D8",
  Lz2: "#88C8B8",
  Lz3: "#68A898",

  // Clay (Klei)
  K: "#8B7355", // brown
  Ks1: "#8B7355",
  Ks2: "#7B6345",
  Ks3: "#6B5335",
  Kz1: "#9B8365",
  Kz2: "#8B7355",
  Kz3: "#7B6345",
  Kz1g1: "#9B8365",
  Kz1g2: "#8B7355",
  Kz2g1: "#7B6345",
  Kz2g2: "#6B5335",
  Kz3g1: "#5B4325",
  Kz3g2: "#4B3315",

  // Peat (Veen)
  V: "#4A3728", // dark brown
  Vk1: "#5A4738",
  Vk2: "#4A3728",
  Vk3: "#3A2718",
  Vz1: "#5A4738",
  Vz2: "#4A3728",
  Vz3: "#3A2718",
  Vh1: "#6A5748",
  Vh2: "#5A4738",
  Vh3: "#4A3728",

  // Anthropogenic (Made ground)
  NBE: "#808080", // gray - niet beschreven (not described)

  // Default
  default: "#CCCCCC",
};

// Get soil color by code - matches the start of the code for flexibility
export function getSoilColor(code: string): string {
  // First try exact match
  if (SOIL_COLORS[code]) {
    return SOIL_COLORS[code];
  }

  // Try matching main soil type (first character(s))
  const prefixes = [
    "Kz3g",
    "Kz2g",
    "Kz1g",
    "Kz",
    "Ks",
    "Vk",
    "Vz",
    "Vh",
    "Zs",
    "Zg",
    "Zk",
    "Ls",
    "Lz",
    "Gf",
    "Gm",
    "Gz",
    "K",
    "V",
    "Z",
    "L",
    "G",
  ];

  for (const prefix of prefixes) {
    if (code.startsWith(prefix)) {
      // Find a matching color
      const matchingKey = Object.keys(SOIL_COLORS).find((k) =>
        k.startsWith(prefix)
      );
      if (matchingKey && SOIL_COLORS[matchingKey]) {
        return SOIL_COLORS[matchingKey];
      }
    }
  }

  return SOIL_COLORS.default ?? "#CCCCCC";
}

export const SOIL_TYPE_NAMES: Record<string, string> = {
  G: "Grind (Gravel)",
  Z: "Zand (Sand)",
  L: "Leem (Silt)",
  K: "Klei (Clay)",
  V: "Veen (Peat)",
  NBE: "Niet beschreven (Not described)",
};

// Bore layer data structure
export interface BoreLayer {
  depthTop: number;
  depthBottom: number;
  soilCode: string;
  additionalCodes: Array<string>;
  description?: string;
  // Numeric properties (may be null/void)
  sandMedian?: number | null;
  gravelMedian?: number | null;
  clayPercent?: number | null;
  siltPercent?: number | null;
  sandPercent?: number | null;
  gravelPercent?: number | null;
  organicPercent?: number | null;
}

// Specimen codes based on GEF-BORE specification
export const SPECIMEN_CODES = {
  geroerd: [
    { code: "G", description: "Geroerd (Disturbed)" },
    { code: "O", description: "Ongeroerd (Undisturbed)" },
  ],
  monstersteekapparaat: [
    { code: "AMS", description: "Ackermann-apparaat" },
    { code: "BMS", description: "Begemann-continu-monstersteekapparaat" },
    { code: "DMS", description: "Druksteekapparaat" },
    { code: "ZMS", description: "Zuiger-monstersteekapparaat" },
    { code: "OMS", description: "Open monstersteekapparaat" },
    { code: "SMS", description: "Monstersteekapparaat SPT" },
  ],
  dikDunwandig: [
    { code: "DIK", description: "Dikwandig (Thick-walled)" },
    { code: "DUN", description: "Dunwandig (Thin-walled)" },
  ],
  monstermethode: [
    { code: "D", description: "Drukken (Pushed/Static)" },
    { code: "H", description: "Hameren (Hammered/Dynamic)" },
  ],
} as const;

// Specimen data structure for bore files
export interface BoreSpecimen {
  specimenNumber: number; // k (1-200)
  depthTop: number;
  depthBottom: number;
  // Numerical properties from SPECIMENVAR
  diameterMonster?: number | null;
  diameterMonstersteekapparaat?: number | null;
  // Text properties from SPECIMENTEXT
  monstercode?: string;
  monsterdatum?: string;
  monstertijd?: string;
  geroerdOngeroerd?: string;
  monstersteekapparaat?: string;
  dikDunwandig?: string;
  monstermethode?: string;
  // Remarks (SPECIMENTEXT 1-5)
  remarks?: Array<string>;
}

const specimenVarOffsets = {
  depthTop: 4,
  depthBottom: 5,
  diameterMonster: 6,
  diameterMonstersteekapparaat: 7,
} as const;

// Helper to calculate SPECIMENVAR ID for a given specimen number k
export function getSpecimenVarId(
  k: number,
  property: keyof typeof specimenVarOffsets
): number {
  return specimenVarOffsets[property] + 7 * k;
}

const specimentTextOffsets = {
  monstercode: 4,
  monsterdatum: 5,
  monstertijd: 6,
  geroerdOngeroerd: 7,
  monstersteekapparaat: 8,
  dikDunwandig: 9,
  monstermethode: 10,
} as const;

// Helper to calculate SPECIMENTEXT ID for a given specimen number k
export function getSpecimenTextId(
  k: number,
  property: keyof typeof specimentTextOffsets
): number {
  return specimentTextOffsets[property] + 7 * k;
}

export function parseGefBoreData(
  dataString: string,
  headersMap: GEFHeadersMap
): { layers: Array<BoreLayer>; headers: GefBoreHeaders } {
  const headers = parseGefBoreHeaders(headersMap);
  const columnSeparator = headers.COLUMNSEPARATOR ?? ";";
  const columnInfo = headers.COLUMNINFO ?? [];

  const recordSeparator = headers.RECORDSEPARATOR ?? "!";
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

export function parseGefBoreSpecimens(
  headers: GefBoreHeaders
): Array<BoreSpecimen> {
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
    // Get SPECIMENVAR values using helper function
    const depthTopVar = varMap.get(getSpecimenVarId(k, "depthTop"));
    const depthBottomVar = varMap.get(getSpecimenVarId(k, "depthBottom"));
    const diameterMonsterVar = varMap.get(getSpecimenVarId(k, "diameterMonster"));
    const diameterApparaatVar = varMap.get(getSpecimenVarId(k, "diameterMonstersteekapparaat"));

    // Get SPECIMENTEXT values using helper function
    const monstercodeText = textMap.get(getSpecimenTextId(k, "monstercode"));
    const monsterdatumText = textMap.get(getSpecimenTextId(k, "monsterdatum"));
    const monstertijdText = textMap.get(getSpecimenTextId(k, "monstertijd"));
    const geroerdText = textMap.get(getSpecimenTextId(k, "geroerdOngeroerd"));
    const monstersteekapparaatText = textMap.get(getSpecimenTextId(k, "monstersteekapparaat"));
    const dikDunwandigText = textMap.get(getSpecimenTextId(k, "dikDunwandig"));
    const monstermethodeText = textMap.get(getSpecimenTextId(k, "monstermethode"));

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


// Generate BORE-specific warnings
export function generateBoreWarnings(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filename: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  headers: GefBoreHeaders
): Array<string> {
  const warnings: Array<string> = [];

  // BORE-specific validations can be added here
  // For now, no specific validations beyond common ones

  return warnings;
}
