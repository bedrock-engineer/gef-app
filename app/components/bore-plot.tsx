import * as Plot from "@observablehq/plot";
import { max, min } from "d3-array";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { BoreLayer, BoreSpecimen } from "@bedrock-engineer/gef-parser";
import {
  getSoilColor,
  SPECIMEN_CODES,
  formatSpecimenCode,
} from "@bedrock-engineer/gef-parser";
import { decodeBoreCode } from "@bedrock-engineer/gef-parser";
import { Card, CardTitle } from "./card";
import { PlotDownloadButtons } from "./plot-download-buttons";

const MIN_LAYER_HEIGHT_PX = 15; // minimum pixel height to show label
const id = "boreplot";

interface BorePlotProps {
  layers: Array<BoreLayer>;
  specimens?: Array<BoreSpecimen>;
  baseFilename: string;
  width?: number;
  height?: number;
}

export function BorePlot({
  layers,
  specimens = [],
  width = 350,
  height = 800,
  baseFilename,
}: BorePlotProps) {
  const { t, i18n } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current === null || layers.length === 0) {
      return;
    }

    // Get current language for specimen code formatting
    const lang: "nl" | "en" = i18n.language === "en" ? "en" : "nl";

    // Calculate the depth range and pixels per meter
    const minDepth = min(layers.map((l) => l.depthTop)) ?? 0;
    const maxDepth = max(layers.map((l) => l.depthBottom)) ?? 0;
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
        overflow: "visible",
        backgroundColor: "white",
      },
      width,
      height,
      marginLeft: 50,
      marginRight: 220,
      marginBottom: 20,
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
          fill: (d: BoreLayer) => {
            return getSoilColor(d.soilCode);
          },
          stroke: "white",
          strokeWidth: 0.5,
          title: formatBoreLayerTitle,
          tip: true,
        }),
        // Soil code labels for layers tall enough in pixels
        Plot.text(layersWithLabels, {
          x: 0.5,
          y: (d: BoreLayer) => d.depthTop + (d.depthBottom - d.depthTop) / 2,
          text: (d: BoreLayer) => d.soilCode,
          fill: "black",
          fontSize: 10,
          textAnchor: "middle",
        }),
        // Opmerkingen (descriptions) displayed to the right of rectangles
        Plot.text(layers, {
          x: 1,
          y: (d: BoreLayer) => d.depthTop + (d.depthBottom - d.depthTop) / 2,
          text: (d: BoreLayer) => d.description ?? "",
          fill: "black",
          fontSize: 9,
          textAnchor: "start",
          dx: 5,
        }),
        // Specimen markers (triangles on the right edge)
        ...(specimens.length > 0
          ? [
              Plot.dot(specimens, {
                x: 1.1,
                y: (d: BoreSpecimen) =>
                  d.depthTop + (d.depthBottom - d.depthTop) / 2,
                fill: "#e11d48",
                r: 4,
                symbol: "triangle",
                title: (d: BoreSpecimen) => formatSpecimentTitle(d, lang),
                tip: true,
              }),
            ]
          : []),
        Plot.frame(),
        // Watermark
        Plot.text(["Made with Bedrock GEF Viewer"], {
          frameAnchor: "bottom-right",
          dx: 0,
          dy: 15,
          fill: "gray",
          fontSize: 8,
        }),
      ],
    });

    // @ts-expect-error TS2345: Argument of type 'SVGElement' is not assignable to parameter of type 'Node'.
    containerRef.current.append(plot);

    return () => {
      plot.remove();
    };
  }, [layers, specimens, width, height, i18n.language]);

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
          <LegendItem color={getSoilColor("Z")} label={`Z - ${t("sand")}`} />

          <LegendItem color={getSoilColor("K")} label={`K - ${t("clay")}`} />

          <LegendItem color={getSoilColor("V")} label={`V - ${t("peat")}`} />

          <LegendItem color={getSoilColor("L")} label={`L - ${t("silt")}`} />

          <LegendItem color={getSoilColor("G")} label={`G - ${t("gravel")}`} />

          <LegendItem
            color={getSoilColor("NBE")}
            label={`NBE - ${t("notDescribed")}`}
          />
        </div>
      </div>

      <PlotDownloadButtons plotId={id} filename={`${baseFilename}-boorstaat`} />
    </Card>
  );
}

function formatBoreLayerTitle({
  soilCode,
  depthBottom,
  depthTop,
  additionalCodes,
  description,
}: BoreLayer) {
  const codes = [soilCode, ...additionalCodes].join(" ");
  const decodedSoil = decodeBoreCode(soilCode);
  let tooltip = `${depthTop} – ${depthBottom} m\n${codes}`;

  if (decodedSoil !== soilCode) {
    tooltip += `\n${decodedSoil}`;
  }
  // Decode additional codes
  const decodedExtras = additionalCodes
    .map((c) => {
      const decoded = decodeBoreCode(c);
      return decoded !== c ? decoded : null;
    })
    .filter(Boolean);
  if (decodedExtras.length > 0) {
    tooltip += `\n${decodedExtras.join(", ")}`;
  }

  if (description) {
    tooltip += `\n${description}`;
  }

  return tooltip;
}

function formatSpecimentTitle(
  {
    monstercode,
    depthBottom,
    depthTop,
    specimenNumber,
    geroerdOngeroerd,
    monstermethode,
    monstersteekapparaat,
  }: BoreSpecimen,
  lang: "nl" | "en",
) {
  const parts = [
    `Monster ${specimenNumber}${monstercode ? ` (${monstercode})` : ""}`,
    `${depthTop} – ${depthBottom} m`,
  ];

  const decodedParts = [
    formatSpecimenCode(geroerdOngeroerd, SPECIMEN_CODES.geroerd, lang),
    formatSpecimenCode(
      monstersteekapparaat,
      SPECIMEN_CODES.monstersteekapparaat,
      lang,
    ),
    formatSpecimenCode(monstermethode, SPECIMEN_CODES.monstermethode, lang),
  ].filter(Boolean);

  if (decodedParts.length > 0) {
    parts.push(decodedParts.join(", "));
  }

  return parts.join("\n");
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
