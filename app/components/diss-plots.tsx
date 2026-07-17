import type { ColumnInfo, DissRow } from "@bedrock-engineer/gef-parser";
import { findColumnByQuantity } from "@bedrock-engineer/gef-parser/cpt";
import * as Plot from "@observablehq/plot";
import { useState } from "react";
import { Label, Radio, RadioGroup } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { getColumnDisplayName, getUnitCode } from "~/util/chart-axes";
import { usePlot } from "../util/use-plot";
import { Card, CardTitle } from "./card";
import { PlotDownloadButtons } from "./plot-download-buttons";

type TimeScale = "log" | "sqrt" | "linear";

// GEF quantity numbers for DISS columns
const QTY_TIME = 12;
const QTY_CONE_RESISTANCE = 2;
const QTY_PORE_PRESSURE_U1 = 5;
const QTY_PORE_PRESSURE_U2 = 6;
const QTY_PORE_PRESSURE_U3 = 7;

const PORE_PRESSURE_COLORS = ["steelblue", "orange", "#16a34a"];

function getXScaleConfig(scale: TimeScale, label: string): Plot.ScaleOptions {
  switch (scale) {
    case "log": {
      return { type: "log", label, grid: true };
    }
    case "sqrt": {
      return { type: "pow", exponent: 0.5, label: `√ ${label}`, grid: true };
    }
    case "linear": {
      return { label, grid: true };
    }
  }
}

interface DissPlotProps {
  data: Array<DissRow>;
  columnInfo: Array<ColumnInfo>;
  width?: number;
  height?: number;
  baseFilename: string;
}

export function DissPlots({
  data,
  columnInfo,
  width = 600,
  height = 300,
  baseFilename,
}: DissPlotProps) {
  const { t } = useTranslation();
  const [timeScale, setTimeScale] = useState<TimeScale>("log");

  const timeCol = findColumnByQuantity(columnInfo, QTY_TIME);
  const qcCol = findColumnByQuantity(columnInfo, QTY_CONE_RESISTANCE);
  const porePressureCols = [
    findColumnByQuantity(columnInfo, QTY_PORE_PRESSURE_U1),
    findColumnByQuantity(columnInfo, QTY_PORE_PRESSURE_U2),
    findColumnByQuantity(columnInfo, QTY_PORE_PRESSURE_U3),
  ].filter((column): column is ColumnInfo => column !== undefined);

  if (!timeCol) {
    return null;
  }

  return (
    <Card>
      <CardTitle>{t("graphs")}</CardTitle>
      <RadioGroup
        value={timeScale}
        onChange={(v) => {
          setTimeScale(v as TimeScale);
        }}
        orientation="horizontal"
        className="flex items-center gap-3 mb-3"
      >
        <Label className="text-sm font-medium text-gray-700">
          {t("timeScale")}
        </Label>
        <div className="flex gap-1">
          {(
            [
              { value: "log", label: t("scaleLog") },
              { value: "sqrt", label: t("scaleSqrt") },
              { value: "linear", label: t("scaleLinear") },
            ] as const
          ).map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              className="cursor-pointer rounded-sm border border-gray-300 px-2.5 py-1 text-sm text-gray-700 transition-colors data-selected:border-blue-600 data-selected:bg-blue-600 data-selected:text-white hover:bg-gray-50 data-selected:hover:bg-blue-700"
            >
              {option.label}
            </Radio>
          ))}
        </div>
      </RadioGroup>
      <div className="space-y-6">
        {porePressureCols.length > 0 && (
          <div>
            <DissPorePressurePlot
              plotId="diss-pore-pressure"
              data={data}
              height={height}
              width={width}
              timeCol={timeCol}
              timeScale={timeScale}
              porePressureCols={porePressureCols}
            />
            <PlotDownloadButtons
              plotId="diss-pore-pressure"
              filename={`${baseFilename}_pore-pressure`}
            />
          </div>
        )}

        {qcCol && (
          <div>
            <DissConeResistancePlot
              plotId="diss-cone-resistance"
              data={data}
              height={height}
              width={width}
              timeCol={timeCol}
              timeScale={timeScale}
              qcCol={qcCol}
            />
            <PlotDownloadButtons
              plotId="diss-cone-resistance"
              filename={`${baseFilename}_cone-resistance`}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

interface DissPorePressurePlotProps {
  data: Array<DissRow>;
  width: number;
  height: number;
  plotId: string;
  timeCol: ColumnInfo;
  timeScale: TimeScale;
  porePressureCols: Array<ColumnInfo>;
}

function DissPorePressurePlot({
  height,
  width,
  data,
  plotId,
  timeCol,
  timeScale,
  porePressureCols,
}: DissPorePressurePlotProps) {
  const { t, i18n } = useTranslation();

  const containerRef = usePlot(() => {
    const firstPpCol = porePressureCols[0];
    if (data.length === 0 || !firstPpCol) {
      return null;
    }

    const timeKey = timeCol.name;
    const timeUnit = getUnitCode(timeCol.unit);
    const ppUnit = getUnitCode(firstPpCol.unit);

    // Transform to long format for multi-series legend support
    const longData: Array<{
      time: number | string | null;
      value: number | string | null;
      series: string;
    }> = [];

    for (const row of data) {
      const time = row[timeKey];
      // Filter out t<=0 for non-linear scales (log/sqrt can't represent 0)
      if (time == null || (typeof time === "number" && timeScale !== "linear" && time <= 0)) {
        continue;
      }
      for (const col of porePressureCols) {
        const value = row[col.name];
        if (value != null) {
          longData.push({
            time,
            value,
            series: col.name,
          });
        }
      }
    }

    const xLabel = `${getColumnDisplayName(timeCol, i18n.language)} (${timeUnit})`;
    const plot = Plot.plot({
      height,
      width,
      marginRight: 40,
      style: {
        backgroundColor: "white",
        overflow: "visible",
      },
      x: getXScaleConfig(timeScale, xLabel),
      y: {
        grid: true,
        label: `${t("porePressure")} (${ppUnit})`,
      },
      color: {
        domain: porePressureCols.map((col) => col.name),
        range: PORE_PRESSURE_COLORS.slice(0, porePressureCols.length),
        legend: porePressureCols.length > 1,
      },
      marks: [
        Plot.frame(),
        Plot.line(longData, {
          x: "time",
          y: "value",
          stroke: "series",
        }),
        Plot.crosshair(longData, {
          x: "time",
          y: "value",
        }),
        // Watermark
        Plot.text([t("madeWithBedrockGefViewer")], {
          frameAnchor: "top-right",
          dx: -5,
          dy: 5,
          fill: "gray",
          fontSize: 8,
        }),
      ],
    });

    return plot;
  }, [data, width, height, t, timeCol, timeScale, porePressureCols]);

  return <div id={plotId} ref={containerRef}></div>;
}

interface DissConeResistancePlotProps {
  data: Array<DissRow>;
  width: number;
  height: number;
  plotId: string;
  timeCol: ColumnInfo;
  timeScale: TimeScale;
  qcCol: ColumnInfo;
}

function DissConeResistancePlot({
  height,
  width,
  data,
  plotId,
  timeCol,
  timeScale,
  qcCol,
}: DissConeResistancePlotProps) {
  const { t, i18n } = useTranslation();

  const containerRef = usePlot(() => {
    if (data.length === 0) {
      return null;
    }

    const timeKey = timeCol.name;
    const timeUnit = getUnitCode(timeCol.unit);
    const qcUnit = getUnitCode(qcCol.unit);

    // Filter out t<=0 for non-linear scales (log/sqrt can't represent 0)
    const filteredData = timeScale !== "linear"
      ? data.filter((row) => {
          const time = row[timeKey];
          return time != null && typeof time === "number" && time > 0;
        })
      : data;

    const xLabel = `${getColumnDisplayName(timeCol, i18n.language)} (${timeUnit})`;
    const plot = Plot.plot({
      height,
      width,
      marginRight: 40,
      style: {
        backgroundColor: "white",
        overflow: "visible",
      },
      x: getXScaleConfig(timeScale, xLabel),
      y: {
        grid: true,
        label: `${getColumnDisplayName(qcCol, i18n.language)} (${qcUnit})`,
      },
      marks: [
        Plot.frame(),
        Plot.line(filteredData, {
          x: timeKey,
          y: qcCol.name,
        }),
        Plot.crosshair(filteredData, {
          x: timeKey,
          y: qcCol.name,
        }),
        // Watermark
        Plot.text([t("madeWithBedrockGefViewer")], {
          frameAnchor: "top-right",
          dx: -5,
          dy: 5,
          fill: "gray",
          fontSize: 8,
        }),
      ],
    });

    return plot;
  }, [data, width, height, t, timeCol, timeScale, qcCol]);

  return <div id={plotId} ref={containerRef}></div>;
}
