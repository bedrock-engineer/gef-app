import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  FileDropItem,
  Selection,
  SortDescriptor,
} from "react-aria-components";
import {
  Cell,
  Column,
  DropZone,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "react-aria-components";
import { useTranslation } from "react-i18next";
import type { GefData, GefFileType } from "~/util/gef";
import { getMeasurementVarValue } from "~/util/gef-metadata";

function SortIndicator({ column, sortDescriptor }: { column: string; sortDescriptor: SortDescriptor }) {
  const isActive = sortDescriptor.column === column;
  const Icon = sortDescriptor.direction === "ascending" ? ChevronUpIcon : ChevronDownIcon;
  return <Icon size={14} className={`inline ml-1 ${isActive ? "" : "opacity-0"}`} />;
}

interface FileTableProps {
  gefData: Record<string, GefData>;
  selectedFileName: string;
  onSelectionChange: (filename: string) => void;
  onFileDrop: (files: Array<File>) => void;
}

interface FileRow {
  id: string;
  filename: string;
  testDate: string | null;
  type: GefFileType;
  finalDepth: number | null;
}

function formatDate(date: {
  year: number;
  month: number;
  day: number;
}): string {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export function FileTable({
  gefData,
  selectedFileName,
  onSelectionChange,
  onFileDrop,
}: FileTableProps) {
  const { t } = useTranslation();
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "filename",
    direction: "ascending",
  });

  const rows: Array<FileRow> = useMemo(() => {
    return Object.entries(gefData).map(([filename, data]) => {
      let testDate: string | null = null;
      let finalDepth: number | null = null;

      if (data.fileType === "BORE") {
        // For BORE files, use MEASUREMENTTEXT 16 (Datum boring)
        const datumBoring = data.headers.MEASUREMENTTEXT?.find(
          (mt) => mt.id === 16
        );
        if (datumBoring) {
          testDate = datumBoring.text;
        }
        // Get final depth from last layer
        if (data.layers.length > 0) {
          const lastLayer = data.layers[data.layers.length - 1];
          finalDepth = lastLayer?.depthBottom ?? null;
        }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (data.fileType === "CPT") {
        // For CPT files, use STARTDATE
        if (data.headers.STARTDATE) {
          testDate = formatDate(data.headers.STARTDATE);
        }
        // Get end depth from MEASUREMENTVAR 16
        const measurementVars = data.headers.MEASUREMENTVAR ?? [];
        finalDepth = getMeasurementVarValue(measurementVars, 16) ?? null;
      }

      return {
        id: filename,
        filename,
        testDate,
        type: data.fileType,
        finalDepth,
      };
    });
  }, [gefData]);

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      const column = sortDescriptor.column as keyof FileRow;
      let aVal = a[column];
      let bVal = b[column];

      // Handle null values
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      // Compare values
      let cmp: number;
      if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
    return sorted;
  }, [rows, sortDescriptor]);

  const selectedKeys: Selection = useMemo(() => {
    return selectedFileName ? new Set([selectedFileName]) : new Set();
  }, [selectedFileName]);

  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") return;
    const selected = Array.from(keys)[0];
    if (typeof selected === "string") {
      onSelectionChange(selected);
    }
  };

  const handleDrop = async (e: { items: ReadonlyArray<{ kind: string }> }) => {
    const fileItems = e.items.filter(
      (item): item is FileDropItem => item.kind === "file"
    );
    const files = await Promise.all(fileItems.map((item) => item.getFile()));
    onFileDrop(files);
  };

  return (
    <DropZone
      onDrop={(event) => {
        handleDrop(event).catch((error: unknown) => {
          console.error(error);
        });
      }}
      className="file-table-dropzone"
    >
      <Table
        aria-label="Files"
        selectionMode="single"
        selectionBehavior="toggle"
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        className="max-h-[800px] w-full"
      >
        <TableHeader className="file-table-header">
          <Column
            id="filename"
            isRowHeader
            allowsSorting
            className="file-table-column"
          >
            {t("filename")}
            <SortIndicator column="filename" sortDescriptor={sortDescriptor} />
          </Column>
          <Column id="testDate" allowsSorting className="file-table-column">
            {t("testDate")}
            <SortIndicator column="testDate" sortDescriptor={sortDescriptor} />
          </Column>
          <Column id="type" allowsSorting className="file-table-column">
            {t("type")}
            <SortIndicator column="type" sortDescriptor={sortDescriptor} />
          </Column>
          <Column id="finalDepth" allowsSorting className="file-table-column">
            {t("depthM_table")}
            <SortIndicator column="finalDepth" sortDescriptor={sortDescriptor} />
          </Column>
        </TableHeader>
        <TableBody
          items={sortedRows}
          renderEmptyState={() => (
            <div className="py-8 text-center text-gray-500">
              {t("dropFilesHere")}
            </div>
          )}
        >
          {(row) => (
            <Row id={row.id} className="file-table-row">
              <Cell className="file-table-cell">{row.filename}</Cell>
              <Cell className="file-table-cell">{row.testDate ?? "-"}</Cell>
              <Cell className="file-table-cell">
                <TypeBadge>{row.type}</TypeBadge>
              </Cell>
              <Cell
                className="file-table-cell"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {row.finalDepth !== null ? row.finalDepth.toFixed(2) : "-"}
              </Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </DropZone>
  );
}

const badgeClassNames = {
  BORE: "bg-orange-300 text-orange-800",
  CPT: "bg-blue-300 text-blue-800",
};

const TypeBadge = ({ children }: { children: GefFileType }) => (
  <div
    className={`p-0.5 rounded-sm w-fit text-xs ${badgeClassNames[children]}`}
  >
    {children}
  </div>
);
