import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { BoreLayer, BoreSpecimen } from "@bedrock-engineer/gef-parser";
import { getSoilColor } from "@bedrock-engineer/gef-parser/bore";
import { decodeBoreCode } from "@bedrock-engineer/gef-parser/bore-codes";
import { Card, CardTitle } from "./card";
import { PlotDownloadButtons } from "./plot-download-buttons";
import {
  buildBorePlot,
  collectLegendSoils,
  patternMarkup,
} from "./bore-plot-render";

const id = "boreplot";

interface BorePlotProps {
  layers: Array<BoreLayer>;
  specimens?: Array<BoreSpecimen>;
  baseFilename: string;
  /** Groundwater depth during drilling (m below surface), GEF MEASUREMENTVAR 18 */
  groundwaterLevel?: number;
  width?: number;
  height?: number;
}

export function BorePlot({
  layers,
  specimens = [],
  groundwaterLevel,
  width = 350,
  height = 800,
  baseFilename,
}: BorePlotProps) {
  const { t, i18n } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current === null) {
      return;
    }

    // Current language drives specimen code formatting in tooltips
    const lang: "nl" | "en" = i18n.language === "en" ? "en" : "nl";

    const plot = buildBorePlot({
      layers,
      specimens,
      groundwaterLevel,
      width,
      height,
      lang,
      t,
    });
    if (plot === null) {
      return;
    }

    // @ts-expect-error TS2345: Argument of type 'SVGElement' is not assignable to parameter of type 'Node'.
    containerRef.current.append(plot);

    return () => {
      plot.remove();
    };
  }, [layers, specimens, groundwaterLevel, width, height, i18n.language, t]);

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

  // Legend entries reflect only the soils actually present in this borehole.
  const legendSoils = collectLegendSoils(layers);

  return (
    <Card>
      <CardTitle>{t("boreLog")}</CardTitle>

      <div className="flex justify-center">
        <div id={id} ref={containerRef}></div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {t("legend")}
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          {legendSoils.map((soil) => (
            <LegendItem
              key={soil}
              soil={soil}
              color={getSoilColor(soil)}
              label={`${soil} - ${labelForSoil(soil)}`}
            />
          ))}
        </div>
      </div>

      <PlotDownloadButtons plotId={id} filename={`${baseFilename}-boorstaat`} />
    </Card>
  );
}

function LegendItem({
  soil,
  color,
  label,
}: {
  soil: string;
  color: string;
  label: string;
}) {
  // Swatch mirrors the plot: solid colour with the soil's hatch overlaid.
  const patternId = `legend-hatch-${soil}`;
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
