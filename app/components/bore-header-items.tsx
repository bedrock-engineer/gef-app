import type { GefBoreData, ProcessedMetadata } from "@bedrock-engineer/gef-parser";
import { useTranslation } from "react-i18next";
import { CardTitle } from "./card";
import {
  filterMeasurementsByCategories,
  filterMeasurementTextsByCategories,
  getCalculationsInfo,
  getComments,
  getConditionsInfo,
  getCoordinatesInfo,
  getFileMetadata,
  getProcessingInfo,
  getProjectInfo,
  getTestInfo,
  type HeaderItem,
} from "./common-header-items";
import {
  CompactHeaderLeftColumn,
  CompactHeaderRightColumn, HeaderContainer, HeaderDisclosurePanels,
  type HeaderSection
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
    <HeaderContainer>
      <CompactHeaderLeftColumn filename={filename} data={data} />

      <CompactHeaderRightColumn processed={processed}>
        <BoreCompactInfo data={data} />
      </CompactHeaderRightColumn>
    </HeaderContainer>
  );
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
      items: getProjectInfo(processed, t, locale),
    },
    {
      id: "test_info",
      title: t("testInformation"),
      items: getTestInfo(processed, t, locale),
    },
    {
      id: "coordinates",
      title: t("coordinatesLocation"),
      items: getCoordinatesInfo(processed, t, locale),
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
