import * as Plot from "@observablehq/plot";
import { max } from "d3-array";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { PreExcavationLayer } from "~/util/gef";
import { PlotDownloadButtons } from "./PlotDownload";

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
      const maxDepth = max(layers.map((l) => l.depthBottom));
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
        },
        width,
        height,
        marginLeft: 50,
        marginRight: 20,
        marginTop: 30,
        marginBottom: 40,
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
          // Layer rectangles - use a neutral color since we don't have soil codes
          Plot.rect(layers, {
            x1: 0,
            x2: 1,
            y1: "depthTop",
            y2: "depthBottom",
            fill: "#d4a574", // tan/brown for excavated soil
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
        ],
      });

      containerRef.current.innerHTML = "";
      containerRef.current.append(plot);

      return () => {
        plot.remove();
      };
    },
    [layers, width, height]
  );

  if (layers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-2">{t("preExcavation")}</h3>
      <p className="text-sm text-gray-600 mb-4">
        {t("preExcavationDescription")}
      </p>
      <div className="flex justify-center">
        <div id="pre-excavation-plot" ref={containerRef}></div>
      </div>
      <PlotDownloadButtons plotId="pre-excavation-plot" filename={`${baseFilename}-pre-excavation`} />
    </div>
  );
}
