/**
 * Generate a translation key from a description string
 * Converts "End depth of penetration test" → "endDepthOfPenetrationTest"
 */
function descriptionToKey(description: string): string {
  return description
    .split(/[\s,()/-]+/) // Split on spaces, commas, parentheses, slashes, hyphens
    .filter((word) => word.length > 0)
    .map((word, index) => {
      // Lowercase first word, capitalize rest
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
}

/**
 * Get translation key for a MEASUREMENTVAR ID
 * Uses the English description from metadata to generate a camelCase key
 */
export function getMeasurementVarKey(
  id: number,
  metadata: ReadonlyArray<{ id: number; description: string }>,
): string | null {
  const item = metadata.find((m) => m.id === id);
  if (!item) {
    return null;
  }
  return descriptionToKey(item.description);
}

/**
 * Get translation key for a MEASUREMENTTEXT ID
 * Uses the English description from metadata to generate a camelCase key
 */
export function getMeasurementTextKey(
  id: number,
  metadata: ReadonlyArray<{ id: number; description: string }>,
): string | null {
  const item = metadata.find((m) => m.id === id);
  if (!item) {
    return null;
  }
  return descriptionToKey(item.description);
}
