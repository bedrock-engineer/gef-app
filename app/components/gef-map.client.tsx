import type { GefData } from "@bedrock-engineer/gef-parser";
import type {
  GeoJSONSource,
  LngLatBoundsLike,
  MapMouseEvent,
  StyleSpecification,
} from "maplibre-gl";
import {
  LngLatBounds,
  Map as MaplibreMap,
  NavigationControl,
  Popup,
  ScaleControl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { RadioButton, RadioField, RadioGroup } from "react-aria-components";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { PortalControl, SearchBox } from "./map-search.client";

interface GefMapProps {
  gefData: Record<string, GefData>;
  selectedFileName: string | null;
  onMarkerClick: (filename: string) => void;
}

// CPT = blue, DISS = green, BORE = orange
const typeColors = {
  CPT: "#2563eb",
  DISS: "#16a34a",
  BORE: "#ea580c",
} as const;

const selectedColor = "#dc2626"; // red

// Netherlands plus Flanders — GEF files come from both.
const initialBounds: LngLatBoundsLike = [
  [2.5, 50.6],
  [7.5, 53.8],
];

const locationsLayerId = "location-points";

interface BasemapDefinition {
  id: string;
  labelKey:
    | "mapBasemapOsm"
    | "mapBasemapTopo"
    | "mapBasemapAerial"
    | "mapBasemapGrb";
  tiles: string;
  attribution: string;
}

const basemaps: ReadonlyArray<BasemapDefinition> = [
  {
    id: "osm",
    labelKey: "mapBasemapOsm",
    tiles: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    id: "brt",
    labelKey: "mapBasemapTopo",
    tiles:
      "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/{z}/{x}/{y}.png",
    attribution:
      'Kaartgegevens &copy; <a href="https://www.kadaster.nl/">Kadaster</a>',
  },
  {
    id: "luchtfoto",
    labelKey: "mapBasemapAerial",
    tiles:
      "https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0/Actueel_orthoHR/EPSG:3857/{z}/{x}/{y}.jpeg",
    attribution:
      'Kaartgegevens &copy; <a href="https://www.kadaster.nl/">Kadaster</a>',
  },
  {
    id: "grb",
    labelKey: "mapBasemapGrb",
    // Basiskaart Vlaanderen (GRB); KVP-only WMTS, GoogleMapsVL is the
    // EPSG:3857 tile matrix set
    tiles:
      "https://geo.api.vlaanderen.be/GRB/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=grb_bsk&STYLE=&FORMAT=image/png&TILEMATRIXSET=GoogleMapsVL&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}",
    attribution:
      'Basiskaart &copy; <a href="https://www.vlaanderen.be/digitaal-vlaanderen">Digitaal Vlaanderen</a>',
  },
];

type BasemapId = string;

const defaultBasemapId: BasemapId = "osm";

/**
 * Style with the PDOK BRT achtergrondkaart and the Flemish GRB
 * basiskaart as basemaps (switching toggles layer visibility) and a
 * GeoJSON source for the loaded GEF locations, styled by file type
 * with a bigger red state for the selected file.
 */
function createMapStyle(): StyleSpecification {
  const basemapSources = Object.fromEntries(
    basemaps.map((definition) => [
      `basemap-${definition.id}`,
      {
        type: "raster" as const,
        tiles: [definition.tiles],
        tileSize: 256,
        maxzoom: 19,
        attribution: definition.attribution,
      },
    ]),
  );

  const basemapLayers: StyleSpecification["layers"] = basemaps.map(
    (definition) => ({
      id: `basemap-${definition.id}`,
      type: "raster",
      source: `basemap-${definition.id}`,
      layout: {
        visibility: definition.id === defaultBasemapId ? "visible" : "none",
      },
    }),
  );

  return {
    version: 8,
    sources: {
      ...basemapSources,
      locations: {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      },
    },
    layers: [
      ...basemapLayers,
      {
        id: locationsLayerId,
        type: "circle",
        source: "locations",
        layout: {
          "circle-sort-key": ["case", ["get", "selected"], 1, 0],
        },
        paint: {
          "circle-color": [
            "case",
            ["get", "selected"],
            selectedColor,
            [
              "match",
              ["get", "fileType"],
              "CPT",
              typeColors.CPT,
              "DISS",
              typeColors.DISS,
              typeColors.BORE,
            ],
          ],
          "circle-opacity": 0.8,
          "circle-radius": ["case", ["get", "selected"], 10, 8],
          "circle-stroke-width": ["case", ["get", "selected"], 3, 2],
          "circle-stroke-color": "#ffffff",
        },
      },
    ],
  };
}

interface LocationInfo {
  filename: string;
  fileType: string;
  lat: number;
  lon: number;
  x: number | undefined;
  y: number | undefined;
  coordinateSystem: string | null;
}

function locationsToGeoJSON(
  locations: Array<LocationInfo>,
  selectedFileName: string | null,
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: locations.map((loc) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [loc.lon, loc.lat] },
      properties: {
        filename: loc.filename,
        fileType: loc.fileType,
        coordinateSystem: loc.coordinateSystem,
        x: loc.x,
        y: loc.y,
        lat: loc.lat,
        lon: loc.lon,
        selected: loc.filename === selectedFileName,
      },
    })),
  };
}

function popupHtml(
  properties: Record<string, unknown>,
  unknownCoordSystem: string,
): string {
  const coordSystem =
    typeof properties.coordinateSystem === "string"
      ? properties.coordinateSystem
      : unknownCoordSystem;
  const x = Number(properties.x);
  const y = Number(properties.y);
  const lat = Number(properties.lat);
  const lon = Number(properties.lon);

  const originalLine =
    Number.isFinite(x) && Number.isFinite(y)
      ? `${coordSystem}: ${x.toFixed(2)}, ${y.toFixed(2)}<br/>`
      : "";

  return `
    <div class="text-xs">
      <strong>${String(properties.filename)}</strong><br/>
      ${originalLine}
      Lat/Lng: ${lat.toFixed(6)}, ${lon.toFixed(6)}
    </div>
  `;
}

export function GefMap({
  gefData,
  selectedFileName,
  onMarkerClick,
}: GefMapProps) {
  if (typeof window === "undefined") {
    throw new Error("GefMap should only render on the client.");
  }

  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const knownFilenamesRef = useRef<Set<string>>(new Set());
  const [styleReady, setStyleReady] = useState(false);
  const [basemap, setBasemap] = useState<BasemapId>(defaultBasemapId);
  // Created once per component instance; the map effect attaches them.
  // React renders the search box and basemap panel into their elements
  // via `createPortal`.
  const [searchControl] = useState(() => new PortalControl());
  const [panelControl] = useState(() => new PortalControl());

  const markerClick = useEffectEvent(onMarkerClick);

  // Extract located GEF files, flattening the nested location sub-object
  // into the flat shape the map layers consume.
  const locations: Array<LocationInfo> = useMemo(
    () =>
      Object.values(gefData)
        .map((data) => data.processed)
        .flatMap((meta) => {
          const location = meta.location;
          const wgs84 = location?.wgs84;
          if (!location || !wgs84) {
            return [];
          }
          // 0,0 source coordinates are a placeholder (privacy or simply
          // not filled in); treat the file as having no location rather
          // than plotting the projected origin (somewhere in France).
          if (location.originalX === 0 && location.originalY === 0) {
            return [];
          }
          return [
            {
              filename: meta.filename,
              fileType: meta.fileType,
              lat: wgs84.lat,
              lon: wgs84.lon,
              x: location.originalX,
              y: location.originalY,
              coordinateSystem: location.coordinateSystem?.name ?? null,
            },
          ];
        }),
    [gefData],
  );

  const geojson = useMemo(
    () => locationsToGeoJSON(locations, selectedFileName),
    [locations, selectedFileName],
  );

  const hasLocations = locations.length > 0;

  // Map instance lifecycle; the container div only exists while there
  // are located files, so the map is created/destroyed with it.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const map = new MaplibreMap({
      container,
      style: createMapStyle(),
      bounds: initialBounds,
      maxZoom: 18,
    });

    void map.once("load", () => {
      setStyleReady(true);
    });

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new ScaleControl({ unit: "metric" }), "bottom-left");

    map.addControl(searchControl, "top-left");
    map.addControl(panelControl, "top-left");

    mapRef.current = map;

    return () => {
      setStyleReady(false);
      knownFilenamesRef.current = new Set();
      map.remove();
      mapRef.current = null;
    };
  }, [hasLocations, searchControl, panelControl]);

  // Basemap selection: toggle visibility of the raster layers that are
  // all part of the style. The initial state matches the style
  // defaults, so nothing needs to happen before the style has loaded.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReady) {
      return;
    }
    for (const definition of basemaps) {
      map.setLayoutProperty(
        `basemap-${definition.id}`,
        "visibility",
        definition.id === basemap ? "visible" : "none",
      );
    }
  }, [styleReady, basemap]);

  // Hover popup, pointer cursor, and click-to-select. The click handler
  // is an effect event so the listeners never need re-binding.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const popup = new Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: "260px",
    });

    const queryFeatures = (event: MapMouseEvent) =>
      map.queryRenderedFeatures(event.point, { layers: [locationsLayerId] });

    const handleClick = (event: MapMouseEvent) => {
      const feature = queryFeatures(event)[0];
      if (feature) {
        markerClick(String(feature.properties.filename));
      }
    };

    const handleMousemove = (event: MapMouseEvent) => {
      const feature = queryFeatures(event)[0];
      map.getCanvas().style.cursor = feature ? "pointer" : "";

      if (!feature) {
        popup.remove();
        return;
      }

      popup
        .setLngLat(event.lngLat)
        .setHTML(popupHtml(feature.properties, t("unknownCoordinateSystem")))
        .addTo(map);
    };

    const handleMouseout = () => {
      popup.remove();
    };

    map.on("click", handleClick);
    map.on("mousemove", handleMousemove);
    map.on("mouseout", handleMouseout);

    return () => {
      popup.remove();
      map.off("click", handleClick);
      map.off("mousemove", handleMousemove);
      map.off("mouseout", handleMouseout);
    };
  }, [hasLocations, t]);

  // Keep the GeoJSON source in sync with the loaded files and fit the
  // view when files are added outside the current view.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReady) {
      return;
    }

    map.getSource<GeoJSONSource>("locations")?.setData(geojson);

    const known = knownFilenamesRef.current;
    const added = locations.filter((loc) => !known.has(loc.filename));
    knownFilenamesRef.current = new Set(locations.map((loc) => loc.filename));

    const bounds = map.getBounds();
    const outsideView = added.some(
      (loc) => !bounds.contains([loc.lon, loc.lat]),
    );

    if (outsideView && locations.length > 0) {
      const fitBounds = new LngLatBounds();
      for (const loc of locations) {
        fitBounds.extend([loc.lon, loc.lat]);
      }
      map.fitBounds(fitBounds, { padding: 50, maxZoom: 14, duration: 400 });
    }
  }, [styleReady, geojson, locations]);

  if (!hasLocations) {
    return (
      <div className="w-full h-96 rounded-sm border border-gray-300 bg-gray-50 flex items-center justify-center">
        <span className="text-gray-500">{t("noLocationData")}</span>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="w-full h-96 rounded-sm border border-gray-300"
      />
      {createPortal(<SearchBox mapRef={mapRef} />, searchControl.element)}
      {createPortal(
        <BasemapPanel value={basemap} onChange={setBasemap} />,
        panelControl.element,
      )}
    </>
  );
}

/**
 * Basemap picker rendered into the map via `PortalControl`:
 * conventional circle-and-dot radio buttons, one per basemap.
 */
function BasemapPanel({
  value,
  onChange,
}: {
  value: BasemapId;
  onChange: (id: BasemapId) => void;
}) {
  const { t } = useTranslation();

  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      aria-label={t("mapBasemapLabel")}
      className="rounded-sm border border-gray-300 bg-white/90 px-2 py-1.5 text-xs space-y-0.5"
    >
      {basemaps.map((definition) => (
        <RadioField key={definition.id} value={definition.id}>
          <RadioButton className="group flex cursor-pointer items-center gap-1.5">
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 transition-colors group-hover:border-gray-400 group-data-selected:border-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 opacity-0 transition-opacity group-data-selected:opacity-100" />
            </span>
            {t(definition.labelKey)}
          </RadioButton>
        </RadioField>
      ))}
    </RadioGroup>
  );
}
