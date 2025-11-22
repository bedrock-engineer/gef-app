import { useEffect, useRef, useState } from "react";
import { COORDINATE_SYSTEMS, type CoordinateSystemCode } from "../util/gef-schemas";
import { convertToWGS84 } from "../util/coordinates";
import type { GefData } from "~/util/gef";

interface GefLocation {
  filename: string;
  x: number;
  y: number;
  coordinateSystem: CoordinateSystemCode;
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

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [error, setError] = useState<string | null>(null);

  // Extract locations from GEF data
  const locations: Array<GefLocation> = Object.entries(gefData)
    .filter(([_, data]) => data.headers.XYID)
    .map(([filename, data]) => ({
      filename,
      x: data.headers.XYID!.x,
      y: data.headers.XYID!.y,
      coordinateSystem: data.headers.XYID!.coordinateSystem,
    }));

  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return;

    // Dynamic imports to avoid SSR issues
    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
    ])
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
          setError("No valid locations to display");
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
          const marker = L.marker([loc.lat, loc.lng], {
            icon: L.icon({
              iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
              shadowUrl:
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            }),
          }).addTo(map);

          const coordSysName = COORDINATE_SYSTEMS[loc.coordinateSystem]?.name ?? loc.coordinateSystem;
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
  }, [locations, locations.length, onMarkerClick]);

  // Update marker styles when selection changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    Promise.all([import("leaflet")])
      .then(([leafletModule]) => {
        const L = leafletModule.default;

        markersRef.current.forEach((marker, filename) => {
          const isSelected = filename === selectedFileName;
          
          marker.setIcon(
            L.icon({
              iconUrl: isSelected
                ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
                : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
              shadowUrl:
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            })
          );
        });
      })
      .catch((error: unknown) => {
        console.log("Failed to update map markers", error);
      });
  }, [selectedFileName]);

  if (locations.length === 0) {
    return (
      <div className="w-full h-96 rounded-lg border border-gray-300 shadow-sm bg-gray-50 flex items-center justify-center">
        <span className="text-gray-500">No GEF files with location data</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 rounded-lg border border-red-300 shadow-sm bg-red-50 flex items-center justify-center p-4">
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
      className="w-full h-96 rounded-lg border border-gray-300 shadow-sm"
      style={{ zIndex: 0 }}
    />
  );
}
