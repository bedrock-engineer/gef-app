import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { GefBoreData } from "@bedrock-engineer/gef-parser";
import { type ProcessedMetadata } from "@bedrock-engineer/gef-parser";
import { CardTitle } from "./card";
import {
  filterMeasurementsByCategories,
  filterMeasurementTextsByCategories,
  getCalculationsInfo,
  getComments,
  getConditionsInfo,
  getFileMetadata,
  getProcessingInfo,
  countryCodeTranslationMap,
  type HeaderItem,
} from "./common-header-items";
import {
  CompactHeaderLeftColumn,
  CompactHeaderRightColumn,
  HeaderDisclosurePanels,
  type HeaderSection,
} from "./gef-header-display";

function BoreCompactInfo({ data }: { data: GefBoreData }) {
  const { t } = useTranslation();
  const { processed } = data;

  const boringDate = processed.texts.datumBoring?.value; // MEASUREMENTTEXT ID 16 = "Datum boring"
  const placeName = processed.texts.plaatsUitvoering?.value; // MEASUREMENTTEXT ID 3 = "Plaats uitvoering"
  const drillingCompany = processed.texts.boorfirma?.value; // MEASUREMENTTEXT ID 13 = "Boorfirma"
  const finalDepth = processed.measurements.einddiepte; // MEASUREMENTVAR ID 16 = "Einddiepte"

  if (!boringDate && !placeName && !drillingCompany && !finalDepth) {
    return null;
  }

  return (
    <>
      {boringDate && (
        <>
          <dt className="text-gray-500">{t("boringDate")}</dt>
          <dd>{boringDate}</dd>
        </>
      )}
      {placeName && (
        <>
          <dt className="text-gray-500">{t("placeName")}</dt>
          <dd>{placeName}</dd>
        </>
      )}
      {drillingCompany && (
        <>
          <dt className="text-gray-500">{t("drillingCompany")}</dt>
          <dd>{drillingCompany}</dd>
        </>
      )}
      {finalDepth && (
        <>
          <dt className="text-gray-500">{t("depth")}</dt>
          <dd>{finalDepth.value}m</dd>
        </>
      )}
    </>
  );
}

interface CompactBoreHeaderProps {
  filename: string;
  data: GefBoreData;
}

export function CompactBoreHeader({ filename, data }: CompactBoreHeaderProps) {
  const { processed } = data;

  return (
    <div className="bg-white border border-gray-300 rounded-sm p-4 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
        <CompactHeaderLeftColumn filename={filename} data={data} />

        <CompactHeaderRightColumn processed={processed}>
          <BoreCompactInfo data={data} />
        </CompactHeaderRightColumn>
      </div>
    </div>
  );
}

function getBoreProjectInfo(
  processed: ProcessedMetadata,
  t: TFunction,
  locale: string,
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];

  if (processed.projectId) {
    items.push({ label: t("projectId"), value: processed.projectId });
  }
  if (processed.testId) {
    items.push({ label: t("testId"), value: processed.testId });
  }

  if (processed.companyName) {
    items.push({ label: t("company"), value: processed.companyName });
  }

  if (processed.companyAddress) {
    items.push({ label: t("address"), value: processed.companyAddress });
  }

  if (processed.companyCountryCode) {
    const countryKey =
      countryCodeTranslationMap[
        processed.companyCountryCode as keyof typeof countryCodeTranslationMap
      ];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (countryKey) {
      items.push({
        label: t("country"),
        value: t(countryKey),
      });
    }
  }

  const measurementTextItems = filterMeasurementTextsByCategories(
    processed,
    [
      "project_info",
      "standards",
      "location",
      "personnel",
      "data_management",
      "related_investigations",
    ],
    locale,
  );

  return items.concat(measurementTextItems);
}

function getBoreTestInfo(
  processed: ProcessedMetadata,
  t: TFunction,
  locale: string,
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];

  if (processed.startDate) {
    items.push({
      label: t("startDate"),
      value: processed.startDate,
    });
  }

  if (processed.startTime) {
    items.push({
      label: t("startTime"),
      value: processed.startTime,
    });
  }

  items.push(
    ...filterMeasurementsByCategories(
      processed,
      ["test_type", "test_execution", "site_conditions"],
      locale,
    ),
  );

  return items;
}

function getBoreCoordinatesInfo(
  processed: ProcessedMetadata,
  t: TFunction,
  locale: string,
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];

  items.push(
    ...filterMeasurementTextsByCategories(
      processed,
      [
        "coordinates",
        "reference_system",
        "elevation_determination",
        "position_determination",
      ],
      locale,
    ),
  );

  if (processed.coordinateSystem) {
    items.push({
      label: t("coordinateSystem"),
      value: `${processed.coordinateSystem.name} ${processed.coordinateSystem.epsg}`,
    });

    if (
      processed.originalX !== undefined &&
      processed.xUncertainty !== undefined
    ) {
      items.push({
        label: t("xCoordinate"),
        value: `${processed.originalX} m ± ${processed.xUncertainty}`,
      });
    }

    if (
      processed.originalY !== undefined &&
      processed.yUncertainty !== undefined
    ) {
      items.push({
        label: t("yCoordinate"),
        value: `${processed.originalY} m ± ${processed.yUncertainty}`,
      });
    }
  }

  if (processed.heightSystem) {
    items.push({
      label: t("heightSystem"),
      value: processed.heightSystem.name,
    });

    if (
      processed.surfaceElevation !== undefined &&
      processed.elevationUncertainty !== undefined
    ) {
      items.push({
        label: t("surfaceLevel"),
        value: `${processed.surfaceElevation} m ± ${processed.elevationUncertainty}`,
      });
    }
  }

  return items;
}

function getBoreEquipmentInfo(
  processed: ProcessedMetadata,
  locale: string,
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];

  items.push(
    ...filterMeasurementTextsByCategories(
      processed,
      [
        "equipment",
        "drilling_methods",
        "drilling_equipment",
        "drilling_segments",
      ],
      locale,
    ),
  );

  items.push(
    ...filterMeasurementsByCategories(
      processed,
      [
        "equipment",
        "capabilities",
        "drilling_equipment",
        "drilling_segments",
        "borehole_geometry",
        "groundwater",
        "monitoring_wells",
      ],
      locale,
    ),
  );

  return items;
}

interface DetailedBoreHeadersProps {
  data: GefBoreData;
}

export function DetailedBoreHeaders({ data }: DetailedBoreHeadersProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { processed } = data;

  const allSections: Array<HeaderSection> = [
    // BORE-specific sections
    {
      id: "project",
      title: t("projectInformation"),
      items: getBoreProjectInfo(processed, t, locale),
    },
    {
      id: "test_info",
      title: t("testInformation"),
      items: getBoreTestInfo(processed, t, locale),
    },
    {
      id: "coordinates",
      title: t("coordinatesLocation"),
      items: getBoreCoordinatesInfo(processed, t, locale),
    },
    {
      id: "equipment",
      title: t("equipmentCapabilities"),
      items: getBoreEquipmentInfo(processed, locale),
    },
    // Shared sections using generic utilities
    {
      id: "conditions",
      title: t("testConditionsRemarks"),
      items: getConditionsInfo(processed, locale),
    },
    {
      id: "processing",
      title: t("dataProcessing"),
      items: getProcessingInfo(processed, locale),
    },
    {
      id: "calculations",
      title: t("calculationsFormulas"),
      items: getCalculationsInfo(processed, locale),
    },
    {
      id: "metadata",
      title: t("fileMetadata"),
      items: getFileMetadata(processed, t),
    },
    {
      id: "comments",
      title: t("comments"),
      items: getComments(processed, t),
    },
    // BORE-specific sections can be added here in the future
  ].filter((section) => section.items.length > 0);

  return (
    <div className="space-y-2">
      <CardTitle>{t("technicalDetails")}</CardTitle>

      <HeaderDisclosurePanels sections={allSections} />
    </div>
  );
}
