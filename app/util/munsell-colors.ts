import * as munsell from "munsell";

// Munsell color code pattern: e.g., "10YR5/6", "2.5Y8/2", "7.5YR4/4"
const MUNSELL_PATTERN = /^\d+\.?\d*[A-Z]{1,2}\d+\/\d+$/;

/**
 * Check if a string is a Munsell color code
 */
export function isMunsellCode(code: string): boolean {
  return MUNSELL_PATTERN.test(code.trim().toUpperCase());
}

/**
 * Extract Munsell code from an array of additional codes
 * Returns the first Munsell code found, or undefined
 */
export function extractMunsellCode(codes: Array<string>): string | undefined {
  return codes.find((code) => isMunsellCode(code));
}

/**
 * Convert a Munsell color code to hex color
 * Returns undefined if conversion fails
 */
export function munsellToHex(code: string): string | undefined {
  try {
    // The munsell library expects format like "10YR 5/6" with a space
    // But GEF files often have "10YR5/6" without space
    // Insert space before the value (digit followed by /)
    const normalizedCode = code
      .trim()
      .toUpperCase()
      .replace(/(\d)(\d+\/\d+)$/, "$1 $2");

    const hex = munsell.munsellToHex(normalizedCode);
    return hex;
  } catch {
    return undefined;
  }
}

/**
 * Get Munsell color from additional codes array
 * Returns both the code and its hex value
 */
export function getMunsellColor(
  additionalCodes: Array<string>,
): { code: string; hex: string } | undefined {
  const code = extractMunsellCode(additionalCodes);
  if (!code) {
    return undefined;
  }

  const hex = munsellToHex(code);
  if (!hex) {
    return undefined;
  }

  return { code, hex };
}
