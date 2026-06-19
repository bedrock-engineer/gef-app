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
import { decodeNenCode, parseNenCode } from "~/util/nen-code";
import { Card, CardTitle } from "./card";
import { PlotDownloadButtons } from "./plot-download-buttons";

const MIN_LAYER_HEIGHT_PX = 15; // minimum pixel height to show label
const id = "boreplot";

const SVG_NS = "http://www.w3.org/2000/svg";

// Plot layout (px). The wide right margin holds layer descriptions; labels
// placed in that margin are shifted by RIGHT_MARGIN_DX to sit just inside the
// figure's right edge.
const PLOT_MARGIN = { left: 50, right: 220, bottom: 44 };
const RIGHT_MARGIN_DX = PLOT_MARGIN.right - 10;

// Legend display order for the main soils (lithology, light→organic, matching
// brodata). Soils not listed here are appended after these.
const SOIL_ORDER = ["V", "K", "L", "Z", "G"];

// Hatch pattern shape per soil type (mirrors brodata's conventions:
// peat "-", clay "/", silt "\", sand ".", gravel "o"). Shared between the
// plot's <defs> and the legend swatches so both stay in sync.
const HATCH_SHAPE: Record<string, string> = {
  Z: `<circle cx="3" cy="3" r="0.9" fill="rgba(0,0,0,0.30)"/>`,
  K: `<path d="M0,6 L6,0" stroke="rgba(0,0,0,0.30)" stroke-width="0.8"/>`,
  V: `<path d="M0,3 L6,3" stroke="rgba(0,0,0,0.30)" stroke-width="0.8"/>`,
  L: `<path d="M0,0 L6,6" stroke="rgba(0,0,0,0.30)" stroke-width="0.8"/>`,
  G: `<circle cx="3" cy="3" r="1.4" fill="none" stroke="rgba(0,0,0,0.30)" stroke-width="0.7"/>`,
};

// Build a <pattern> element for a soil type under the given id ("" if no hatch).
function patternMarkup(soil: string, patternId: string): string {
  const shape = HATCH_SHAPE[soil];
  if (!shape) {
    return "";
  }
  return `<pattern id="${patternId}" width="6" height="6" patternUnits="userSpaceOnUse">${shape}</pattern>`;
}

// Pattern id used inside the plot SVG for a soil type (undefined if no hatch).
function plotHatchId(soil: string): string | undefined {
  return HATCH_SHAPE[soil] ? `bore-hatch-${soil}` : undefined;
}

// Lowercase admixture letter (toevoeging) -> representative main soil, used
// for the sub-band colour and hatch. s (siltig) maps to leem/silt, h (humeus)
// to the organic/peat colour.
const ADMIX_SOIL: Record<string, string> = {
  z: "Z",
  s: "L",
  g: "G",
  k: "K",
  h: "V",
};

// Fraction of the layer taken by an admixture, per NEN 5104 grade
// (1 zwak … 4 uiterst). Values follow pygef's curated GEF→fraction table
// (zwak 0.2, matig 0.3, sterk 0.4, uiterst 0.5); the main soil takes the
// remainder. See pygef broxml/mapping.py BRO_TO_DIST.
const ADMIX_FRACTION: Record<number, number> = {
  1: 0.2,
  2: 0.3,
  3: 0.4,
  4: 0.5,
};
// Cap the combined admixture fraction so the main soil keeps a visible band.
const MAX_ADMIX_TOTAL = 0.8;

interface SoilComponent {
  /** Canonical soil key (main letter Z/K/L/V/G, or a special code like NBE) */
  soil: string;
  color: string;
  fraction: number;
  hatch?: string;
}

// Turn a NEN 5104 soil code into coloured composition bands: the main soil plus
// admixtures, each with a colour, hatch and width fraction. Special codes (NBE,
// GM, anything not starting with a main soil) become a single plain band.
function parseSoilComposition(
  soilCode: string | undefined,
): Array<SoilComponent> {
  const { raw, main, isComposite, admixtures } = parseNenCode(soilCode ?? "");

  if (!isComposite) {
    return [{ soil: raw, color: getSoilColor(raw), fraction: 1 }];
  }

  // Collect admixtures first so the main soil can take the remaining fraction.
  const admix: Array<SoilComponent> = [];
  for (const a of admixtures) {
    const soil = ADMIX_SOIL[a.letter];
    if (!soil) {
      continue; // qualifier like 'm' (mineraalarm) — no extra band
    }
    admix.push({
      soil,
      color: getSoilColor(soil),
      fraction: ADMIX_FRACTION[a.grade] ?? 0.2,
      hatch: plotHatchId(soil),
    });
  }

  // Scale admixtures down if together they'd leave the main soil too thin.
  const admixTotal = admix.reduce((sum, a) => sum + a.fraction, 0);
  if (admixTotal > MAX_ADMIX_TOTAL) {
    const scale = MAX_ADMIX_TOTAL / admixTotal;
    for (const a of admix) {
      a.fraction *= scale;
    }
  }

  const mainFraction = 1 - Math.min(admixTotal, MAX_ADMIX_TOTAL);
  return [
    {
      soil: main,
      color: getSoilColor(main),
      fraction: mainFraction,
      hatch: plotHatchId(main),
    },
    ...admix,
  ];
}

// Distinct soils actually present across the layers, in a stable display order.
// Used to build a legend tied to the chart's data instead of a fixed list.
function collectLegendSoils(layers: Array<BoreLayer>): Array<string> {
  const seen = new Set<string>();
  for (const layer of layers) {
    for (const c of parseSoilComposition(layer.soilCode)) {
      if (c.soil) {
        seen.add(c.soil);
      }
    }
  }
  const ordered = SOIL_ORDER.filter((s) => seen.has(s));
  const extras = [...seen].filter((s) => !SOIL_ORDER.includes(s)).sort();
  return [...ordered, ...extras];
}

interface Band {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  color: string;
  hatch?: string;
}

// Flatten layers into horizontally-stacked composition bands spanning x ∈ [0, 1].
function buildBands(layers: Array<BoreLayer>): Array<Band> {
  return layers.flatMap((layer) => {
    const comps = parseSoilComposition(layer.soilCode);
    let x = 0;
    return comps.map((c) => {
      const x1 = x;
      x += c.fraction;
      return {
        x1,
        x2: x,
        y1: layer.depthTop,
        y2: layer.depthBottom,
        color: c.color,
        hatch: c.hatch,
      };
    });
  });
}

// Inject hatch <pattern> defs into the plot's SVG (idempotent). Strokes are
// semi-transparent so the underlying soil colour shows through.
function injectHatchPatterns(svg: SVGElement) {
  if (svg.querySelector("#bore-hatch-Z")) {
    return;
  }
  const defs = document.createElementNS(SVG_NS, "defs");
  defs.innerHTML = Object.keys(HATCH_SHAPE)
    .map((soil) => patternMarkup(soil, `bore-hatch-${soil}`))
    .join("");
  svg.insertBefore(defs, svg.firstChild);
}

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

    // Split each layer into proportional composition bands (main soil + admixtures)
    const bands = buildBands(layers);
    const hatchedBands = bands.filter((b) => b.hatch);

    const plot = Plot.plot({
      style: {
        overflow: "visible",
        backgroundColor: "white",
      },
      width,
      height,
      marginLeft: PLOT_MARGIN.left,
      marginRight: PLOT_MARGIN.right,
      marginBottom: PLOT_MARGIN.bottom,
      // Use fill values verbatim (hex colours and url(#pattern) refs)
      color: { type: "identity" },
      x: {
        label: t("soilComposition"),
        labelAnchor: "center",
        domain: [0, 1],
        ticks: [0, 0.5, 1],
        tickFormat: (d: number) => `${d}`,
      },
      y: {
        reverse: true,
        label: "Depth (m)",
        grid: true,
      },
      marks: [
        // Soil composition bands: main soil + admixtures, widths proportional
        // to the NEN 5104 admixture grades (e.g. Kz3 ≈ half sand).
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
        // Groundwater level during drilling (dashed line + ▽ marker)
        ...(groundwaterLevel != null
          ? [
              Plot.ruleY([groundwaterLevel], {
                stroke: "#2563eb",
                strokeWidth: 1.2,
                strokeDasharray: "4 3",
              }),
              // Label in the right margin (right-aligned to the figure edge so
              // it clears the left-aligned layer descriptions)
              Plot.text([groundwaterLevel], {
                x: 1,
                y: (d: number) => d,
                text: (d: number) => `▽ ${t("groundwater")} ${d.toFixed(2)} m`,
                textAnchor: "end",
                dx: RIGHT_MARGIN_DX,
                dy: -3,
                fill: "#2563eb",
                fontSize: 9,
                fontWeight: "bold",
              }),
            ]
          : []),
        Plot.frame(),
        // Attribution in the empty bottom-right margin, clear of the centred
        // x-axis label (which sits under the narrow band column on the left).
        Plot.text([t("madeWithBedrockGefViewer")], {
          frameAnchor: "bottom-right",
          dx: RIGHT_MARGIN_DX,
          dy: 18,
          fill: "gray",
          fontSize: 8,
        }),
      ],
    });

    // Plot returns the <svg> directly (no Plot-generated legend with identity color)
    const svg = (
      plot.tagName.toLowerCase() === "svg" ? plot : plot.querySelector("svg")
    ) as SVGElement | null;
    if (svg) {
      injectHatchPatterns(svg);
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

function formatBoreLayerTitle({
  soilCode,
  depthBottom,
  depthTop,
  additionalCodes,
  description,
}: BoreLayer) {
  const codes = [soilCode, ...additionalCodes].join(" ");
  const decodedSoil = decodeNenCode(soilCode);
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
