import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  COORDINATE_SYSTEMS,
  type CoordinateSystemCode,
} from "../util/gef-schemas";
import { convertToWGS84 } from "../util/coordinates";
import type { GefData, GefFileType } from "~/util/gef";

interface GefLocation {
  filename: string;
  x: number;
  y: number;
  coordinateSystem: CoordinateSystemCode | "-";
  fileType: GefFileType;
}

interface GefMultiMapProps {
  gefData: Record<string, GefData>;
  selectedFileName: string | null;
  onMarkerClick: (filename: string) => void;
}

export function GefMultiMap({
  gefData,
  selectedFileName,
  onMarkerClick,
}: GefMultiMapProps) {
  if (typeof window === "undefined") {
    throw Error("GefMultiMap should only render on the client.");
  }

  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [error, setError] = useState<string | null>(null);

  // Extract locations from GEF data
  const locations: Array<GefLocation> = useMemo(
    () =>
      Object.entries(gefData)
        .filter(([_, data]) => data.headers.XYID)
        .map(([filename, data]) => ({
          filename,
          x: data.headers.XYID?.x ?? 0,
          y: data.headers.XYID?.y ?? 0,
          coordinateSystem: data.headers.XYID?.coordinateSystem ?? "-",
          fileType: data.fileType,
        })),
    [gefData]
  );

  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return;

    // Dynamic imports to avoid SSR issues
    Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")])
      .then(([leafletModule]) => {
        const L = leafletModule.default;

        // Transform all coordinates using shared utility
        const transformedLocations = locations
          .map((loc) => {
            const coords = convertToWGS84({
              coordinateSystem: loc.coordinateSystem,
              x: loc.x,
              y: loc.y,
            });
            if (!coords) return null;
            return { ...loc, lat: coords.lat, lng: coords.lon };
          })
          .filter((loc): loc is NonNullable<typeof loc> => loc !== null);

        if (transformedLocations.length === 0) {
          setError(t("noValidLocations"));
          return;
        }

        // Create or update map
        if (!mapInstanceRef.current) {
          // Calculate bounds
          const lats = transformedLocations.map((l) => l.lat);
          const lngs = transformedLocations.map((l) => l.lng);
          const bounds: [[number, number], [number, number]] = [
            [Math.min(...lats), Math.min(...lngs)],
            [Math.max(...lats), Math.max(...lngs)],
          ];

          const map = L.map(mapRef.current!, {
            zoomControl: true,
            attributionControl: true,
          });

          map.fitBounds(bounds, { padding: [50, 50] });

          // Add OpenStreetMap tiles
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(map);

          mapInstanceRef.current = map;
        }

        const map = mapInstanceRef.current;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current.clear();

        // Add markers for each location
        transformedLocations.forEach((loc) => {
          // CPT = blue, BORE = orange
          const color = loc.fileType === "CPT" ? "#2563eb" : "#ea580c";

          const marker = L.circleMarker([loc.lat, loc.lng], {
            radius: 8,
            fillColor: color,
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(map);

          const coordSysName =
            COORDINATE_SYSTEMS[loc.coordinateSystem]?.name ??
            loc.coordinateSystem;

          marker.bindPopup(`
            <div class="text-xs">
              <strong>${loc.filename}</strong><br/>
              ${coordSysName}: ${loc.x.toFixed(2)}, ${loc.y.toFixed(2)}<br/>
              Lat/Lng: ${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}
            </div>
          `);

          marker.on("click", () => {
            onMarkerClick(loc.filename);
          });

          markersRef.current.set(loc.filename, marker);
        });
      })
      .catch((error: unknown) => {
        setError(
          `Failed to load map: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      });

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locations, locations.length, onMarkerClick, t]);

  // Update marker styles when selection changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach((marker, filename) => {
      const isSelected = filename === selectedFileName;
      const loc = locations.find((l) => l.filename === filename);
      const baseColor = loc?.fileType === "CPT" ? "#2563eb" : "#ea580c";

      marker.setStyle({
        radius: isSelected ? 10 : 8,
        fillColor: isSelected ? "#dc2626" : baseColor,
        weight: isSelected ? 3 : 2,
      });

      if (isSelected) {
        marker.bringToFront();
      }
    });
  }, [selectedFileName, locations]);

  if (locations.length === 0) {
    return (
      <div className="w-full h-96 rounded-md border border-gray-300 bg-gray-50 flex items-center justify-center">
        <span className="text-gray-500">{t("noLocationData")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 rounded-md border border-red-300 bg-red-50 flex items-center justify-center p-4">
        <div className="text-center">
          <span className="text-red-600 font-semibold block mb-1">
            Map Error
          </span>
          <span className="text-red-500 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-96 rounded-md border border-gray-300"
      style={{ zIndex: 0 }}
    />
  );
}
