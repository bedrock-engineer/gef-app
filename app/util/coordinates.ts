import proj4 from "proj4";
import { COORDINATE_SYSTEMS, type CoordinateSystemCode } from "./gef-schemas";

export interface WGS84Coords {
  lat: number;
  lon: number;
}

export interface CoordinateInput {
  coordinateSystem: CoordinateSystemCode;
  x: number;
  y: number;
}

/**
 * Convert coordinates from a GEF coordinate system to WGS84 (EPSG:4326)
 * Returns null if the conversion fails or coordinates are invalid
 */
export function convertToWGS84(
  input: CoordinateInput
): WGS84Coords | null {
  const coordSysConfig = COORDINATE_SYSTEMS[input.coordinateSystem];
  if (!coordSysConfig) return null;

  try {
    // Define custom projection if needed
    if ("proj4def" in coordSysConfig) {
      proj4.defs(coordSysConfig.epsg, coordSysConfig.proj4def);
    }

    const [lon, lat] = proj4(coordSysConfig.epsg, "EPSG:4326", [
      input.x,
      input.y,
    ]);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return null;
    }

    return { lat, lon };
  } catch {
    return null;
  }
}
