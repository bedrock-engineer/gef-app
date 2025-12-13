/**
 * GEF Chart Helpers
 *
 * Optional utilities for detecting chart axes and formatting column metadata for visualization.
 * This is presentation logic separate from the core parser - consumers can use their own
 * chart detection logic or copy this file to their application.
 */

import {
  findColumnByQuantity,
  HEIGHT_SYSTEMS,
  type ColumnInfo,
  type Row,
  type ZID,
} from "@bedrock-engineer/gef-parser";
import { cptColumnQuantities } from "node_modules/@bedrock-engineer/gef-parser/dist/gef-cpt-spec";

export const DEPTH_KEYWORDS = [
  "penetration",
  "sondeer",
  "length",
  "diepte",
  "lengte",
];

const CPT_QUANTITY = {
  LENGTH: 1,
  CONE_RESISTANCE: 2,
  FRICTION_RESISTANCE: 3,
  FRICTION_NUMBER: 4,
  PORE_PRESSURE_U2: 6,
  INCLINATION: 8,
  CORRECTED_DEPTH: 11,
  CORRECTED_CONE_RESISTANCE: 13,
} as const;

export interface ChartColumn {
  key: string;
  unit: string;
  name: string;
}

export interface ChartAxes {
  yAxis: ChartColumn | null;
  xAxis: ChartColumn | null;
  availableColumns: Array<ChartColumn>;
  yAxisOptions: Array<ChartColumn>;
}

/**
 * Extract unit code from verbose unit strings like "MPa (megaPascal)" -> "MPa"
 */
export function getUnitCode(unit: string): string {
  return unit.split(/\s+/)[0] ?? unit;
}

/**
 * Get standardized display name for a column based on its quantity number
 */
export function getColumnDisplayName(col: ColumnInfo): string {
  const quantity = cptColumnQuantities[col.quantityNumber];
  if (quantity) {
    return quantity.symbol
      ? `${quantity.name} (${quantity.symbol})`
      : quantity.name;
  }
  return col.name;
}

/**
 * Detect sensible default chart axes for CPT data visualization
 *
 * Default behavior:
 * - Y-axis: Penetration length (quantity 1), fallback to corrected depth (11)
 * - X-axis: Cone resistance (quantity 2), fallback to corrected cone (13) or friction (4)
 * - Also provides all available columns and Y-axis alternatives
 */
export function detectChartAxes(
  columnInfo: Array<ColumnInfo>,
  data: Array<Row>,
  zid: ZID | undefined,
): ChartAxes {
  // Y-axis: prefer quantity 1 (penetration length), then corrected depth (11), then keyword fallback
  const yColumn =
    findColumnByQuantity(columnInfo, CPT_QUANTITY.LENGTH) ??
    findColumnByQuantity(columnInfo, CPT_QUANTITY.CORRECTED_DEPTH) ??
    columnInfo.find((col) => {
      const nameLower = col.name.toLowerCase();
      return (
        col.unit === "m" && DEPTH_KEYWORDS.some((kw) => nameLower.includes(kw))
      );
    });

  // X-axis candidates: exclude depth column
  const xCandidates = columnInfo.filter(
    (col) => col.colNum !== yColumn?.colNum,
  );

  // X-axis: prefer quantity 2 (cone resistance), then corrected cone (13), then friction number (4)
  const xColumn =
    findColumnByQuantity(xCandidates, CPT_QUANTITY.CONE_RESISTANCE) ??
    findColumnByQuantity(xCandidates, CPT_QUANTITY.CORRECTED_CONE_RESISTANCE) ??
    findColumnByQuantity(xCandidates, CPT_QUANTITY.FRICTION_NUMBER) ??
    xCandidates[0];

  const yAxisOptions: Array<ChartColumn> = [];

  // Add original penetration length
  if (yColumn) {
    yAxisOptions.push({
      key: yColumn.name,
      unit: getUnitCode(yColumn.unit),
      name: getColumnDisplayName(yColumn),
    });
  }

  // Add corrected depth from file (quantity 11) if available and different from yColumn
  const correctedDepthCol = findColumnByQuantity(
    columnInfo,
    CPT_QUANTITY.CORRECTED_DEPTH,
  );

  if (correctedDepthCol && correctedDepthCol.colNum !== yColumn?.colNum) {
    yAxisOptions.push({
      key: correctedDepthCol.name,
      unit: getUnitCode(correctedDepthCol.unit),
      name: getColumnDisplayName(correctedDepthCol),
    });
  }

  // Add computed true depth if available
  const hasTrueDepth = data.length > 0 && data[0]?.trueDepth !== undefined;
  if (hasTrueDepth) {
    yAxisOptions.push({
      key: "trueDepth",
      unit: "m",
      name: "True Depth (inclination corrected)",
    });
  }

  // Add elevation if ZID is available
  const hasElevation = data.length > 0 && data[0]?.elevation !== undefined;
  if (hasElevation && zid) {
    const heightSystem = HEIGHT_SYSTEMS[zid.code].name;

    yAxisOptions.push({
      key: "elevation",
      unit: `m ${heightSystem}`,
      name: `Elevation (${heightSystem})`,
    });
  }

  return {
    yAxis: yAxisOptions[0] ?? null,
    xAxis: xColumn
      ? {
          key: xColumn.name,
          unit: getUnitCode(xColumn.unit),
          name: getColumnDisplayName(xColumn),
        }
      : null,
    availableColumns: columnInfo.map((col) => ({
      key: col.name,
      unit: getUnitCode(col.unit),
      name: getColumnDisplayName(col),
    })),
    yAxisOptions,
  };
}
