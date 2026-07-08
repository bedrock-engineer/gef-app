import { useTranslation } from "react-i18next";
import { decodeBoreCode } from "@bedrock-engineer/gef-parser/bore-codes";
import { getSoilColor } from "../util/soil-colors";
import { patternMarkup } from "./bore-plot-render";

interface SoilLegendProps {
  soils: Array<string>;
  /** Prefix for pattern ids, unique per plot so multiple legends can coexist. */
  idPrefix: string;
}

// Legend for soil-log style plots (bore log, pre-excavation): one swatch per
// soil actually present, mirroring the plot's colour + hatch conventions.
export function SoilLegend({ soils, idPrefix }: SoilLegendProps) {
  const { t } = useTranslation();

  // Human-readable label for a soil key (literal t() keys keep i18n type-safe).
  function labelForSoil(soil: string): string {
    switch (soil) {
      case "Z":
        return t("sand");
      case "K":
        return t("clay");
      case "V":
        return t("peat");
      case "L":
        return t("silt");
      case "G":
        return t("gravel");
      case "NBE":
        return t("notDescribed");
      default: {
        const decoded = decodeBoreCode(soil);
        return decoded && decoded !== soil ? decoded : soil;
      }
    }
  }

  if (soils.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">{t("legend")}</h4>
      <div className="flex flex-wrap gap-2 text-xs">
        {soils.map((soil) => (
          <LegendItem
            key={soil}
            soil={soil}
            idPrefix={idPrefix}
            color={getSoilColor(soil)}
            label={`${soil} - ${labelForSoil(soil)}`}
          />
        ))}
      </div>
    </div>
  );
}

interface LegendItemProps {
  soil: string;
  idPrefix: string;
  color: string;
  label: string;
}

function LegendItem({ soil, idPrefix, color, label }: LegendItemProps) {
  // Swatch mirrors the plot: solid colour with the soil's hatch overlaid.
  const patternId = `${idPrefix}-hatch-${soil}`;
  const hatch = patternMarkup(soil, patternId);
  return (
    <div className="flex items-center gap-1">
      <svg
        width="16"
        height="16"
        className="border border-gray-300 block shrink-0"
        aria-hidden="true"
      >
        {hatch && <defs dangerouslySetInnerHTML={{ __html: hatch }} />}
        <rect width="16" height="16" fill={color} />
        {hatch && <rect width="16" height="16" fill={`url(#${patternId})`} />}
      </svg>
      <span className="text-gray-600">{label}</span>
    </div>
  );
}
