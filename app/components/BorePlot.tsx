import * as Plot from "@observablehq/plot";
import { useEffect, useRef } from "react";
import type { BoreLayer } from "~/util/gef-bore-schemas";
import { getSoilColor } from "~/util/gef-bore-schemas";

interface BorePlotProps {
  layers: Array<BoreLayer>;
  width?: number;
  height?: number;
}

const MIN_LAYER_HEIGHT_PX = 15; // minimum pixel height to show label

export function BorePlot({ layers, width = 150, height = 800 }: BorePlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current === null || layers.length === 0) {
      return;
    }

    // Calculate the depth range and pixels per meter
    const minDepth = Math.min(...layers.map(l => l.depthTop));
    const maxDepth = Math.max(...layers.map(l => l.depthBottom));
    const depthRange = maxDepth - minDepth;
    const plotHeight = height - 30 - 40; // subtract margins
    const pixelsPerMeter = plotHeight / depthRange;

    // Filter layers that are tall enough in pixels to show labels
    const layersWithLabels = layers.filter((d) => {
      const layerThickness = d.depthBottom - d.depthTop;
      const layerHeightPx = layerThickness * pixelsPerMeter;
      return layerHeightPx >= MIN_LAYER_HEIGHT_PX;
    });

    const plot = Plot.plot({
      style: {
        overflow: "visible"
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
      },
      marks: [
        // Soil layer rectangles
        Plot.rect(layers, {
          x1: 0,
          x2: 1,
          y1: "depthTop",
          y2: "depthBottom",
          fill: (d: BoreLayer) => getSoilColor(d.soilCode),
          stroke: "white",
          strokeWidth: 0.5,
          title: (d: BoreLayer) => {
            const codes = [d.soilCode, ...d.additionalCodes].join(" ");
            let tooltip = `${d.depthTop.toFixed(2)} – ${d.depthBottom.toFixed(2)} m\n${codes}`;
            if (d.description) {
              tooltip += `\n${d.description}`;
            }
            return tooltip;
          },
          tip: true,
        }),
        // Soil code labels for layers tall enough in pixels
        Plot.text(
          layersWithLabels,
          {
            x: 0.5,
            y: (d: BoreLayer) => d.depthTop + (d.depthBottom - d.depthTop) / 2,
            text: (d: BoreLayer) => d.soilCode,
            fill: "black",
            fontSize: 10,
            textAnchor: "middle",
          }
        ),
        Plot.frame(),
      ],
    });

    containerRef.current.innerHTML = "";
    containerRef.current.append(plot);

    return () => {
      plot.remove();
    };
  }, [layers, width, height]);

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Boorstaat</h3>
      <div className="flex justify-center">
        <div ref={containerRef}></div>
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Legend</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <LegendItem color={getSoilColor("Z")} label="Zand (Sand)" />
          <LegendItem color={getSoilColor("K")} label="Klei (Clay)" />
          <LegendItem color={getSoilColor("V")} label="Veen (Peat)" />
          <LegendItem color={getSoilColor("L")} label="Leem (Silt)" />
          <LegendItem color={getSoilColor("G")} label="Grind (Gravel)" />
          <LegendItem color={getSoilColor("NBE")} label="Niet beschreven" />
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div
        className="w-4 h-4 border border-gray-300"
        style={{ backgroundColor: color }}
      />
      <span className="text-gray-600">{label}</span>
    </div>
  );
}
