import type { PreExcavationLayer } from "@bedrock-engineer/gef-parser";
import * as Plot from "@observablehq/plot";
import { max } from "d3-array";
import { useTranslation } from "react-i18next";
import { usePlot } from "../util/use-plot";
import { Card, CardTitle } from "./card";
import { PlotDownloadButtons } from "./plot-download-buttons";
import { SoilLegend } from "./soil-legend";
import {
  MIN_LAYER_HEIGHT_PX,
  buildBands,
  collectLegendSoils,
  injectHatchPatterns,
  type Band,
} from "./bore-plot-render";

interface PreExcavationPlotProps {
  layers: Array<PreExcavationLayer>;
  width?: number;
  height?: number;
  baseFilename: string;
}

export function PreExcavationPlot({
  layers,
  width = 150,
  height = 300,
  baseFilename,
}: PreExcavationPlotProps) {
  const { t } = useTranslation();

  const containerRef = usePlot(
    function buildExcavationPlot() {
      if (layers.length === 0) {
        return null;
      }

      // Calculate the depth range and pixels per meter
      const maxDepth = max(layers.map((l) => l.depthBottom)) ?? 1;
      const marginTop = 20;
      const marginBottom = 15;
      const plotHeight = height - marginTop - marginBottom; // subtract margins
      const pixelsPerMeter = plotHeight / maxDepth;

      // Filter layers that are tall enough in pixels to show labels
      const layersWithLabels = layers.filter((d) => {
        const layerThickness = d.depthBottom - d.depthTop;
        const layerHeightPx = layerThickness * pixelsPerMeter;
        return layerHeightPx >= MIN_LAYER_HEIGHT_PX;
      });

      // Split each layer into proportional composition bands (main soil +
      // admixtures), same as the bore plot; soilCode is derived from the
      // free-text description by the parser.
      const bands = buildBands(layers);
      const hatchedBands = bands.filter((b) => b.hatch);

      const plot = Plot.plot({
        style: {
          overflow: "visible",
          backgroundColor: "white",
        },
        width,
        height,
        marginLeft: 50,
        marginRight: 20,
        marginTop,
        marginBottom,
        // Use fill values verbatim (hex colours and url(#pattern) refs)
        color: { type: "identity" },
        x: {
          axis: null,
          domain: [0, 1],
        },
        y: {
          reverse: true,
          label: "Depth (m)",
          grid: true,
          domain: [0, maxDepth],
        },
        marks: [
          // Soil composition bands: main soil + admixtures, widths proportional
          // to the NEN 5104 admixture grades (e.g. "klei sterk zandig" ≈ Kz3).
          Plot.rect(bands, {
            x1: "x1",
            x2: "x2",
            y1: "y1",
            y2: "y2",
            fill: "color",
            stroke: "white",
            strokeWidth: 0.5,
          }),
          // Hatch overlay per band (second visual channel beyond colour)
          Plot.rect(hatchedBands, {
            x1: "x1",
            x2: "x2",
            y1: "y1",
            y2: "y2",
            fill: (d: Band) => `url(#${d.hatch})`,
            stroke: null,
          }),
          // Transparent full-width overlay carrying the per-layer tooltip
          Plot.rect(layers, {
            x1: 0,
            x2: 1,
            y1: "depthTop",
            y2: "depthBottom",
            fill: "transparent",
            title: formatPreExcavationTitle,
            tip: true,
          }),
          // Description labels for layers tall enough in pixels, wrapped to the
          // band column with a white halo so they stay legible over the colours.
          Plot.text(layersWithLabels, {
            x: 0.5,
            y: (d: PreExcavationLayer) =>
              d.depthTop + (d.depthBottom - d.depthTop) / 2,
            text: ({ description }: PreExcavationLayer) => description,
            fill: "black",
            stroke: "white",
            strokeWidth: 1.5,
            paintOrder: "stroke",
            fontSize: 9,
            textAnchor: "middle",
            lineWidth: 8,
            lineHeight: 1,
          }),
          Plot.frame(),
          // Watermark
          Plot.text([t("madeWithBedrockGefViewer")], {
            frameAnchor: "bottom",
            dx: -5,
            dy: 10,
            fill: "gray",
            fontSize: 8,
          }),
        ],
      });

      // Plot returns the <svg> directly (no Plot-generated legend with
      // identity color); the hatch patterns must be injected into its <defs>.
      const svg =
        plot.tagName.toLowerCase() === "svg" ? plot : plot.querySelector("svg");
      if (svg) {
        injectHatchPatterns(svg as SVGElement);
      }

      return plot;
    },
    [layers, width, height, t],
  );

  if (layers.length === 0) {
    return null;
  }

  // Legend entries reflect only the soils actually present in these layers.
  const legendSoils = collectLegendSoils(layers);

  const id = "pre-excavation-plot";
  return (
    <Card>
      <CardTitle>{t("preExcavation")}</CardTitle>

      <p className="text-sm text-gray-600 mb-4">
        {t("preExcavationDescription")}
      </p>

      <div className="flex justify-center">
        <div id={id} ref={containerRef}></div>
      </div>

      <SoilLegend soils={legendSoils} idPrefix="pre-excavation-legend" />

      <PlotDownloadButtons
        plotId={id}
        filename={`${baseFilename}-pre-excavation`}
      />
    </Card>
  );
}

// Case- and punctuation-insensitive comparison ("leem zwak zandig" matches
// "Leem, zwak zandig") to decide whether the NEN reading adds information.
function normalizeSoilWords(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zà-ÿ]+/g, " ")
    .trim();
}

function formatPreExcavationTitle({
  depthTop,
  depthBottom,
  description,
  soilCode,
  soilText,
}: PreExcavationLayer) {
  let tooltip = `${depthTop.toFixed(2)} – ${depthBottom.toFixed(2)} m\n${description}`;

  if (soilCode !== "NBE" && soilText !== soilCode) {
    if (normalizeSoilWords(soilText) === normalizeSoilWords(description)) {
      // Description already is the NEN phrasing — just tag on the code.
      tooltip += ` (${soilCode})`;
    } else {
      tooltip += `\n${soilText} (${soilCode})`;
    }
  }

  return tooltip;
}
