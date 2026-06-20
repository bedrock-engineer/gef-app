import type { Feature, FeatureCollection } from "geojson";
import { DownloadIcon } from "lucide-react";
import { Button } from "react-aria-components";
import { useTranslation } from "react-i18next";
import type { GefData } from "@bedrock-engineer/gef-parser";
import type { ProcessedMetadata } from "@bedrock-engineer/gef-parser";
import { downloadFile } from "~/util/download";

function createGeoJSON(gefData: Record<string, GefData>): FeatureCollection {
  const features: Array<Feature> = Object.values(gefData)
    .filter(
      (
        data,
      ): data is GefData & {
        processed: ProcessedMetadata & {
          location: NonNullable<ProcessedMetadata["location"]> & {
            wgs84: NonNullable<
              NonNullable<ProcessedMetadata["location"]>["wgs84"]
            >;
          };
        };
      } => data.processed.location?.wgs84 != null,
    )
    .map((data) => {
      const meta = data.processed;
      const { location, elevation, company } = meta;
      const finalDepth =
        meta.measurements.endDepthOfPenetrationTest?.value ?? null;

      return {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [location.wgs84.lon, location.wgs84.lat],
        },
        properties: {
          filename: meta.filename,
          fileType: meta.fileType,
          projectId: meta.projectId,
          testId: meta.testId,
          companyName: company?.name,
          startDate: meta.startDate,
          startTime: meta.startTime,
          surfaceElevation: elevation?.surfaceElevation,
          heightSystem: elevation?.heightSystem?.name,
          heightSystemEpsg: elevation?.heightSystem?.epsg,
          coordinateSystem: location.coordinateSystem?.name,
          epsg: location.coordinateSystem?.epsg,
          easting: location.originalX,
          northing: location.originalY,
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
  const geojsonString = JSON.stringify(geojson, null, 2);
  downloadFile(geojsonString, "gef-locations.geojson", "application/geo+json");
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
