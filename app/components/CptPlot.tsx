import * as Plot from "@observablehq/plot";
import { useEffect, useRef, useState } from "react";
import { Checkbox, CheckboxGroup, Label } from "react-aria-components";

interface Column {
  key: string;
  unit: string;
  name: string;
}

const DEPTH_KEYWORDS = ["penetration", "sondeer", "sondeertrajectlengte", "length", "diepte", "lengte"];

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
  width?: number;
  height?: number;
}

export function CptPlots({
  data,
  xAxis: initialXAxis,
  yAxis,
  availableColumns,
  width = 300,
  height = 800,
}: CptPlotProps) {
  const [selectedAxes, setSelectedAxes] = useState([initialXAxis.key]);

  const xAxisOptions = availableColumns.filter((col) => !isDepthColumn(col));

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
      <div className="mb-4 flex flex-wrap gap-4 items-end">
        <CheckboxGroup
          value={selectedAxes}
          onChange={(v) => {
            setSelectedAxes(v);
          }}
        >
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Columns
          </Label>
          <div className="flex gap-x-1">
            {xAxisOptions.map((x) => (
              <Checkbox
                key={x.key}
                value={x.key}
                className="flex items-center gap-2 group"
              >
                <div className="w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center group-data-[selected]:bg-blue-600 group-data-[selected]:border-blue-600 transition-colors">
                  <svg
                    viewBox="0 0 18 18"
                    className="w-3 h-3 fill-none stroke-white stroke-2 opacity-0 group-data-[selected]:opacity-100"
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
            Y-Axis (Vertical - Depth)
          </span>
          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700">
            {yAxis.name} ({yAxis.unit})
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        {selectedAxes.map((k) => {
          const xAxis = xAxisOptions.find((c) => c.key === k);

          if (!xAxis) return null;

          return (
            <CptPlot
              key={k}
              data={data}
              height={height}
              width={width}
              yAxis={yAxis}
              xAxis={xAxis}
            />
          );
        })}
      </div>
    </div>
  );
}

function CptPlot({
  height,
  width,
  xAxis,
  yAxis,
  data,
}: Omit<CptPlotProps, "availableColumns">) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current === null || data.length === 0) {
      return;
    }

    const plot = Plot.plot({
      height,
      width,
      x: {
        label: `${xAxis.name} (${xAxis.unit})`,
        grid: true,
      },
      y: {
        grid: true,
        reverse: true,
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
      ],
    });

    containerRef.current.innerHTML = "";
    containerRef.current.append(plot);
    return () => {
      plot.remove();
    };
  }, [data, xAxis, yAxis, width, height]);

  return <div ref={containerRef}></div>;
}
