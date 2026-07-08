import { useTranslation } from "react-i18next";
import type { BoreLayer, BoreSpecimen } from "@bedrock-engineer/gef-parser";
import { usePlot } from "../util/use-plot";
import { Card, CardTitle } from "./card";
import { PlotDownloadButtons } from "./plot-download-buttons";
import { SoilLegend } from "./soil-legend";
import { buildBorePlot, collectLegendSoils } from "./bore-plot-render";

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

  const containerRef = usePlot(() => {
    // Current language drives specimen code formatting in tooltips
    const lang: "nl" | "en" = i18n.language === "en" ? "en" : "nl";

    return buildBorePlot({
      layers,
      specimens,
      groundwaterLevel,
      width,
      height,
      lang,
      t,
    });
  }, [layers, specimens, groundwaterLevel, width, height, i18n.language, t]);

  // Legend entries reflect only the soils actually present in this borehole.
  const legendSoils = collectLegendSoils(layers);

  return (
    <Card>
      <CardTitle>{t("boreLog")}</CardTitle>

      <div className="flex justify-center">
        <div id={id} ref={containerRef}></div>
      </div>

      <SoilLegend soils={legendSoils} idPrefix="bore-legend" />

      <PlotDownloadButtons plotId={id} filename={`${baseFilename}-boorstaat`} />
    </Card>
  );
}
