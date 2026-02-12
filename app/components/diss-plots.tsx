import {
  findColumnByQuantity,
  type ColumnInfo,
  type DissRow,
} from "@bedrock-engineer/gef-parser";
import * as Plot from "@observablehq/plot";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getColumnDisplayName, getUnitCode } from "~/util/chart-axes";
import { Card, CardTitle } from "./card";
import { PlotDownloadButtons } from "./plot-download-buttons";

// GEF quantity numbers for DISS columns
const QTY_TIME = 12;
const QTY_CONE_RESISTANCE = 2;
const QTY_PORE_PRESSURE_U1 = 5;
const QTY_PORE_PRESSURE_U2 = 6;
const QTY_PORE_PRESSURE_U3 = 7;

const PORE_PRESSURE_COLORS = ["steelblue", "orange", "#16a34a"];

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
      <div className="space-y-6">
        {porePressureCols.length > 0 && (
          <div>
            <DissPorePressurePlot
              plotId="diss-pore-pressure"
              data={data}
              height={height}
              width={width}
              timeCol={timeCol}
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
  porePressureCols: Array<ColumnInfo>;
}

function DissPorePressurePlot({
  height,
  width,
  data,
  plotId,
  timeCol,
  porePressureCols,
}: DissPorePressurePlotProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current === null || data.length === 0) {
      return;
    }

    const timeKey = timeCol.name;
    const timeUnit = getUnitCode(timeCol.unit);
    const ppUnit = getUnitCode(porePressureCols[0].unit);

    // Transform to long format for multi-series legend support
    const longData: Array<{
      time: number | string | null;
      value: number | string | null;
      series: string;
    }> = [];

    for (const row of data) {
      for (const col of porePressureCols) {
        const value = row[col.name];
        if (value != null) {
          longData.push({
            time: row[timeKey] ?? null,
            value,
            series: col.name,
          });
        }
      }
    }

    const plot = Plot.plot({
      height,
      width,
      marginRight: 40,
      style: {
        backgroundColor: "white",
        overflow: "visible",
      },
      x: {
        label: `${getColumnDisplayName(timeCol)} (${timeUnit})`,
        grid: true,
      },
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

    // @ts-expect-error TS2345: Argument of type 'SVGElement' is not assignable to parameter of type 'Node'.
    containerRef.current.append(plot);
    return () => {
      plot.remove();
    };
  }, [data, width, height, t, timeCol, porePressureCols]);

  return <div id={plotId} ref={containerRef}></div>;
}

interface DissConeResistancePlotProps {
  data: Array<DissRow>;
  width: number;
  height: number;
  plotId: string;
  timeCol: ColumnInfo;
  qcCol: ColumnInfo;
}

function DissConeResistancePlot({
  height,
  width,
  data,
  plotId,
  timeCol,
  qcCol,
}: DissConeResistancePlotProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current === null || data.length === 0) {
      return;
    }

    const timeKey = timeCol.name;
    const timeUnit = getUnitCode(timeCol.unit);
    const qcUnit = getUnitCode(qcCol.unit);

    const plot = Plot.plot({
      height,
      width,
      marginRight: 40,
      style: {
        backgroundColor: "white",
        overflow: "visible",
      },
      x: {
        label: `${getColumnDisplayName(timeCol)} (${timeUnit})`,
        grid: true,
      },
      y: {
        grid: true,
        label: `${getColumnDisplayName(qcCol)} (${qcUnit})`,
      },
      marks: [
        Plot.frame(),
        Plot.line(data, {
          x: timeKey,
          y: qcCol.name,
        }),
        Plot.crosshair(data, {
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

    // @ts-expect-error TS2345: Argument of type 'SVGElement' is not assignable to parameter of type 'Node'.
    containerRef.current.append(plot);
    return () => {
      plot.remove();
    };
  }, [data, width, height, t, timeCol, qcCol]);

  return <div id={plotId} ref={containerRef}></div>;
}
