import { parseSoilCode } from "@bedrock-engineer/gef-parser/bore-codes";

/**
 * Soil-log fill colours, keyed by NEN 5104 main soil codes (G/Z/L/K/V).
 *
 * Colours are ported from the `brodata` Python package (ArtesiaWater),
 * `plot.py` `get_bro_lithology_properties` (RGB→hex), to stay consistent with
 * bro-webapp's borehole plot (`bro-lithology.ts`) and with the hatch patterns
 * in `bore-plot-render.ts`, which already follow brodata's conventions.
 *
 * brodata uses one flat colour per lithology; admixtures (siltig, kleiig, …)
 * are a separate visual channel (sub-bands / hatch), not a darker shade — so
 * this table only needs the main soil letters plus the "no data" specials.
 * `getSoilColor` falls a graded code like "Ks2h1" back to its main soil "K".
 */
export const SOIL_COLORS: Record<string, string> = {
  G: "#f3c027", // grind / gravel — golden
  Z: "#fefe08", // zand / sand — yellow (unspecified median)
  L: "#dbdbdb", // leem / silt — light grey
  K: "#009608", // klei / clay — green
  V: "#994c3a", // veen / peat — brown

  // No-data specials
  NBE: "#7030a0", // niet beschreven (not described) — brodata nietBepaald
  GM: "#7030a0", // geen monster (no sample)

  default: "#b0b0b0", // brodata DEFAULT_LAYER_COLOR
};

export function getSoilColor(code: string): string {
  // Exact match first (covers the main letters and the "no data" specials).
  const exact = SOIL_COLORS[code];
  if (exact) {
    return exact;
  }

  // Otherwise resolve a graded/admixed code ("Ks2h1", "Zs3") to its main soil.
  const { main } = parseSoilCode(code);
  if (main) {
    const base = SOIL_COLORS[main];
    if (base) {
      return base;
    }
  }

  return SOIL_COLORS.default ?? "#b0b0b0";
}
