/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { CircleMarker, Map as LeafletMap } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { GefData } from "@bedrock-engineer/gef-parser";
import type { ProcessedMetadata } from "@bedrock-engineer/gef-parser";

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
  const mapInstanceRef = useRef<LeafletMap>(null);
  const markersRef = useRef<Map<string, CircleMarker>>(new Map());

  // Extract processed metadata from GEF data
  const locations: Array<ProcessedMetadata> = useMemo(
    () =>
      Object.values(gefData)
        .map((data) => data.processed)
        .filter((meta) => meta.wgs84 !== null),
    [gefData],
  );

  useEffect(() => {
    if (!mapRef.current || locations.length === 0) {
      return;
    }

    // Create or update map
    if (!mapInstanceRef.current) {
      // Calculate bounds
      const lats = locations.map((l) => l.wgs84!.lat);
      const lngs = locations.map((l) => l.wgs84!.lon);
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ];

      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
      });

      map.fitBounds(bounds, { padding: [50, 50] });

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
    locations.forEach((loc) => {
      // CPT = blue, BORE = orange
      const color = loc.fileType === "CPT" ? "#2563eb" : "#ea580c";

      const marker = L.circleMarker([loc.wgs84!.lat, loc.wgs84!.lon], {
        radius: 8,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map);

      const coordSysName = loc.coordinateSystem?.name ?? "Unknown";

      marker.bindPopup(`
            <div class="text-xs">
              <strong>${loc.filename}</strong><br/>
              ${coordSysName}: ${loc.originalX?.toFixed(2)}, ${loc.originalY?.toFixed(2)}<br/>
              Lat/Lng: ${loc.wgs84!.lat.toFixed(6)}, ${loc.wgs84!.lon.toFixed(6)}
            </div>
          `);

      marker.on("click", () => {
        onMarkerClick(loc.filename);
      });

      markersRef.current.set(loc.filename, marker);
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
    if (!mapInstanceRef.current) {
      return;
    }

    markersRef.current.forEach((marker, filename) => {
      const isSelected = filename === selectedFileName;
      const meta = locations.find((l) => l.filename === filename);
      const baseColor = meta?.fileType === "CPT" ? "#2563eb" : "#ea580c";

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
      <div className="w-full h-96 rounded-sm border border-gray-300 bg-gray-50 flex items-center justify-center">
        <span className="text-gray-500">{t("noLocationData")}</span>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-96 rounded-sm border border-gray-300"
      style={{ zIndex: 0 }}
    />
  );
}
