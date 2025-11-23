import { useMemo } from "react";
import type { Selection, FileDropItem } from "react-aria-components";
import {
  Cell,
  Column,
  DropZone,
  Row,
  Table,
  TableBody,
  TableHeader,
  Text,
} from "react-aria-components";
import type { GefData } from "~/util/gef";
import { Checkbox } from "./checkbox";

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
  type: "CPT" | "BORE";
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
  const rows: Array<FileRow> = useMemo(() => {
    return Object.entries(gefData).map(([filename, data]) => {
      let testDate: string | null = null;

      if (data.fileType === "BORE") {
        // For BORE files, use MEASUREMENTTEXT 16 (Datum boring)
        const datumBoring = data.headers.MEASUREMENTTEXT?.find(mt => mt.id === 16);
        if (datumBoring) {
          testDate = datumBoring.text;
        }
      } else if (data.headers.STARTDATE) {
        // For CPT files, use STARTDATE
        testDate = formatDate(data.headers.STARTDATE);
      }

      return {
        id: filename,
        filename,
        testDate,
        type: data.fileType,
      };
    });
  }, [gefData]);

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

  if (rows.length === 0) {
    return (
      <DropZone
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <Text slot="label">Drop files here</Text>
      </DropZone>
    );
  }

  return (
    <DropZone
      onDrop={handleDrop}
      className="mb-4 rounded-lg border border-gray-200 drop-target:border-blue-400 drop-target:bg-blue-50 transition-colors"
    >
      <Table
        aria-label="Files"
        selectionMode="single"
        selectionBehavior="toggle"
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        className="w-full"
      >
        <TableHeader className="bg-gray-50 border-b border-gray-200">
          <Column className="w-10 p-3" />
          <Column
            isRowHeader
            className="text-left p-3 font-medium text-gray-700"
          >
            Filename
          </Column>
          <Column className="text-left p-3 font-medium text-gray-700">
            Test Date
          </Column>
          <Column className="text-left p-3 font-medium text-gray-700">
            Type
          </Column>
        </TableHeader>
        <TableBody items={rows}>
          {(row) => (
            <Row
              id={row.id}
              className="border-b border-gray-100 hover:bg-blue-50 selected:bg-blue-200 cursor-pointer transition-colors"
            >
              <Cell className="p-3">
                <Checkbox slot="selection" />
              </Cell>
              <Cell className="p-3">{row.filename}</Cell>
              <Cell className="p-3">{row.testDate ?? "-"}</Cell>
              <Cell className="p-3">{row.type}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </DropZone>
  );
}
