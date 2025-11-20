import { z } from "zod";
import type { GEFHeadersMap } from "./gef";

const stringArray = z.array(z.string());

export const COORDINATE_SYSTEMS = {
  "31000": {
    epsg: "EPSG:28992",
    proj4def:
      "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs",
    name: "RD (Rijksdriehoekscoördinaten)",
  },
  "31001": {
    epsg: "EPSG:32631", // WGS84 / UTM zone 31N
    name: "UTM-31N",
  },
  "31002": {
    epsg: "EPSG:32609", // WGS84 / UTM zone 9N
    name: "UTM-9N",
  },
  "32000": {
    epsg: "EPSG:31370", // Belgian Lambert 72
    name: "Belgian Lambert 72",
  },
  "49000": {
    epsg: "EPSG:31467", // DHDN / 3-degree Gauss-Krüger zone 3
    name: "Gauss-Krüger",
  },
} as const;

const coordinateSystemCodeSchema = z.enum([
  "31000",
  "31001",
  "31002",
  "32000",
  "49000",
] as const);

export type CoordinateSystemCode = z.infer<typeof coordinateSystemCodeSchema>;

export const HEIGHT_SYSTEM_MAP = {
  "31000": "NAP",
  "32000": "Ostend",
  "32001": "TAW",
  "49000": "NN",
} as const;

const heightSystemCodeSchema = z.enum([
  "31000",
  "32000",
  "32001",
  "49000",
] as const);

export type HeightSystemCode = z.infer<typeof heightSystemCodeSchema>;

// XYID - Coordinate System (parses from string tuple, validates as numbers)
// Default to RD (31000) if coordinate system is invalid or unrecognized
// Handle empty arrays or missing values gracefully - some GEF files have empty XYID
export const xyidSchema = z
  .array(z.string())
  .transform((arr) => {
    // If array is empty or has less than 3 elements (missing coords), return null
    if (arr.length < 3 || arr.every((s) => s.trim() === "")) {
      return null;
    }
    return {
      coordinateSystem: arr[0]!,
      x: parseFloat(arr[1]!),
      y: parseFloat(arr[2]!),
      deltaX: arr[3] ? parseFloat(arr[3]) : 0.01,
      deltaY: arr[4] ? parseFloat(arr[4]) : 0.01,
    };
  })
  .pipe(
    z
      .object({
        coordinateSystem: coordinateSystemCodeSchema.catch("31000"),
        x: z.number(),
        y: z.number(),
        deltaX: z.number().nonnegative(),
        deltaY: z.number().nonnegative(),
      })
      .nullable()
  );

export type XYID = z.infer<typeof xyidSchema>;

// ZID - Height Reference System
export const zidSchema = z
  .array(z.string())
  .min(2)
  .transform((arr) => ({
    code: arr[0]!,
    height: parseFloat(arr[1]!),
    deltaZ: arr[2] ? parseFloat(arr[2]) : 0.01,
  }))
  .pipe(
    z.object({
      code: heightSystemCodeSchema,
      height: z.number(),
      deltaZ: z.number().nonnegative(),
    })
  );

export type ZID = z.infer<typeof zidSchema>;

// ============================================================================
// VERSIONING
// ============================================================================

export const gefIdSchema = z
  .tuple([z.string(), z.string(), z.string()])
  .transform(([major, minor, patch]) => ({
    major: parseInt(major),
    minor: parseInt(minor),
    patch: parseInt(patch),
  }))
  .pipe(
    z.object({
      major: z.number().int().min(0),
      minor: z.number().int().min(0),
      patch: z.number().int().min(0),
    })
  );

export type GefId = z.infer<typeof gefIdSchema>;

// Report Code
export const reportCodeSchema = z
  .array(z.string())
  .min(4)
  .transform((arr) => ({
    code: arr[0],
    major: parseInt(arr[1] ?? "0"),
    minor: parseInt(arr[2] ?? "0"),
    patch: parseInt(arr[3] ?? "0"),
    extra: arr.slice(4),
  }))
  .pipe(
    z.object({
      code: z.string(),
      major: z.number().int().min(0),
      minor: z.number().int().min(0),
      patch: z.number().int().min(0),
      extra: z.array(z.string()),
    })
  );

export type ReportCode = z.infer<typeof reportCodeSchema>;

// ============================================================================
// DATE & TIME
// ============================================================================

export const dateSchema = z
  .tuple([z.string(), z.string(), z.string()])
  .transform(([year, month, day]) => ({
    year: parseInt(year),
    month: parseInt(month),
    day: parseInt(day),
  }))
  .pipe(
    z.object({
      year: z.number().int(),
      month: z.number().int().min(1).max(12),
      day: z.number().int().min(1).max(31),
    })
  );

export type GefDate = z.infer<typeof dateSchema>;

export const timeSchema = z
  .tuple([z.string(), z.string(), z.string()])
  .transform(([hour, minute, second]) => {
    // Handle placeholder values like "-" which are used when time is unknown
    if (hour === "-" || minute === "-" || second === "-") {
      return null;
    }
    return {
      hour: parseInt(hour),
      minute: parseInt(minute),
      second: parseInt(second),
    };
  })
  .pipe(
    z
      .object({
        hour: z.number().int().min(0).max(23),
        minute: z.number().int().min(0).max(59),
        second: z.number().int().min(0).max(59),
      })
      .nullable()
  );

export type GefTime = z.infer<typeof timeSchema>;

export const companyIdSchema = z
  .tuple([z.string(), z.string().optional(), z.string().optional()])
  .transform(([name, address, companyId]) => ({
    name,
    address,
    companyId,
  }));

export type CompanyId = z.infer<typeof companyIdSchema>;

export const columnInfoSchema = z
  .tuple([
    z.string(), // column number
    z.string(), // unit
    z.string(), // name/description
    z.string(), // quantity number
  ])
  .transform(([colNum, unit, name, quantityNumber]) => ({
    colNum: parseInt(colNum),
    unit,
    name,
    quantityNumber: parseInt(quantityNumber),
  }))
  .pipe(
    z.object({
      colNum: z.number().int().positive(),
      unit: z.string(),
      name: z.string(),
      quantityNumber: z.number().int().min(1),
    })
  );

export type ColumnInfo = z.infer<typeof columnInfoSchema>;

export const measurementVarSchema = z
  .tuple([z.string(), z.string(), z.string().optional(), z.string().optional()])
  .transform(([id, value, unit, description]) => ({
    id: parseInt(id),
    value,
    unit: unit ?? "-",
    description: description ?? "",
  }))
  .pipe(
    z.object({
      id: z.number().int().min(1).max(1500),
      value: z.string(),
      unit: z.string(),
      description: z.string(),
    })
  );

export type MeasurementVar = z.infer<typeof measurementVarSchema>;

export const measurementTextSchema = z
  .array(z.string())
  .min(2)
  .transform((arr) => ({
    id: arr[0] ? parseInt(arr[0]) : -1,
    text: arr[1],
    extra: arr.slice(2),
  }))
  .pipe(
    z.object({
      id: z.number().int().min(1),
      text: z.string().max(256),
      extra: z.array(z.string()),
    })
  );

export type MeasurementText = z.infer<typeof measurementTextSchema>;

export const gefHeadersSchema = z.object({
  // Project Information
  PROJECTID: z
    .array(stringArray)
    .optional()
    .transform((arr) => arr?.[0]?.[0]),
  TESTID: z
    .array(stringArray)
    .optional()
    .transform((arr) => arr?.[0]?.[0]),
  COMPANYID: z
    .array(z.tuple([z.string(), z.string().optional(), z.string().optional()]))
    .optional()
    .transform((arr) => (arr?.[0] ? companyIdSchema.parse(arr[0]) : undefined)),

  // Dates and Times
  STARTDATE: z
    .array(z.tuple([z.string(), z.string(), z.string()]))
    .optional()
    .transform((arr) => (arr?.[0] ? dateSchema.parse(arr[0]) : undefined)),
  STARTTIME: z
    .array(z.tuple([z.string(), z.string(), z.string()]))
    .optional()
    .transform((arr) => {
      if (!arr?.[0]) return undefined;
      const parsed = timeSchema.parse(arr[0]);
      return parsed ?? undefined;
    }),
  FILEDATE: z
    .array(z.tuple([z.string(), z.string(), z.string()]))
    .optional()
    .transform((arr) => (arr?.[0] ? dateSchema.parse(arr[0]) : undefined)),

  // Coordinates
  XYID: z
    .array(z.array(z.string()))
    .optional()
    .transform((arr) => {
      if (!arr?.[0]) return undefined;
      const parsed = xyidSchema.parse(arr[0]);
      // If parsing returned null (empty/invalid coords), return undefined
      return parsed ?? undefined;
    }),
  ZID: z
    .array(z.array(z.string()).min(2))
    .optional()
    .transform((arr) => (arr?.[0] ? zidSchema.parse(arr[0]) : undefined)),

  // Data Structure
  COLUMN: z
    .array(stringArray)
    .optional()
    .transform((arr) => (arr?.[0]?.[0] ? parseInt(arr[0][0]) : undefined)),
  LASTSCAN: z
    .array(stringArray)
    .optional()
    .transform((arr) => (arr?.[0]?.[0] ? parseInt(arr[0][0]) : undefined)),
  DATAFORMAT: z
    .array(stringArray)
    .optional()
    .transform((arr) => arr?.[0]?.[0]),
  COLUMNSEPARATOR: z
    .array(stringArray)
    .optional()
    .transform((arr) => arr?.[0]?.[0]),
  COLUMNINFO: z
    .array(z.tuple([z.string(), z.string(), z.string(), z.string()]))
    .optional()
    .transform((arr) => arr?.map((col) => columnInfoSchema.parse(col))),
  COLUMNVOID: z
    .array(z.tuple([z.coerce.number(), z.coerce.number()]))
    .optional()
    .transform((arr) =>
      arr?.map(([columnNumber, voidValue]) => ({ columnNumber, voidValue }))
    ),

  // Measurement Data
  MEASUREMENTVAR: z
    .array(
      z.tuple([
        z.string(),
        z.string(),
        z.string().optional(),
        z.string().optional(),
      ])
    )
    .optional()
    .transform((arr) => arr?.map((mv) => measurementVarSchema.parse(mv))),
  MEASUREMENTTEXT: z
    .array(z.array(z.string()).min(2))
    .optional()
    .transform((arr) => arr?.map((mt) => measurementTextSchema.parse(mt))),

  // File Metadata
  GEFID: z
    .array(z.tuple([z.string(), z.string(), z.string()]))
    .optional()
    .transform((arr) => (arr?.[0] ? gefIdSchema.parse(arr[0]) : undefined)),
  REPORTCODE: z
    .array(z.array(z.string()).min(4))
    .optional()
    .transform((arr) =>
      arr?.[0] ? reportCodeSchema.parse(arr[0]) : undefined
    ),
  FILEOWNER: z
    .array(stringArray)
    .optional()
    .transform((arr) => arr?.[0]?.[0]),
  OS: z
    .array(stringArray)
    .optional()
    .transform((arr) => arr?.[0]?.[0]),
});

export type GefHeaders = z.infer<typeof gefHeadersSchema>;

export function parseGefHeaders(headersMap: GEFHeadersMap): GefHeaders {
  const headersObj = Object.fromEntries(headersMap);
  return gefHeadersSchema.parse(headersObj);
}
