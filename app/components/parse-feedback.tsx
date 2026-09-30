import type { GefData, GefWarning } from "@bedrock-engineer/gef-parser";
import { usePostHog } from "@posthog/react";
import type { TFunction } from "i18next";
import { ChevronDownIcon } from "lucide-react";
import {
  Button,
  Disclosure,
  DisclosurePanel,
  Heading,
} from "react-aria-components";
import { useTranslation } from "react-i18next";

export interface ParseFailure {
  name: string;
  reason:
    | "sieveTestNotSupported"
    | "unsupportedFileType"
    | "invalidValues"
    | "unknown";
  fields: Array<string>;
  details: string;
}

const MAX_LISTED_FIELDS = 5;
const MAX_LISTED_RECORD_WARNINGS = 20;
// Above this share of records with errors, the plots are not usable.
const UNREADABLE_RECORD_RATIO = 0.5;

type RecordWarning = Extract<GefWarning, { record: number }>;
type RecordWarningType = RecordWarning["type"];

const RECORD_WARNING_TYPES: ReadonlySet<GefWarning["type"]> =
  new Set<RecordWarningType>([
    "invalidNumber",
    "missingColumnTextHeader",
    "missingColumns",
    "extraColumns",
    "invalidDepth",
    "invertedDepth",
  ]);

function isRecordWarning(warning: GefWarning): warning is RecordWarning {
  return RECORD_WARNING_TYPES.has(warning.type);
}

interface ValidationIssue {
  path: Array<unknown>;
}

function isValidationIssueList(
  value: unknown,
): value is Array<ValidationIssue> {
  return (
    Array.isArray(value) &&
    value.every(
      (issue: unknown) =>
        typeof issue === "object" &&
        issue !== null &&
        "path" in issue &&
        Array.isArray(issue.path),
    )
  );
}

// A raw zod error (thrown from inside a nested schema) has a JSON dump of
// its issues as message.
function getValidationIssues(
  reason: unknown,
): Array<ValidationIssue> | undefined {
  if (typeof reason === "object" && reason !== null && "issues" in reason) {
    return isValidationIssueList(reason.issues) ? reason.issues : undefined;
  }
  if (reason instanceof Error) {
    try {
      const parsed: unknown = JSON.parse(reason.message);
      return isValidationIssueList(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

// gef-parser formats header schema errors as one "#HEADER.0.1: message"
// line per issue.
const FORMATTED_ISSUE_PATTERN = /^#([^.:\s]+)[^:]*: /;
const ISSUE_MESSAGE_PATTERN = /invalid input|expected .+, received /i;

export function describeParseFailure(
  name: string,
  reason: unknown,
): ParseFailure {
  const details = reason instanceof Error ? reason.message : String(reason);

  if (details === "sieveTestNotSupported") {
    return { name, reason: "sieveTestNotSupported", fields: [], details };
  }
  if (details === "unsupportedGefFileType") {
    return { name, reason: "unsupportedFileType", fields: [], details };
  }

  const issues = getValidationIssues(reason);
  if (issues) {
    const fields = issues
      .map((issue) =>
        issue.path
          .filter((part): part is string => typeof part === "string")
          .join("."),
      )
      .filter((field) => field.length > 0);
    return {
      name,
      reason: "invalidValues",
      fields: [...new Set(fields)],
      details,
    };
  }

  const lines = details.split("\n");
  const fields = lines.flatMap((line) => {
    const header = FORMATTED_ISSUE_PATTERN.exec(line)?.[1];
    return header ? [`#${header}`] : [];
  });
  if (
    fields.length > 0 ||
    lines.some((line) => ISSUE_MESSAGE_PATTERN.test(line))
  ) {
    return {
      name,
      reason: "invalidValues",
      fields: [...new Set(fields)],
      details,
    };
  }

  return { name, reason: "unknown", fields: [], details };
}

function formatList(items: Array<string>): string {
  const listed = items.slice(0, MAX_LISTED_FIELDS).join(", ");
  return items.length > MAX_LISTED_FIELDS ? `${listed}, …` : listed;
}

function translateParseFailure(failure: ParseFailure, t: TFunction): string {
  switch (failure.reason) {
    case "sieveTestNotSupported":
      return t("sieveTestNotSupported");
    case "unsupportedFileType":
      return t("parseErrorUnsupportedFileType");
    case "invalidValues":
      return failure.fields.length > 0
        ? t("parseErrorInvalidValuesIn", {
            fields: formatList(failure.fields),
          })
        : t("parseErrorInvalidValues");
    case "unknown":
      return t("parseErrorUnknown");
    default: {
      failure.reason satisfies never;
      return failure.details;
    }
  }
}

function TechnicalDetails({ details }: { details: string }) {
  const { t } = useTranslation();

  return (
    <Disclosure className="group/details mt-1">
      <Button
        slot="trigger"
        className="flex items-center gap-1 text-xs underline"
      >
        <ChevronDownIcon
          size={12}
          className="transition-transform group-data-[expanded]/details:rotate-180"
        />
        {t("showTechnicalDetails")}
      </Button>
      <DisclosurePanel>
        <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs bg-white/60 p-2 rounded-sm">
          {details}
        </pre>
      </DisclosurePanel>
    </Disclosure>
  );
}

function ReportFileLinks({
  context,
}: {
  context: "failedToParse" | "unreadableDataBlock";
}) {
  const { t } = useTranslation();
  const posthog = usePostHog();

  function captureReport(channel: "github" | "email") {
    posthog.capture("parse_error_report_clicked", { channel, context });
  }

  return (
    <p className="text-sm mt-3">
      {t("parseErrorReportPrompt")}{" "}
      <a
        href="https://github.com/bedrock-engineer/gef-app/issues"
        target="_blank"
        rel="noreferrer"
        className="underline font-medium"
        onClick={() => {
          captureReport("github");
        }}
      >
        {t("parseErrorReportIssue")}
      </a>{" "}
      {t("or")}{" "}
      <a
        href="mailto:jules.blom@bedrock.engineer?subject=GEF%20Viewer%3A%20file%20fails%20to%20parse"
        className="underline font-medium"
        onClick={() => {
          captureReport("email");
        }}
      >
        {t("parseErrorReportEmail")}
      </a>
      .
    </p>
  );
}

export function FailedFilesPanel({
  failedFiles,
}: {
  failedFiles: Array<ParseFailure>;
}) {
  const { t } = useTranslation();

  return (
    <Disclosure className="mb-4 p-4 bg-red-50 border border-red-200 rounded-sm group">
      <Heading level={2}>
        <Button
          slot="trigger"
          className="flex items-center gap-1 text-red-800 font-semibold w-full"
        >
          <ChevronDownIcon
            size={16}
            className="transition-transform group-data-[expanded]:rotate-180"
          />
          {t("failedToParse", { count: failedFiles.length })}
        </Button>
      </Heading>

      <DisclosurePanel className="text-red-700">
        <ul className="space-y-2 mt-2">
          {failedFiles.map((failure) => (
            <li key={failure.name} className="text-sm">
              <span className="font-medium">{failure.name}</span>:{" "}
              {translateParseFailure(failure, t)}
              {failure.reason !== "sieveTestNotSupported" && (
                <TechnicalDetails details={failure.details} />
              )}
            </li>
          ))}
        </ul>
        <ReportFileLinks context="failedToParse" />
      </DisclosurePanel>
    </Disclosure>
  );
}

function translateRecordWarningGroup(
  warningType: RecordWarningType,
  warnings: Array<RecordWarning>,
  t: TFunction,
): string {
  const count = warnings.length;
  switch (warningType) {
    case "invalidNumber": {
      const columns = [
        ...new Set(
          warnings.flatMap((warning) =>
            warning.type === "invalidNumber" ? [warning.column] : [],
          ),
        ),
      ];
      return t("warningGroupInvalidNumber", {
        count,
        columns: formatList(columns),
      });
    }
    case "missingColumnTextHeader":
      return t("warningGroupMissingColumnTextHeader", { count });
    case "missingColumns":
      return t("warningGroupMissingColumns", { count });
    case "extraColumns":
      return t("warningGroupExtraColumns", { count });
    case "invalidDepth":
      return t("warningGroupInvalidDepth", { count });
    case "invertedDepth":
      return t("warningGroupInvertedDepth", { count });
    default: {
      warningType satisfies never;
      return "";
    }
  }
}

function countRecords(file: GefData, badDepthRecords: number): number {
  switch (file.fileType) {
    case "CPT":
    case "DISS":
      return file.data.length;
    case "BORE":
      // The parser drops layers with a bad depth, so add them back.
      return file.layers.length + badDepthRecords;
    default: {
      file satisfies never;
      return 0;
    }
  }
}

export function WarningsPanel({
  file,
  translateWarning,
}: {
  file: GefData;
  translateWarning: (warning: GefWarning, t: TFunction) => string;
}) {
  const { t } = useTranslation();

  const fileWarnings = file.warnings.filter(
    (warning) => !isRecordWarning(warning),
  );
  const recordWarningGroups = new Map<
    RecordWarningType,
    Array<RecordWarning>
  >();
  for (const warning of file.warnings) {
    if (isRecordWarning(warning)) {
      const group = recordWarningGroups.get(warning.type) ?? [];
      group.push(warning);
      recordWarningGroups.set(warning.type, group);
    }
  }

  const badRecords = new Set(
    [...recordWarningGroups.values()].flat().map((warning) => warning.record),
  ).size;
  const badDepthRecords = new Set(
    [
      ...(recordWarningGroups.get("invalidDepth") ?? []),
      ...(recordWarningGroups.get("invertedDepth") ?? []),
    ].map((warning) => warning.record),
  ).size;
  const totalRecords = countRecords(file, badDepthRecords);
  const isUnreadable =
    totalRecords > 0 && badRecords / totalRecords > UNREADABLE_RECORD_RATIO;

  return (
    <>
      {isUnreadable && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-sm text-red-800"
        >
          <p className="font-semibold">{t("unreadableDataBlockTitle")}</p>
          <p className="text-sm mt-1">
            {t("unreadableDataBlockBody", {
              bad: badRecords,
              total: totalRecords,
            })}
          </p>
          <ReportFileLinks context="unreadableDataBlock" />
        </div>
      )}

      <Disclosure className="p-4 bg-amber-50 border border-amber-200 rounded-sm group">
        <Heading level={2}>
          <Button
            slot="trigger"
            className="flex items-center gap-1 text-amber-800 font-semibold w-full"
          >
            <ChevronDownIcon
              size={16}
              className="transition-transform group-data-[expanded]:rotate-180"
            />
            {t("warning", { count: file.warnings.length })}
          </Button>
        </Heading>

        <DisclosurePanel>
          <ul className="space-y-1 mt-2 text-sm text-amber-700">
            {fileWarnings.map((warning, i) => (
              <li key={i}>{translateWarning(warning, t)}</li>
            ))}
            {[...recordWarningGroups].map(([type, warnings]) => (
              <li key={type}>
                {translateRecordWarningGroup(type, warnings, t)}
                <Disclosure className="group/records mt-1">
                  <Button
                    slot="trigger"
                    className="flex items-center gap-1 text-xs underline"
                  >
                    <ChevronDownIcon
                      size={12}
                      className="transition-transform group-data-[expanded]/records:rotate-180"
                    />
                    {t("showAffectedRecords")}
                  </Button>
                  <DisclosurePanel>
                    <ul className="list-disc ml-5 mt-1 space-y-0.5 text-xs">
                      {warnings
                        .slice(0, MAX_LISTED_RECORD_WARNINGS)
                        .map((warning, i) => (
                          <li key={i}>{translateWarning(warning, t)}</li>
                        ))}
                    </ul>
                    {warnings.length > MAX_LISTED_RECORD_WARNINGS && (
                      <p className="text-xs mt-1">
                        {t("moreRecordWarnings", {
                          count: warnings.length - MAX_LISTED_RECORD_WARNINGS,
                        })}
                      </p>
                    )}
                  </DisclosurePanel>
                </Disclosure>
              </li>
            ))}
          </ul>
        </DisclosurePanel>
      </Disclosure>
    </>
  );
}
