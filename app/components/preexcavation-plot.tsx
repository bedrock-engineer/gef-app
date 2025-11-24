import * as Plot from "@observablehq/plot";
import { max } from "d3-array";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { PreExcavationLayer } from "~/util/gef-cpt";
import { getSoilColor } from "~/util/gef-bore";
import { getSoilCodeFromDescription } from "~/util/gef-bore-codes";
import { PlotDownloadButtons } from "./plot-download-buttons";
import { Card, CardTitle } from "./card";

interface PreExcavationPlotProps {
  layers: Array<PreExcavationLayer>;
  width?: number;
  height?: number;
  baseFilename: string;
}

const MIN_LAYER_HEIGHT_PX = 15; // minimum pixel height to show label

export function PreExcavationPlot({
  layers,
  width = 150,
  height = 300,
  baseFilename,
}: PreExcavationPlotProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(
    function initExcavationPlot() {
      if (containerRef.current === null || layers.length === 0) {
        return;
      }

      // Calculate the depth range and pixels per meter
      const maxDepth = max(layers.map((l) => l.depthBottom)) ?? 1;
      const plotHeight = height - 30 - 40; // subtract margins
      const pixelsPerMeter = plotHeight / maxDepth;

      // Filter layers that are tall enough in pixels to show labels
      const layersWithLabels = layers.filter((d) => {
        const layerThickness = d.depthBottom - d.depthTop;
        const layerHeightPx = layerThickness * pixelsPerMeter;
        return layerHeightPx >= MIN_LAYER_HEIGHT_PX;
      });

      const plot = Plot.plot({
        style: {
          overflow: "visible",
          backgroundColor: "white",
        },
        width,
        height,
        marginLeft: 50,
        marginRight: 20,
        marginTop: 30,
        marginBottom: 50,
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
          // Layer rectangles with soil-type-specific colors
          Plot.rect(layers, {
            x1: 0,
            x2: 1,
            y1: "depthTop",
            y2: "depthBottom",
            fill: (d: PreExcavationLayer) => {
              const soilCode = getSoilCodeFromDescription(d.description);
              return getSoilColor(soilCode);
            },
            stroke: "white",
            strokeWidth: 0.5,
            title: (d: PreExcavationLayer) =>
              `${d.depthTop.toFixed(2)} – ${d.depthBottom.toFixed(2)} m\n${
                d.description
              }`,
            tip: true,
          }),
          // Description labels for layers tall enough in pixels
          Plot.text(layersWithLabels, {
            x: 0.5,
            y: (d: PreExcavationLayer) =>
              d.depthTop + (d.depthBottom - d.depthTop) / 2,
            text: ({ description }: PreExcavationLayer) => {
              return description.length > 20
                ? description.slice(0, 18) + "…"
                : description;
            },
            fill: "black",
            fontSize: 9,
            textAnchor: "middle",
          }),
          Plot.frame(),
          // Watermark
          Plot.text(["Made with Bedrock GEF Viewer"], {
            frameAnchor: "bottom",
            dx: -5,
            dy: 5,
            fill: "gray",
            fontSize: 8,
          }),
        ],
      });

      containerRef.current.innerHTML = "";
      containerRef.current.append(plot);

      return () => {
        plot.remove();
      };
    },
    [layers, width, height],
  );

  if (layers.length === 0) {
    return null;
  }

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

      <PlotDownloadButtons
        plotId={id}
        filename={`${baseFilename}-pre-excavation`}
      />
    </Card>
  );
}
