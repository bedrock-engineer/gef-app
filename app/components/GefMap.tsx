import { useEffect, useRef, useState } from "react";
import {
  COORDINATE_SYSTEMS,
  type CoordinateSystemCode,
} from "../util/gef-schemas";

interface GefMapProps {
  x: number;
  y: number;
  coordinateSystem?: CoordinateSystemCode;
}

export function GefMap({ x, y, coordinateSystem = "31000" }: GefMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return;

    // Check if coordinate system is supported
    const coordSysConfig = COORDINATE_SYSTEMS[coordinateSystem];

    // Dynamic imports to avoid SSR issues
    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
      import("proj4"),
    ])
      .then(([leafletModule, _, proj4Module]) => {
        const L = leafletModule.default;
        const proj4 = proj4Module.default;

        // Define custom projection if needed
        if ("proj4def" in coordSysConfig) {
          proj4.defs(coordSysConfig.epsg, coordSysConfig.proj4def);
        }

        let lat: number, lng: number;

        try {
          // Transform coordinates to WGS84 (lat/lng) for display
          const [transformedLng, transformedLat] = proj4(
            coordSysConfig.epsg,
            "EPSG:4326",
            [x, y]
          );
          lat = transformedLat;
          lng = transformedLng;

          // Validate coordinates
          if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
          ) {
            setError(
              `Invalid coordinates after transformation: ${lat}, ${lng}`
            );
            return;
          }
        } catch (err) {
          setError(
            `Failed to transform coordinates: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
          return;
        }

        // Create the map
        const map = L.map(mapRef.current!, {
          center: [lat, lng],
          zoom: 16,
          zoomControl: true,
          attributionControl: true,
        });

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add marker at the location
        const marker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            iconRetinaUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            shadowUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        }).addTo(map);

        // Add popup with coordinates
        marker.bindPopup(`
        <div class="text-xs">
          <strong>Test Location</strong><br/>
          ${coordSysConfig.name}: ${x.toFixed(2)}, ${y.toFixed(2)}<br/>
          Lat/Lng: ${lat.toFixed(6)}, ${lng.toFixed(6)}
        </div>
      `);

        mapInstanceRef.current = map;
      })
      .catch((err) => {
        setError(
          `Failed to load map: ${
            err instanceof Error ? err.message : String(err)
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
  }, [isClient, x, y, coordinateSystem]);

  if (!isClient) {
    return (
      <div className="w-full h-64 rounded-lg border border-gray-300 shadow-sm bg-gray-100 flex items-center justify-center">
        <span className="text-gray-500">Loading map...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 rounded-lg border border-red-300 shadow-sm bg-red-50 flex items-center justify-center p-4">
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
      className="w-full h-64 rounded-lg border border-gray-300 shadow-sm"
      style={{ zIndex: 0 }}
    />
  );
}
