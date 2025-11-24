import { DownloadIcon } from "lucide-react";
import { Button } from "react-aria-components";
import type { GefData, ProcessedMetadata } from "~/util/gef-cpt";
import { getMeasurementVarValue } from "~/util/gef-common";
import type { Feature, FeatureCollection } from "geojson";
import { useTranslation } from "react-i18next";

function createGeoJSON(gefData: Record<string, GefData>): FeatureCollection {
  const features: Array<Feature> = Object.values(gefData)
    .filter(
      (
        data
      ): data is GefData & {
        processed: ProcessedMetadata & {
          wgs84: NonNullable<ProcessedMetadata["wgs84"]>;
        };
      } => data.processed.wgs84 !== null
    )
    .map((data) => {
      const meta = data.processed;
      const measurementVars = data.headers.MEASUREMENTVAR ?? [];
      const finalDepth = getMeasurementVarValue(measurementVars, 16) ?? null;

      return {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [meta.wgs84.lon, meta.wgs84.lat],
        },
        properties: {
          filename: meta.filename,
          fileType: meta.fileType,
          projectId: meta.projectId,
          testId: meta.testId,
          companyName: meta.companyName,
          startDate: meta.startDate,
          startTime: meta.startTime,
          surfaceElevation: meta.surfaceElevation,
          heightSystem: meta.heightSystem?.name,
          heightSystemEpsg: meta.heightSystem?.epsg,
          coordinateSystem: meta.coordinateSystem?.name,
          epsg: meta.coordinateSystem?.epsg,
          easting: meta.originalX,
          northing: meta.originalY,
          finalDepth,
        },
      };
    });

  return {
    type: "FeatureCollection" as const,
    features,
  };
}

function downloadAsGeoJSON(gefData: Record<string, GefData>) {
  const geojson = createGeoJSON(gefData);
  const blob = new Blob([JSON.stringify(geojson, null, 2)], {
    type: "application/geo+json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gef-locations.geojson";
  a.click();
  URL.revokeObjectURL(url);
}

interface DownloadGeoJSONButtonProps {
  gefData: Record<string, GefData>;
}

export function DownloadGeoJSONButton({ gefData }: DownloadGeoJSONButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      className="button mt-2 ml-auto"
      onPress={() => {
        downloadAsGeoJSON(gefData);
      }}
      isDisabled={Object.keys(gefData).length === 0}
    >
      {t("downloadLocationsGeoJson")} <DownloadIcon size={14} />{" "}
    </Button>
  );
}
