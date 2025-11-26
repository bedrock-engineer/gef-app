import * as Plot from "@observablehq/plot";
import { useEffect, useRef, useState } from "react";
import {
  Checkbox,
  CheckboxGroup,
  Label,
  Select,
  SelectValue,
  Button,
  Popover,
  ListBox,
  ListBoxItem,
} from "react-aria-components";
import { useTranslation } from "react-i18next";
import { PlotDownloadButtons } from "./plot-download-buttons";
import { DEPTH_KEYWORDS } from "~/gef/gef-cpt";
import { Card, CardTitle } from "./card";

interface Column {
  key: string;
  unit: string;
  name: string;
}

function isDepthColumn(col: Column): boolean {
  const nameLower = col.name.toLowerCase();
  return (
    col.unit === "m" && DEPTH_KEYWORDS.some((kw) => nameLower.includes(kw))
  );
}

interface CptPlotProps {
  data: Array<Record<string, number>>;
  xAxis: Column;
  yAxis: Column;
  availableColumns: Array<Column>;
  yAxisOptions?: Array<Column>;
  width?: number;
  height?: number;
  baseFilename: string;
}

export function CptPlots({
  data,
  xAxis: initialXAxis,
  yAxis: initialYAxis,
  availableColumns,
  yAxisOptions = [],
  width = 300,
  height = 800,
  baseFilename,
}: CptPlotProps) {
  const { t } = useTranslation();
  const [selectedAxes, setSelectedAxes] = useState([initialXAxis.key]);
  const [selectedYAxis, setSelectedYAxis] = useState(initialYAxis.key);

  const xAxisOptions = availableColumns.filter((col) => !isDepthColumn(col));

  // Get the current y-axis column
  const currentYAxis =
    yAxisOptions.find((opt) => opt.key === selectedYAxis) ?? initialYAxis;

  // Determine if we should reverse the y-axis
  // Elevation should NOT be reversed (positive up), depth should be reversed (positive down)
  const isElevation = selectedYAxis === "elevation";

  return (
    <Card>
      <CardTitle>{t("boreLog")}</CardTitle>

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
                <div className="w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center group-data-[selected]:bg-blue-600 group-data-[selected]:border-blue-600 group-hover:border-gray-400 group-data-[selected]:group-hover:bg-blue-700 group-data-[pressed]:scale-95 transition-all">
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
          {yAxisOptions.length > 1 ? (
            <Select
              value={selectedYAxis}
              onChange={(key) => {
                setSelectedYAxis(key as string);
              }}
              className="w-full max-w-2xs"
            >
              <Button className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 text-left flex justify-between items-center hover:bg-gray-50">
                <SelectValue />
                <span aria-hidden="true">▼</span>
              </Button>

              <Popover className="w-[--trigger-width] bg-white border border-gray-300 rounded-md shadow-lg">
                <ListBox className="max-h-60 overflow-auto p-1">
                  {yAxisOptions.map((opt) => (
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
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700">
              {currentYAxis.name} ({currentYAxis.unit})
            </div>
          )}
        </div>
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
  data: Array<Record<string, number>>;
  xAxis: Column;
  yAxis: Column;
  width: number;
  height: number;
  reverseY?: boolean;
  plotId: string;
}

function CptPlot({
  height,
  width,
  xAxis,
  yAxis,
  data,
  reverseY = true,
  plotId,
}: CptPlotInternalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current === null || data.length === 0) {
      return;
    }

    const plot = Plot.plot({
      height,
      width,
      style: {
        backgroundColor: "white",
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
        // Watermark
        Plot.text(["Made with Bedrock GEF Viewer"], {
          frameAnchor: "top-right",
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
  }, [data, xAxis, yAxis, width, height, reverseY]);

  return <div id={plotId} ref={containerRef}></div>;
}
