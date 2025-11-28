import type { TFunction } from "i18next";
import { DownloadIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Button,
  Disclosure,
  DisclosurePanel,
  Heading,
  Tooltip,
  TooltipTrigger,
} from "react-aria-components";
import { useTranslation } from "react-i18next";
import type { GefData } from "~/gef/gef-common";
import type { GefBoreHeaders, GefCptHeaders } from "~/gef/gef-schemas";
import { downloadGefDataAsCsv } from "~/util/csv-download";
import { downloadGefDataAsJson } from "~/util/json-download";
import type { ProcessedMetadata } from "../gef/gef-cpt";
import { formatGefDate } from "../gef/gef-metadata-processed";
import {
  getLocalizedDescription,
  type HeaderItem,
} from "./common-header-items";
import { CopyButton } from "./copy-button";

interface CompactHeaderLeftColumnProps {
  filename: string;
  data: GefData;
}

export function CompactHeaderLeftColumn({
  filename,
  data,
}: CompactHeaderLeftColumnProps) {
  const { t } = useTranslation();
  const { processed } = data;

  return (
    <div>
      <div className="font-bold text-lg text-gray-900 flex items-center gap-1">
        {processed.testId ?? t("unknownTest")}
        {processed.testId && (
          <CopyButton value={processed.testId} label={t("copyTestId")} />
        )}
      </div>

      <p className="text-gray-600 mb-2">{filename}</p>

      {(processed.projectId ?? processed.companyName) && (
        <dl className="text-sm space-y-1">
          {processed.projectId && (
            <div className="flex items-center gap-1">
              <dt className="text-gray-500">{t("projectId")}:</dt>
              <dd className="text-gray-700">{processed.projectId}</dd>
            </div>
          )}
          {processed.companyName && (
            <div className="flex items-center gap-1">
              <dt className="text-gray-500">{t("company")}:</dt>
              <dd className="text-gray-700">{processed.companyName}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="flex gap-2 mt-4">
        <DownloadButton
          onPress={() => {
            downloadGefDataAsCsv(data, filename);
          }}
          label={t("downloadCsv")}
          tooltip={t("downloadCsvTooltip")}
        />

        <DownloadButton
          onPress={() => {
            downloadGefDataAsJson(data, filename);
          }}
          label={t("downloadJson")}
          tooltip={t("downloadJsonTooltip")}
        />
      </div>
    </div>
  );
}

interface CompactHeaderRightColumnProps {
  processed: ProcessedMetadata;
  children?: ReactNode;
}

// Shared right column: date, coordinates, elevation + slot for type-specific content
export function CompactHeaderRightColumn({
  processed,
  children,
}: CompactHeaderRightColumnProps) {
  const { t } = useTranslation();

  const dateTimeStr =
    processed.startDate && processed.startTime
      ? `${processed.startDate} ${processed.startTime}`
      : processed.startDate;

  const elevationValue = processed.surfaceElevation?.toFixed(2) ?? null;
  const elevationDisplay = elevationValue
    ? `${elevationValue}m ${processed.heightSystem?.name}`
    : null;

  return (
    <dl
      className="text-gray-700 space-y-1 grid gap-x-2"
      style={{ gridTemplateColumns: "auto 1fr" }}
    >
      {dateTimeStr && (
        <>
          <dt className="text-gray-500">{t("date")}</dt>
          <dd className="flex items-center gap-1">
            {dateTimeStr}
            <CopyButton value={dateTimeStr} label={t("copyDate")} />
          </dd>
        </>
      )}

      {processed.coordinateSystem && (
        <>
          <dt className="text-gray-500">{t("locationLabel")}</dt>
          <dd>
            <div>
              <span className="font-semibold">
                {processed.coordinateSystem.name}
              </span>
              <span className="text-gray-400 text-sm">
                {" "}
                ({processed.coordinateSystem.epsg})
              </span>
            </div>

            <div className="flex items-center gap-1">
              {processed.originalX?.toFixed(2)},{" "}
              {processed.originalY?.toFixed(2)}
              <CopyButton
                value={`${processed.originalX?.toFixed(2)}, ${processed.originalY?.toFixed(2)}`}
                label={t("copyCoordinates")}
              />
            </div>

            {processed.wgs84 && (
              <>
                <div className="mt-2">
                  <span className="font-semibold">WGS84</span>
                  <span className="text-gray-400 text-sm"> (EPSG:4326)</span>
                </div>
                <div className="flex items-center gap-1">
                  {processed.wgs84.lat.toFixed(6)},{" "}
                  {processed.wgs84.lon.toFixed(6)}
                  <CopyButton
                    value={`${processed.wgs84.lat.toFixed(6)}, ${processed.wgs84.lon.toFixed(6)}`}
                    label={t("copyWgs84")}
                  />
                </div>
              </>
            )}
          </dd>
        </>
      )}

      {elevationDisplay && (
        <>
          <dt className="text-gray-500">{t("groundLevel")}</dt>
          <dd className="flex items-center gap-1">
            {elevationDisplay}
            {elevationValue && (
              <CopyButton value={elevationValue} label={t("copyElevation")} />
            )}
          </dd>
        </>
      )}

      {children}
    </dl>
  );
}

interface DownloadButtonProps {
  onPress: () => void;
  label: string;
  tooltip: string;
}

function DownloadButton({ onPress, label, tooltip }: DownloadButtonProps) {
  return (
    <TooltipTrigger delay={0}>
      <Button onPress={onPress} className="button text-sm transition-colors">
        {label} <DownloadIcon size={14} />
      </Button>
      <Tooltip className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg">
        {tooltip}
      </Tooltip>
    </TooltipTrigger>
  );
}

export interface HeaderSection {
  id: string;
  title: string;
  items: Array<HeaderItem>;
}

interface HeaderDisclosurePanelsProps {
  sections: Array<HeaderSection>;
}

export function HeaderDisclosurePanels({
  sections,
}: HeaderDisclosurePanelsProps) {
  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-2 items-start">
      {sections.map((section) => (
        <Disclosure
          key={section.id}
          className="border border-gray-300 rounded-sm overflow-hidden"
        >
          <Heading>
            <Button
              slot="trigger"
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-100 flex items-center justify-between text-left transition-color"
            >
              <span className="font-medium text-gray-800">{section.title}</span>
              <span className="text-gray-500 data-expanded:hidden">+</span>
              <span className="text-gray-500 hidden data-expanded:inline">
                −
              </span>
            </Button>
          </Heading>

          <DisclosurePanel className=" bg-white">
            <dl className="space-y-2 p-4 overflow-x-auto">
              {section.items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[200px_1fr] gap-4 text-sm"
                >
                  <dt className="text-gray-600">{item.label}</dt>
                  <dd className="text-gray-900 font-mono text-xs">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </DisclosurePanel>
        </Disclosure>
      ))}
    </div>
  );
}

export function getFileMetadata(
  headers: GefBoreHeaders | GefCptHeaders,
  t: TFunction,
) {
  const items: Array<{ label: string; value: string }> = [];

  if (headers.GEFID) {
    items.push({
      label: t("gefVersion"),
      value: `${headers.GEFID.major}.${headers.GEFID.minor}.${headers.GEFID.patch}`,
    });
  }

  if (headers.REPORTCODE) {
    items.push({
      label: t("reportCode"),
      value: `${headers.REPORTCODE.code} v${headers.REPORTCODE.major}.${headers.REPORTCODE.minor}.${headers.REPORTCODE.patch}`,
    });
  }

  if (headers.MEASUREMENTCODE) {
    // If it has version info, show it; otherwise just show the code
    const hasVersion =
      headers.MEASUREMENTCODE.major > 0 ||
      headers.MEASUREMENTCODE.minor > 0 ||
      headers.MEASUREMENTCODE.patch > 0;
    const value = hasVersion
      ? `${headers.MEASUREMENTCODE.code} v${headers.MEASUREMENTCODE.major}.${headers.MEASUREMENTCODE.minor}.${headers.MEASUREMENTCODE.patch}`
      : headers.MEASUREMENTCODE.code;
    items.push({
      label: t("measurementCode"),
      value,
    });
  }

  if (headers.FILEDATE) {
    items.push({
      label: t("fileDate"),
      value: formatGefDate(headers.FILEDATE),
    });
  }

  if (headers.FILEOWNER) {
    items.push({ label: t("fileOwner"), value: headers.FILEOWNER });
  }
  if (headers.OS) {
    items.push({ label: t("operatingSystem"), value: headers.OS });
  }

  return items;
}

export function filterMeasurementTextsByCategories(
  processed: ProcessedMetadata,
  categories: Array<string>,
  locale: string,
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];

  for (const textItem of Object.values(processed.texts)) {
    if (!categories.includes(textItem.metadata.category)) {
      continue;
    }

    if (!textItem.value || textItem.value === "-" || textItem.value === "0") {
      continue;
    }

    if (textItem.metadata.category === "reserved") {
      continue;
    }

    const displayValue = textItem.decoded ?? textItem.value;

    items.push({
      label: getLocalizedDescription(textItem.metadata, locale),
      value: displayValue,
    });
  }

  return items;
}

export function getConditionsInfo(
  processed: ProcessedMetadata,
  locale: string,
) {
  return filterMeasurementTextsByCategories(
    processed,
    [
      "conditions",
      "general",
      "infrastructure",
      "measurements",
      "sample_condition",
      "monitoring_wells",
    ],
    locale,
  );
}

export function getProcessingInfo(
  processed: ProcessedMetadata,
  locale: string,
) {
  return filterMeasurementTextsByCategories(processed, ["processing"], locale);
}

export function getCalculationsInfo(
  processed: ProcessedMetadata,
  locale: string,
) {
  return filterMeasurementTextsByCategories(
    processed,
    ["calculations"],
    locale,
  );
}

export function getComments(
  headers: GefBoreHeaders | GefCptHeaders,
  t: TFunction,
) {
  const items: Array<HeaderItem> = [];

  if (headers.COMMENT && headers.COMMENT.length > 0) {
    headers.COMMENT.forEach((comment, index) => {
      items.push({
        label: `${t("comment")} ${index + 1}`,
        value: comment,
      });
    });
  }

  return items;
}
