import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { GefBoreData } from "../gef/gef-bore";
import { findBoreMeasurementVariable } from "../gef/gef-bore";
import { type ProcessedMetadata } from "../gef/gef-cpt";
import type { GefBoreHeaders } from "~/gef/gef-schemas";
import { CardTitle } from "./card";
import {
  countryCodeTranslationMap,
  formatNumericValue,
  getLocalizedDescription,
  type HeaderItem,
} from "./common-header-items";
import {
  CompactHeaderLeftColumn,
  CompactHeaderRightColumn,
  filterMeasurementTextsByCategories,
  getCalculationsInfo,
  getComments,
  getConditionsInfo,
  getFileMetadata,
  getProcessingInfo,
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
          <dd>{finalDepth.value.toFixed(2)}m</dd>
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
  headers: GefBoreHeaders,
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

  const company = headers.COMPANYID;
  if (company) {
    if (company.address) {
      items.push({ label: t("address"), value: company.address });
    }

    if (company.countryCode) {
      const countryKey =
        countryCodeTranslationMap[
          company.countryCode as keyof typeof countryCodeTranslationMap
        ];

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (countryKey) {
        items.push({
          label: t("country"),
          value: t(countryKey),
        });
      }
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
  headers: GefBoreHeaders,
  processed: ProcessedMetadata,
  t: TFunction,
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

  headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
    const varInfo = findBoreMeasurementVariable(id);

    if (
      varInfo &&
      ["test_type", "test_execution", "site_conditions"].includes(
        varInfo.category,
      )
    ) {
      let displayValue: string;

      if ("options" in varInfo) {
        const numValue = parseFloat(value);

        const option = (
          varInfo.options as ReadonlyArray<{ value: number; meaning: string }>
        ).find((o) => o.value === numValue);

        displayValue = option ? option.meaning : formatNumericValue(value);
      } else {
        displayValue = formatNumericValue(value);
      }

      items.push({
        label: varInfo.description,
        value: unit && unit !== "-" ? `${displayValue} ${unit}` : displayValue,
      });
    }
  });

  return items;
}

function getBoreCoordinatesInfo(
  headers: GefBoreHeaders,
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

    const xyid = headers.XYID;
    if (xyid) {
      items.push({
        label: t("xCoordinate"),
        value: `${xyid.x.toFixed()} m ± ${xyid.deltaX.toFixed(3)}`,
      });

      items.push({
        label: t("yCoordinate"),
        value: `${xyid.y.toFixed()} m ± ${xyid.deltaY.toFixed(3)}`,
      });
    }
  }

  if (processed.heightSystem) {
    items.push({
      label: t("heightSystem"),
      value: processed.heightSystem.name,
    });

    const zid = headers.ZID;
    if (zid) {
      items.push({
        label: t("surfaceLevel"),
        value: `${zid.height.toFixed()} m ± ${zid.deltaZ.toFixed(3)}`,
      });
    }
  }

  return items;
}

function getBoreEquipmentInfo(
  headers: GefBoreHeaders,
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

  headers.MEASUREMENTVAR?.forEach(({ id, value, unit }) => {
    const varInfo = findBoreMeasurementVariable(id);
    if (
      !varInfo ||
      ![
        "equipment",
        "capabilities",
        "drilling_equipment",
        "drilling_segments",
        "borehole_geometry",
        "groundwater",
        "monitoring_wells",
      ].includes(varInfo.category)
    ) {
      return;
    }

    let displayValue: string;
    if ("options" in varInfo) {
      const numValue = parseFloat(value);
      const option = (
        varInfo.options as ReadonlyArray<{ value: number; meaning: string }>
      ).find((o) => o.value === numValue);
      displayValue = option ? option.meaning : formatNumericValue(value);
    } else {
      displayValue = formatNumericValue(value);
    }

    items.push({
      label: getLocalizedDescription(varInfo, locale),
      value: unit && unit !== "-" ? `${displayValue} ${unit}` : displayValue,
    });
  });

  return items;
}

interface DetailedBoreHeadersProps {
  data: GefBoreData;
}

export function DetailedBoreHeaders({ data }: DetailedBoreHeadersProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { headers, processed } = data;

  const allSections: Array<HeaderSection> = [
    // BORE-specific sections
    {
      id: "project",
      title: t("projectInformation"),
      items: getBoreProjectInfo(headers, processed, t, locale),
    },
    {
      id: "test_info",
      title: t("testInformation"),
      items: getBoreTestInfo(headers, processed, t),
    },
    {
      id: "coordinates",
      title: t("coordinatesLocation"),
      items: getBoreCoordinatesInfo(headers, processed, t, locale),
    },
    {
      id: "equipment",
      title: t("equipmentCapabilities"),
      items: getBoreEquipmentInfo(headers, processed, locale),
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
      items: getFileMetadata(headers, t),
    },
    {
      id: "comments",
      title: t("comments"),
      items: getComments(headers, t),
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
