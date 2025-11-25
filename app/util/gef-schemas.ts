/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { z } from "zod";
import type { $ZodIssue } from "zod/v4/core";
import type { GEFHeadersMap } from "./gef-common";

const stringArray = z.array(z.string().trim());

const coordinateSystemCodes = [
  "00000",
  "00001",
  "01000",
  "31000",
  "31001",
  "31002",
  "32000",
  "49000",
] as const;

export const COORDINATE_SYSTEMS = {
  "00000": {
    epsg: null,
    name: "Lokaal coördinatensysteem",
    nameEn: "Local coordinate system (self-defined)",
    country: "N/A",
  },
  "00001": {
    epsg: "EPSG:4326",
    name: "Geografisch coördinatensysteem",
    nameEn: "Geographic coordinate system (WGS 84)",
    country: "International",
  },
  "01000": {
    epsg: null, // SPCS has many zones, would need specific zone
    name: "State Plane Coordinate System",
    nameEn: "State Plane Coordinate System",
    country: "USA",
  },
  "31000": {
    epsg: "EPSG:28992",
    proj4def:
      "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs",
    name: "Rijksdriehoekscoördinaten",
    nameEn: "Dutch National Grid",
    country: "Netherlands",
  },
  "31001": {
    epsg: "EPSG:32631",
    name: "UTM zone 31N",
    nameEn: "WGS 84 / UTM zone 31N",
    country: "International",
  },
  "31002": {
    epsg: "EPSG:32609",
    name: "UTM zone 9N",
    nameEn: "WGS 84 / UTM zone 9N",
    country: "International",
  },
  "32000": {
    epsg: "EPSG:31370",
    proj4def:
      "+proj=lcc +lat_0=90 +lon_0=4.36748666666667 +lat_1=51.1666672333333 +lat_2=49.8333339 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=-106.8686,52.2978,-103.7239,0.3366,-0.457,1.8422,-1.2747 +units=m +no_defs",
    name: "Belge 1972 / Belgian Lambert 72",
    nameEn: "Belgian Lambert 72",
    country: "Belgium",
  },
  "49000": {
    epsg: "EPSG:31467",
    name: "DHDN / Gauss-Krüger zone 3",
    nameEn: "German Gauss-Krüger zone 3",
    country: "Germany",
  },
} as const;

const coordinateSystemCodeSchema = z.enum(coordinateSystemCodes);

export type CoordinateSystemCode = z.infer<typeof coordinateSystemCodeSchema>;

const heightSystemCodes = [
  "00000",
  "00001",
  "31000",
  "32000",
  "32001",
  "49000",
] as const;

export const HEIGHT_SYSTEMS = {
  "00000": {
    name: "Lokaal referentiesysteem",
    nameEn: "Local reference system (self-defined)",
    epsg: null,
    country: "N/A",
  },
  "00001": {
    name: "Low Low Water Spring",
    nameEn: "Low Low Water Spring",
    epsg: null,
    country: "International",
  },
  "31000": {
    name: "Normaal Amsterdams Peil",
    nameEn: "Amsterdam Ordnance Datum",
    epsg: "EPSG:7415", // ETRS89 + NAP height
    country: "Netherlands",
  },
  "32000": {
    name: "Ostend Level",
    nameEn: "Ostend Height",
    epsg: "EPSG:5710",
    country: "Belgium",
  },
  "32001": {
    name: "Tweede Algemene Waterpassing",
    nameEn: "Second General Levelling",
    epsg: "EPSG:5710", // TAW
    country: "Belgium",
  },
  "49000": {
    name: "Normalnull",
    nameEn: "Normal Null (German standard height)",
    epsg: "EPSG:5783", // DHHN92 height
    country: "Germany",
  },
} as const;

const heightSystemCodeSchema = z.enum(heightSystemCodes);

export type HeightSystemCode = z.infer<typeof heightSystemCodeSchema>;

// Coordinate System (parses from string tuple, validates as numbers)
// Default to RD (31000) if coordinate system is invalid or unrecognized
// Handle empty arrays or missing values gracefully some GEF files have empty XYID
const xyidSchema = z
  .array(z.string())
  .transform((arr) => {
    // If array is empty or has less than 3 elements (missing coords), return null
    if (arr.length < 3 || arr.every((s) => s.trim() === "")) {
      return null;
    }
    return {
      coordinateSystem: arr[0]!.trim(),
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
        x: z.number({
          message: "X coordinate must be a valid number",
        }),
        y: z.number({
          message: "Y coordinate must be a valid number",
        }),
        deltaX: z.number().nonnegative({
          message: "X uncertainty (deltaX) must be a non-negative number",
        }),
        deltaY: z.number().nonnegative({
          message: "Y uncertainty (deltaY) must be a non-negative number",
        }),
      })
      .nullable()
  );

export type XYID = z.infer<typeof xyidSchema>;

// Height Reference System
// Default to NAP (31000) if coordinate system is invalid or unrecognized
const zidSchema = z
  .array(z.string())
  .min(1, {
    message:
      "#ZID must have at least 1 value: height system code (e.g., 31000, -3.75)",
  })
  .transform((arr) => ({
    code: arr[0]!.trim(),
    height: arr[1] ? parseFloat(arr[1]) : 0,
    deltaZ: arr[2] ? parseFloat(arr[2]) : 0.01,
  }))
  .pipe(
    z.object({
      code: heightSystemCodeSchema.catch("31000"),
      height: z.number({
        message: "Surface elevation must be a valid number",
      }),
      deltaZ: z.number().nonnegative({
        message: "Height uncertainty (deltaZ) must be a non-negative number",
      }),
    })
  );

export type ZID = z.infer<typeof zidSchema>;

// ============================================================================
// VERSIONING
// ============================================================================

const gefIdSchema = z
  .tuple([z.string(), z.string(), z.string()], {
    message: "#GEFID must have 3 values: major, minor, patch (e.g., 1, 1, 0)",
  })
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

const reportCodeSchema = z
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

const dateSchema = z
  .tuple([z.string(), z.string(), z.string()], {
    message: "Date must have 3 values: year, month, day (e.g., 2024, 1, 15)",
  })
  .transform(([year, month, day]) => ({
    year: parseInt(year),
    month: parseInt(month),
    day: parseInt(day),
  }))
  .pipe(
    z.object({
      year: z.number().int({ message: "Year must be a whole number" }),
      month: z
        .number()
        .int()
        .min(1, { message: "Month must be between 1 and 12" })
        .max(12, { message: "Month must be between 1 and 12" }),
      day: z
        .number()
        .int()
        .min(1, { message: "Day must be between 1 and 31" })
        .max(31, { message: "Day must be between 1 and 31" }),
    })
  );

export type GefDate = z.infer<typeof dateSchema>;

const timeSchema = z
  .tuple([z.string(), z.string(), z.string()], {
    message: "Time must have 3 values: hour, minute, second (e.g., 14, 30, 0)",
  })
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
        hour: z
          .number()
          .int()
          .min(0, { message: "Hour must be between 0 and 23" })
          .max(23, { message: "Hour must be between 0 and 23" }),
        minute: z
          .number()
          .int()
          .min(0, { message: "Minute must be between 0 and 59" })
          .max(59, { message: "Minute must be between 0 and 59" }),
        second: z
          .number()
          .int()
          .min(0, { message: "Second must be between 0 and 59" })
          .max(59, { message: "Second must be between 0 and 59" }),
      })
      .nullable()
  );

export type GefTime = z.infer<typeof timeSchema>;

const companyIdSchema = z
  .tuple([
    z.string().trim(),
    z.string().trim().optional(),
    z.string().trim().optional(),
  ])
  .transform(([name, address, countryCode]) => ({
    name,
    address,
    countryCode,
  }));

export type CompanyId = z.infer<typeof companyIdSchema>;

const columnInfoSchema = z
  .array(z.string().trim())
  .min(3, {
    message:
      "#COLUMNINFO must have at least 3 values: column number, unit, name (e.g., 1, m, depth)",
  })
  .transform((arr) => ({
    colNum: parseInt(arr[0]!), // column number
    unit: arr[1]!, // unit
    name: arr[2]!, // name/description
    quantityNumber: parseInt(arr[3] ?? "0"), // quantity number (optional, default 0)
  }))
  .pipe(
    z.object({
      colNum: z
        .number()
        .int()
        .positive({ message: "Column number must be a positive integer" }),
      unit: z.string(),
      name: z.string(),
      quantityNumber: z.number().int().min(0),
    })
  );

export type ColumnInfo = z.infer<typeof columnInfoSchema>;

const measurementVarSchema = z
  .tuple([
    z.string().trim(),
    z.string().trim(),
    z.string().trim().optional(),
    z.string().trim().optional(),
  ])
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

const measurementTextSchema = z
  .array(z.string().trim())
  .min(2)
  .transform((arr) => ({
    id: arr[0] ? parseInt(arr[0]) : -1,
    text: arr[1] ?? "",
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

// SPECIMENVAR schema - same structure as MEASUREMENTVAR
const specimenVarSchema = z
  .array(z.string().trim())
  .min(2)
  .transform((arr) => ({
    id: parseInt(arr[0] ?? "0"),
    value: parseFloat(arr[1] ?? "—"),
    unit: arr[2] ?? "-",
    description: arr[3] ?? "",
  }))
  .pipe(
    z.object({
      id: z.number().int().min(1).max(1410),
      value: z.number(),
      unit: z.string(),
      description: z.string(),
    })
  );

export type SpecimenVar = z.infer<typeof specimenVarSchema>;

// SPECIMENTEXT schema - same structure as MEASUREMENTTEXT
const specimenTextSchema = z
  .array(z.string().trim())
  .min(2)
  .transform((arr) => ({
    id: arr[0] ? parseInt(arr[0]) : -1,
    text: arr[1] ?? "",
    extra: arr.slice(2),
  }))
  .pipe(
    z.object({
      id: z.number().int().min(1).max(1410),
      text: z.string(),
      extra: z.array(z.string()),
    })
  );

export type SpecimenText = z.infer<typeof specimenTextSchema>;

// =============================================================================
// BASE SCHEMA - Shared fields between CPT and BORE
// =============================================================================

const gefBaseHeadersSchema = z.object({
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
      if (!arr?.[0]) {
        return undefined;
      }
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
      if (!arr?.[0]) {
        return undefined;
      }
      const parsed = xyidSchema.parse(arr[0]);
      // If parsing returned null (empty/invalid coords), return undefined
      return parsed ?? undefined;
    }),
  ZID: z
    .array(z.array(z.string()).min(1))
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
    .transform((arr) => arr?.[0]?.[0]?.trim()),
  RECORDSEPARATOR: z
    .array(stringArray)
    .optional()
    .transform((arr) => arr?.[0]?.[0]?.trim()),
  COLUMNINFO: z
    .array(z.array(z.string()).min(3))
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

  SPECIMENVAR: z
    .array(z.array(z.string()).min(2))
    .optional()
    .transform((arr) => arr?.map((sv) => specimenVarSchema.parse(sv))),

  // Unofficial but common - free-form comments
  COMMENT: z
    .array(stringArray)
    .optional()
    .transform((arr) =>
      arr?.map((c) => c.join(", ")).filter((c) => c.length > 0)
    ),
});

const gefCptHeadersSchema = gefBaseHeadersSchema.extend({
  COLUMNMINMAX: z
    .array(z.tuple([z.coerce.number(), z.coerce.number(), z.coerce.number()]))
    .optional()
    .transform((arr) =>
      arr?.map(([columnNumber, min, max]) => ({ columnNumber, min, max }))
    ),
});

export type GefCptHeaders = z.infer<typeof gefCptHeadersSchema>;

const gefBoreHeadersSchema = gefBaseHeadersSchema.extend({
  // Specimen Data (BORE-specific)
  SPECIMENTEXT: z
    .array(z.array(z.string()).min(2))
    .optional()
    .transform((arr) => arr?.map((st) => specimenTextSchema.parse(st))),
});

export type GefBoreHeaders = z.infer<typeof gefBoreHeadersSchema>;

/**  Format Zod errors into user-friendly messages */
const formatIssue = (issue: $ZodIssue) => {
  const path = issue.path.length > 0 ? `#${issue.path.join(".")}: ` : "";

  return `${path}${issue.message}`;
};

export function parseGefCptHeaders(headersMap: GEFHeadersMap): GefCptHeaders {
  const headersObj = Object.fromEntries(headersMap);
  const result = gefCptHeadersSchema.safeParse(headersObj);

  if (!result.success) {
    // Format Zod errors into user-friendly messages
    const errors = result.error.issues.map((issue) => formatIssue(issue));
    throw new Error(errors.join("\n"));
  }

  return result.data;
}

export function parseGefBoreHeaders(headersMap: GEFHeadersMap): GefBoreHeaders {
  const headersObj = Object.fromEntries(headersMap);
  const result = gefBoreHeadersSchema.safeParse(headersObj);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => formatIssue(issue));
    throw new Error(errors.join("\n"));
  }

  return result.data;
}
