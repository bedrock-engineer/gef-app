import type { GefData, ProcessedMetadata } from "@bedrock-engineer/gef-parser";
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
import { downloadGefDataAsCsv } from "~/util/csv-download";
import { downloadGefDataAsJson } from "~/util/json-download";
import { type HeaderItem } from "./common-header-items";
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

export function CompactHeaderRightColumn({
  processed,
  children,
}: CompactHeaderRightColumnProps) {
  const { t } = useTranslation();

  const dateTimeStr =
    processed.startDate && processed.startTime
      ? `${processed.startDate} ${processed.startTime}`
      : processed.startDate;

  const elevationValue = processed.surfaceElevation ?? null;
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
              {processed.originalX}, {processed.originalY}
              <CopyButton
                value={`${processed.originalX}, ${processed.originalY}`}
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
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,520px))] gap-4 items-start">
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

          <DisclosurePanel className="bg-white">
            <dl className="space-y-2 p-4 overflow-x-auto">
              {section.items.map((item, index) => (
                <div
                  key={index}
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
export const HeaderContainer = ({ children }: { children: ReactNode }) => (
  <div className="bg-white border border-gray-300 rounded-sm p-4 mb-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
      {children}
    </div>
  </div>
);
