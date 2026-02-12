import type { ColumnInfo, Row, ZID } from "@bedrock-engineer/gef-parser";
import * as Plot from "@observablehq/plot";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from "react-aria-components";
import { useTranslation } from "react-i18next";
import {
  DEPTH_KEYWORDS,
  detectCptChartAxes,
  type ChartColumn,
} from "~/util/chart-axes";
import { Card, CardTitle } from "./card";
import { PlotDownloadButtons } from "./plot-download-buttons";

function isDepthColumn(col: ChartColumn): boolean {
  const nameLower = col.name.toLowerCase();
  return (
    col.unit === "m" && DEPTH_KEYWORDS.some((kw) => nameLower.includes(kw))
  );
}

interface CptPlotProps {
  data: Array<Row>;
  columnInfo: Array<ColumnInfo>;
  zid: ZID | undefined;
  width?: number;
  height?: number;
  baseFilename: string;
}

export function CptPlots({
  data,
  columnInfo,
  zid,
  width = 300,
  height = 800,
  baseFilename,
}: CptPlotProps) {
  const { t } = useTranslation();
  const chartAxes = detectCptChartAxes(columnInfo, data, zid);

  const [selectedAxes, setSelectedAxes] = useState([chartAxes.xAxis?.key ?? ""]);
  const [selectedYAxis, setSelectedYAxis] = useState(chartAxes.yAxis?.key ?? "");
  const [showComments, setShowComments] = useState(true);

  if (!chartAxes.xAxis || !chartAxes.yAxis) {
    return null;
  }

  const xAxisOptions = chartAxes.availableColumns.filter(
    (col) => !isDepthColumn(col),
  );

  const currentYAxis =
    chartAxes.yAxisOptions.find((opt) => opt.key === selectedYAxis) ??
    chartAxes.yAxis;

  // Determine if we should reverse the y-axis
  // Elevation should NOT be reversed (positive up), depth should be reversed (positive down)
  const isElevation = selectedYAxis === "elevation";

  // Check if data contains any comments
  const hasComments = data.some((row) => row.comment);

  return (
    <Card>
      <CardTitle>{t("graphs")}</CardTitle>

      <div className="mb-4 flex flex-wrap gap-4 items-end">
        <CheckboxGroup
          value={selectedAxes}
          onChange={(v) => {
            setSelectedAxes(v);
          }}
        >
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            {t("columns")}
          </Label>
          <div className="flex flex-wrap gap-x-4 gapy-y-1">
            {xAxisOptions.map((x) => (
              <Checkbox
                key={x.key}
                value={x.key}
                className="flex items-center gap-2 group"
              >
                <div className="w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center group-data-selected:bg-blue-600 group-data-selected:border-blue-600 group-hover:border-gray-400 group-data-selected:group-hover:bg-blue-700 group-data-pressed:scale-95 transition-all">
                  <svg
                    viewBox="0 0 18 18"
                    className="w-3 h-3 fill-none stroke-white stroke-2 opacity-0 group-data-selected:opacity-100"
                  >
                    <polyline points="1 9 7 14 15 4" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">
                  {x.name} ({x.unit})
                </span>
              </Checkbox>
            ))}
          </div>
        </CheckboxGroup>

        <div className="flex-1">
          <span className="block text-sm font-medium text-gray-700 mb-1">
            {t("yAxisVertical")}
          </span>
          {chartAxes.yAxisOptions.length > 1 ? (
            <Select
              aria-label={t("yAxisVertical")}
              value={selectedYAxis}
              onChange={(key) => {
                setSelectedYAxis(key as string);
              }}
              className="w-full max-w-2xs"
            >
              <Button className="w-full px-3 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-700 text-left flex justify-between items-center hover:bg-gray-50">
                <SelectValue />
                <span aria-hidden="true">▼</span>
              </Button>

              <Popover className="w-[--trigger-width] bg-white border border-gray-300 rounded-sm shadow-lg">
                <ListBox className="max-h-60 overflow-auto p-1">
                  {chartAxes.yAxisOptions.map((opt) => (
                    <ListBoxItem
                      key={opt.key}
                      id={opt.key}
                      className="px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 rounded data-selected:bg-blue-100"
                    >
                      {opt.name} ({opt.unit})
                    </ListBoxItem>
                  ))}
                </ListBox>
              </Popover>
            </Select>
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-sm text-sm text-gray-700">
              {currentYAxis.name} ({currentYAxis.unit})
            </div>
          )}
        </div>

        {hasComments && (
          <div className="flex items-center gap-2">
            <Checkbox
              isSelected={showComments}
              onChange={setShowComments}
              className="flex items-center gap-2 group"
            >
              <div className="w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center group-data-selected:bg-blue-600 group-data-selected:border-blue-600 group-hover:border-gray-400 group-data-selected:group-hover:bg-blue-700 group-data-pressed:scale-95 transition-all">
                <svg
                  viewBox="0 0 18 18"
                  className="w-3 h-3 fill-none stroke-white stroke-2 opacity-0 group-data-selected:opacity-100"
                >
                  <polyline points="1 9 7 14 15 4" />
                </svg>
              </div>
              <span className="text-sm text-gray-700">Show comments</span>
            </Checkbox>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        {selectedAxes.map((k) => {
          const xAxis = xAxisOptions.find((c) => c.key === k);

          if (!xAxis) {
            return null;
          }

          const plotId = `cpt-plot-${k}`;
          return (
            <div
              key={`${k}-${selectedYAxis}`}
              className="flex flex-col flex-wrap items-center"
            >
              <CptPlot
                plotId={plotId}
                data={data}
                height={height}
                width={width}
                yAxis={currentYAxis}
                xAxis={xAxis}
                reverseY={!isElevation}
                showComments={showComments}
              />
              <PlotDownloadButtons
                plotId={plotId}
                filename={`${baseFilename}-${xAxis.name}`}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

interface CptPlotInternalProps {
  data: Array<Row>;
  xAxis: ChartColumn;
  yAxis: ChartColumn;
  width: number;
  height: number;
  reverseY?: boolean;
  showComments: boolean;
  plotId: string;
}

function CptPlot({
  height,
  width,
  xAxis,
  yAxis,
  data,
  reverseY = true,
  showComments,
  plotId,
}: CptPlotInternalProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current === null || data.length === 0) {
      return;
    }

    // Filter rows that have comments
    const dataWithComments = data.filter((row) => row.comment);
    const hasComments = dataWithComments.length > 0;

    // Find the max x value to position comments to the right of the plot area
    const maxX = Math.max(...data.map((d) => d[xAxis.key] as number));

    // Only adjust width/margin if we have comments AND want to show them
    const shouldShowComments = hasComments && showComments;

    const plot = Plot.plot({
      height,
      width: shouldShowComments ? width + 160 : width,
      marginRight: shouldShowComments ? 200 : 40,
      style: {
        backgroundColor: "white",
        overflow: "visible",
      },
      x: {
        label: `${xAxis.name} (${xAxis.unit})`,
        grid: true,
      },
      y: {
        grid: true,
        reverse: reverseY,
        label: `${yAxis.name} (${yAxis.unit})`,
      },
      marks: [
        Plot.frame(),
        Plot.lineX(data, {
          x: xAxis.key,
          y: yAxis.key,
        }),
        Plot.crosshair(data, {
          x: xAxis.key,
          y: yAxis.key,
        }),
        // Text comments from data block, positioned to the right of the frame
        ...(shouldShowComments
          ? [
              Plot.text(dataWithComments, {
                x: maxX,
                y: yAxis.key,
                text: (d: Row) => String(d.comment),
                dx: 5,
                textAnchor: "start",
                fill: "black",
                fontSize: 9,
              }),
            ]
          : []),
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
  }, [data, xAxis, yAxis, width, height, reverseY, showComments, t]);

  return <div id={plotId} ref={containerRef}></div>;
}
