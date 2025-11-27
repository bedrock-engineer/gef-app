import { format } from "d3-format";

export interface HeaderItem {
  label: string;
  value: React.ReactNode;
}

const formatNumber = format(".3~f");

/**
 * Format a numeric value string, removing unnecessary trailing zeros
 * "0.000000" -> "0", "1.500000" -> "1.5", "1.234567" -> "1.235"
 */
export function formatNumericValue(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return value;
  }
  return formatNumber(num);
}

export function getLocalizedDescription(
  varInfo: { description: string; descriptionNl?: string } | undefined,
  locale: string
): string {
  if (!varInfo) {
    return "";
  }
  if (locale === "nl" && varInfo.descriptionNl) {
    return varInfo.descriptionNl;
  }
  return varInfo.description;
}

export const countryCodeTranslationMap = {
  "31": "countryNetherlands",
  "32": "countryBelgium",
  "49": "countryGermany",
} as const;
