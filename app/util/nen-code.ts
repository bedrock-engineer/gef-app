import { decodeBoreCode } from "@bedrock-engineer/gef-parser";

// Main NEN 5104 soil types (eerste letter van de soilCode).
const MAIN_SOILS = new Set(["G", "K", "L", "V", "Z"]);

export interface NenAdmixture {
  /** Admixture letter: s siltig, z zandig, g grindig, h humeus, k kleiig. */
  letter: string;
  /** Grade 1 (zwak) – 4 (uiterst); 1 when no digit is present. */
  grade: number;
  /** Whether an explicit grade digit was present (vs. an ungraded admixture). */
  graded: boolean;
}

export interface NenCode {
  /** The lithology token — the first whitespace-separated part, e.g. "Ks1h3". */
  raw: string;
  /** Main soil letter G/K/L/V/Z, or "" for special/unknown codes. */
  main: string;
  /** True for a decomposable main-soil code, false for specials (NBE, GM, …). */
  isComposite: boolean;
  /** Parsed admixtures (empty for pure soils and specials). */
  admixtures: Array<NenAdmixture>;
  /** Trailing space-separated qualifiers, e.g. ["GCZ"] for "Zs1 GCZ". */
  qualifiers: Array<string>;
}

/**
 * Tokenize a NEN 5104 soil code into its structural parts. This is the single
 * source of truth for reading these codes; callers interpret the result for
 * their own purpose (e.g. coloured composition bands, or a text description).
 *
 * A code is a main soil letter followed by `letter+grade` admixtures
 * ("Ks1h3" = clay + zwak siltig + sterk humeus), optionally trailed by
 * space-separated qualifiers ("Zs1 GCZ"). Special codes that don't start with a
 * main soil (NBE, GM) are returned with `isComposite: false`.
 */
export function parseNenCode(code: string): NenCode {
  const [lithology = "", ...qualifiers] = code.trim().split(/\s+/).filter(Boolean);
  const main = lithology[0] ?? "";
  const second = lithology[1];
  const isComposite =
    MAIN_SOILS.has(main) &&
    // second char lowercase => admixtures follow; uppercase => special code
    (second === undefined || second === second.toLowerCase());

  const admixtures: Array<NenAdmixture> = [];
  if (isComposite) {
    const re = /([a-z])([1-4])?/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(lithology.slice(1))) !== null) {
      admixtures.push({
        letter: m[1] ?? "",
        grade: m[2] ? Number(m[2]) : 1,
        graded: m[2] != null,
      });
    }
  }

  return { raw: lithology, main, isComposite, admixtures, qualifiers };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Decode a single token into readable Dutch. Prefers a direct dictionary hit
 * (covers pure soils "K", single-admixture codes "Ks1" and specials "Vm",
 * "NBE"); otherwise composes the description from the main soil plus admixtures,
 * decoding each part via the parser so no Dutch strings are duplicated here.
 */
function decodeToken(token: string): string {
  const direct = decodeBoreCode(token);
  if (direct !== token) {
    return direct;
  }

  const { main, isComposite, admixtures } = parseNenCode(token);
  if (!isComposite) {
    return token;
  }
  const mainName = decodeBoreCode(main);
  if (mainName === main) {
    return token;
  }

  const parts = [capitalize(mainName)];
  for (const a of admixtures) {
    // Uppercasing letter+grade (or letter+X when ungraded) matches the parser's
    // admixture keys, e.g. "s1" -> "S1" -> "zwak siltig", "k" -> "KX" -> "kleiig".
    const key = (a.letter + (a.graded ? String(a.grade) : "X")).toUpperCase();
    const name = decodeBoreCode(key);
    if (name !== key) {
      parts.push(name);
    }
  }
  return parts.join(", ");
}

/**
 * Decode a full NEN 5104 soil code into a human-readable Dutch description,
 * including multi-admixture codes ("Ks1h3" -> "Klei, zwak siltig, sterk
 * humeus") and trailing qualifiers ("Zs1 GCZ" -> "Zand, zwak siltig,
 * glauconietzand"). Tokens that can't be decoded are kept as-is.
 */
export function decodeNenCode(code: string): string {
  return code
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(decodeToken)
    .join(", ");
}
