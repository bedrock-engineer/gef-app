// GEF-BORE specific schemas and metadata
// Note: DRILLING_METHOD_CODES is in gef-metadata.ts (used by decodeDrillingMethod)

// Bore-specific measurement variable IDs
export const BORE_MEASUREMENT_VAR_IDS = {
  13: { description: "voorgegraven diepte", unit: "m" },
  14: { description: "GHG (gemiddeld hoogste grondwaterstand)", unit: "m" },
  16: { description: "einddiepte", unit: "m" },
  18: { description: "grondwaterstand direct na boring", unit: "m" },
  19: { description: "aantal peilbuizen", unit: "-" },
  // Drilling segments - depth of bottom (odd numbers 31-49)
  31: { description: "diepte onderkant boortraject 1", unit: "m" },
  33: { description: "diepte onderkant boortraject 2", unit: "m" },
  35: { description: "diepte onderkant boortraject 3", unit: "m" },
  37: { description: "diepte onderkant boortraject 4", unit: "m" },
  39: { description: "diepte onderkant boortraject 5", unit: "m" },
  // Drilling pipe diameter (even numbers 32-50)
  32: { description: "boorbuisdiameter boortraject 1", unit: "mm" },
  34: { description: "boorbuisdiameter boortraject 2", unit: "mm" },
  36: { description: "boorbuisdiameter boortraject 3", unit: "mm" },
  38: { description: "boorbuisdiameter boortraject 4", unit: "mm" },
  40: { description: "boorbuisdiameter boortraject 5", unit: "mm" },
} as const;

// Bore-specific measurement text IDs
export const BORE_MEASUREMENT_TEXT_IDS = {
  1: "opdrachtgever",
  2: "doel onderzoek",
  3: "plaatsnaam",
  5: "datum boorbeschrijving",
  6: "beschrijver lagen",
  7: "locaal coördinatensysteem",
  8: "locaal referentiesysteem",
  9: "vast horizontaal niveau",
  11: "maaiveldhoogtebepaling",
  12: "plaatsbepalingmethode",
  13: "boorbedrijf",
  14: "vertrouwelijkheid",
  16: "datum boring",
  17: "vochtigheidstoestand grond",
  18: "peilbuis aanwezigheid",
  23: "naam boormeester",
  // Drilling methods for segments 1-10
  31: "boormethode boortraject 1",
  32: "boormethode boortraject 2",
  33: "boormethode boortraject 3",
  34: "boormethode boortraject 4",
  35: "boormethode boortraject 5",
} as const;

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

// Main soil type names for legend
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
