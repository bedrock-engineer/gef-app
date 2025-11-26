/**
 * GEF-BORE code dictionary based on GEF-BORE-Report specification
 * All descriptions are in Dutch as per the original specification
 */

// Table 2.15: Grondsoorten volgens NEN 5104
export const NEN5104_SOIL_CODES: Record<string, string> = {
  // Grind
  Gs: "Grind, siltig",
  Gz1: "Grind, zwak zandig",
  Gz2: "Grind, matig zandig",
  Gz3: "Grind, sterk zandig",
  Gz4: "Grind, uiterst zandig",
  // Klei
  Ks1: "Klei, zwak siltig",
  Ks2: "Klei, matig siltig",
  Ks3: "Klei, sterk siltig",
  Ks4: "Klei, uiterst siltig",
  Kz1: "Klei, zwak zandig",
  Kz2: "Klei, matig zandig",
  Kz3: "Klei, sterk zandig",
  // Leem
  Lz1: "Leem, zwak zandig",
  Lz3: "Leem, sterk zandig",
  // Veen
  Vm: "Veen, mineraalarm",
  Vk1: "Veen, zwak kleiig",
  Vk3: "Veen, matig kleiig",
  Vz1: "Veen, zwak zandig",
  Vz3: "Veen, matig zandig",
  // Zand
  Zk: "Zand, kleiig",
  Zs1: "Zand, zwak siltig",
  Zs2: "Zand, matig siltig",
  Zs3: "Zand, sterk siltig",
  Zs4: "Zand, uiterst siltig",
  // Toevoegingen
  g1: "zwak grindig",
  g2: "matig grindig",
  g3: "sterk grindig",
  h1: "zwak humeus",
  h2: "matig humeus",
  h3: "sterk humeus",
  // Speciale codes
  GM: "geen monster",
  NBE: "niet benoemd",
};

// Table 2.16: Grondsoorten niet volgens NEN 5104
export const NON_STANDARD_SOIL_CODES: Record<string, string> = {
  G: "grind",
  K: "klei",
  L: "leem",
  V: "veen",
  Z: "zand",
  KX: "kleiig",
  K1: "zwak kleiig",
  K3: "sterk kleiig",
  SX: "siltig",
  S1: "zwak siltig",
  S2: "matig siltig",
  S3: "sterk siltig",
  S4: "uiterst siltig",
  ZX: "zandig",
  Z1: "zwak zandig",
  Z2: "matig zandig",
  Z3: "sterk zandig",
  Z4: "uiterst zandig",
  GX: "grindig",
  G1: "zwak grindig",
  G2: "matig grindig",
  G3: "sterk grindig",
  HX: "humeus",
  H1: "zwak humeus",
  H2: "matig humeus",
  H3: "sterk humeus",
};

// Table 2.17: Aanvullende grondsoorten
export const ADDITIONAL_SOIL_CODES: Record<string, string> = {
  // Grote korrels
  BLK: "blokken",
  KEI: "keien",
  STN: "stenen",
  // Organisch
  BRK: "bruinkool",
  DET: "detritus",
  DY: "dy",
  GY: "gyttja",
  HO: "hout",
  // Mineralen
  GCZ: "glauconietzand",
  GOZ: "goethietzand",
  SHE: "schelpen",
  SLI: "slib",
  // Gesteenten
  KAS: "kalksteen",
  LEI: "leisteen",
  MER: "mergel",
  SHA: "schalie",
  ZNS: "zandsteen",
  GES: "vast gesteente",
  // Antropogeen
  AF: "afval",
  AS: "asfalt",
  BE: "beton",
  BI: "bitumen",
  BT: "ballast",
  BST: "baksteen",
  GI: "gips",
  GA: "glas",
  HK: "houtskool",
  HU: "huisvuil",
  KA: "kalk",
  KG: "kolengruis",
  KO: "kolen",
  KT: "krijt",
  ME: "metaal",
  MI: "mijnsteen",
  OE: "oer",
  PL: "planten",
  PU: "puin",
  SI: "sintels",
  SL: "slakken",
  WO: "wortels",
  YZ: "ijzer",
};

// Table 2.19: Tweede kleur
export const SECONDARY_COLORS: Record<string, string> = {
  TBL: "blauw-",
  TBR: "bruin-",
  TGE: "geel-",
  TGN: "groen-",
  TGR: "grijs-",
  TOL: "olijf-",
  TOR: "oranje-",
  TPA: "paars-",
  TRO: "rood-",
  TWI: "wit-",
  TRZ: "roze-",
  TZW: "zwart-",
};

// Table 2.20: Hoofdkleur
export const MAIN_COLORS: Record<string, string> = {
  BL: "blauw",
  BR: "bruin",
  GE: "geel",
  GN: "groen",
  GR: "grijs",
  OL: "olijf",
  OR: "oranje",
  PA: "paars",
  RO: "rood",
  WI: "wit",
  RZ: "roze",
  ZW: "zwart",
  // Intensiteit
  LI: "licht",
  DO: "donker",
};

// Table 2.21: Zandmediaanklasse
export const SAND_MEDIAN_CLASSES: Record<string, string> = {
  ZUF: "uiterst fijn",
  ZZF: "zeer fijn",
  ZMF: "matig fijn",
  ZMG: "matig grof",
  ZZG: "zeer grof",
  ZUG: "uiterst grof",
};

// Table 2.22: Zandspreiding
export const SAND_SPREAD: Record<string, string> = {
  SZK: "zeer kleine spreiding",
  SMK: "matig kleine spreiding",
  SMG: "matig grote spreiding",
  SZG: "zeer grote spreiding",
  STW: "tweetoppige spreiding",
};

// Table 2.23: Korrelvorm
export const GRAIN_SHAPE: Record<string, string> = {
  ZZH: "sterk hoekig",
  ZHK: "hoekig",
  ZMH: "matig hoekig",
  ZMA: "matig afgerond",
  ZAF: "afgerond",
  ZSA: "sterk afgerond",
};

// Table 2.24: Grindmediaanklasse
export const GRAVEL_MEDIAN_CLASSES: Record<string, string> = {
  GFN: "fijn grind",
  GMG: "matig grof grind",
  GZG: "zeer grof grind",
};

// Table 2.25: Grindfracties en hoeveelheden
export const GRAVEL_FRACTIONS: Record<string, string> = {
  FN1: "spoor fijn grind",
  FN2: "weinig fijn grind",
  FN3: "veel fijn grind",
  FN4: "zeer veel fijn grind",
  FN5: "uiterst veel fijn grind",
  MG1: "spoor matig grof grind",
  MG2: "weinig matig grof grind",
  MG3: "veel matig grof grind",
  MG4: "zeer veel matig grof grind",
  MG5: "uiterst veel matig grof grind",
  GG1: "spoor zeer grof grind",
  GG2: "weinig zeer grof grind",
  GG3: "veel zeer grof grind",
  GG4: "zeer veel zeer grof grind",
  GG5: "uiterst veel zeer grof grind",
};

// Table 2.26: Veen amorfiteit
export const PEAT_AMORPHOSITY: Record<string, string> = {
  AV1: "zwak amorf",
  AV2: "matig amorf",
  AV3: "sterk amorf",
};

// Table 2.27: Veensoorten
export const PEAT_TYPES: Record<string, string> = {
  BSV: "bosveen",
  HEV: "heideveen",
  MOV: "mosveen",
  RIV: "rietveen",
  SZV: "Scheuchzeriaveen",
  VMV: "veenmosveen",
  WOV: "wollegrasveen",
  ZEV: "zeggeveen",
};

// Table 2.28: Consistentie
export const CONSISTENCY: Record<string, string> = {
  // Klei
  KZSL: "zeer slap",
  KSLA: "slap",
  KMSL: "matig slap",
  KMST: "matig stevig",
  KSTV: "stevig",
  KZST: "zeer stevig",
  KHRD: "hard",
  KZHR: "zeer hard",
  // Leem
  LZSL: "zeer slap",
  LSLA: "slap",
  LMSL: "matig slap",
  LMST: "matig stevig",
  LSTV: "stevig",
  LZST: "zeer stevig",
  LHRD: "hard",
  LZHR: "zeer hard",
  // Veen
  VZSL: "zeer slap",
  VSLA: "slap",
  VMSL: "matig slap",
  VMST: "matig stevig",
  VSTV: "stevig",
};

// Table 2.29: Zandcompactie
export const SAND_COMPACTION: Record<string, string> = {
  LOS: "los gepakt",
  NOR: "normaal gepakt",
  VAS: "vast gepakt",
};

// Table 2.30: Vast gesteente hardheid
export const ROCK_HARDNESS: Record<string, string> = {
  VGZZ: "zeer zacht",
  VGZA: "zacht",
  VGMZ: "matig zacht",
  VGMH: "matig hard",
  VGHA: "hard",
  VGZH: "zeer hard",
  VGEH: "extreem hard",
};

// Table 2.31: Hoeveelheid schelpmateriaal
export const SHELL_CONTENT: Record<string, string> = {
  SCH0: "geen schelpmateriaal",
  SCH1: "spoor schelpmateriaal",
  SCH2: "weinig schelpmateriaal",
  SCH3: "veel schelpmateriaal",
};

// Table 2.32: Kalkgehalte
export const CALCIUM_CONTENT: Record<string, string> = {
  CA1: "kalkloos",
  CA2: "kalkarm",
  CA3: "kalkrijk",
};

// Table 2.33: Glauconietgehalte
export const GLAUCONITE_CONTENT: Record<string, string> = {
  GC0: "geen glauconiet",
  GC1: "spoor glauconiet",
  GC2: "weinig glauconiet",
  GC3: "veel glauconiet",
  GC4: "zeer veel glauconiet",
  GC5: "uiterst veel glauconiet",
};

// Table 2.34: Antropogene bijmengingen
export const ANTHROPOGENIC_ADMIXTURES: Record<string, string> = {
  BST1: "spoor baksteen",
  BST2: "weinig baksteen",
  BST3: "veel baksteen",
  PUR1: "spoor puinresten",
  PUR2: "weinig puinresten",
  PUR3: "veel puinresten",
  SIN1: "spoor sintels",
  SIN2: "weinig sintels",
  SIN3: "veel sintels",
  STO1: "spoor stortsteen",
  STO2: "weinig stortsteen",
  STO3: "veel stortsteen",
  VUI1: "spoor vuilnis",
  VUI2: "weinig vuilnis",
  VUI3: "veel vuilnis",
  GL: "gley",
  RT: "roest",
  SE: "silex",
};

// Table 2.35: Gelaagdheid
export const LAYERING: Record<string, string> = {
  BIO: "bioturbatie",
  DWO: "doorworteling",
  GCM: "cm-gelaagdheid",
  GDM: "dm-gelaagdheid",
  GDU: "dubbeltjes-gelaagdheid",
  GMM: "mm-gelaagdheid",
  GRG: "graafgangen",
  GSC: "scheve gelaagdheid",
  GSP: "spekkoek-gelaagdheid",
  HOM: "homogeen",
  GE1: "zwak gelaagd",
  GE2: "weinig gelaagd",
  GE3: "sterk gelaagd",
  GEX: "gelaagd",
  STGL: "met grindlagen",
  STKL: "met kleilagen",
  STLL: "met leemlagen",
  STSL: "met stenenlagen",
  STVL: "met veenlagen",
  STZL: "met zandlagen",
  STBR: "met bruinkoollagen",
  STDE: "met detrituslagen",
  STGY: "met gyttjalagen",
  STSC: "met schelpenlagen",
};

// Table 2.36: Geologische interpretatie
export const GEOLOGICAL_INTERPRETATION: Record<string, string> = {
  ANT: "Antropogeen",
  BOO: "Boomse klei",
  DEZ: "dekzand",
  KEL: "keileem",
  LSS: "loess",
  POK: "potklei",
  WAR: "warven",
};

// Table 2.37: Stratigrafische eenheden
export const STRATIGRAPHIC_UNITS: Record<string, string> = {
  DR: "Formatie van Drente",
  EC: "Formatie van Echteld",
  KR: "Formatie van Kreftenheye",
  NA: "Formatie van Naaldwijk",
  NI: "Formatie van Nieuwkoop",
  TW: "Formatie van Twente",
  WA: "Formatie van Waalre",
};

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

/**
 * Get soil code from a Dutch description by keyword matching
 * Returns the main soil type code (G, K, L, V, Z) or "NBE" if not found
 */
export function getSoilCodeFromDescription(description: string): string {
  const lower = description.toLowerCase();

  // Check for main soil types in order of specificity
  if (lower.includes("grind")) {
    return "G";
  }
  if (lower.includes("veen")) {
    return "V";
  }
  if (lower.includes("klei")) {
    return "K";
  }
  if (lower.includes("leem")) {
    return "L";
  }
  if (lower.includes("zand")) {
    return "Z";
  }

  // Default fallback
  return "NBE";
}

/**
 * Decode a GEF-BORE code to its Dutch description
 * Returns the original code if not found
 */
export function decodeBoreCode(code: string): string {
  const upperCode = code.trim().toUpperCase();
  return ALL_CODES[upperCode] ?? ALL_CODES[code] ?? code;
}

