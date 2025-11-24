import { csvFormat } from "d3-dsv";
import type { GefCptData } from "./gef-cpt";

export function downloadGefDataAsCsv(
  gefData: GefCptData,
  filename: string
): void {
  // Convert data to CSV format using d3-array
  const csvContent = csvFormat(gefData.data);

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  // Generate filename (replace .gef/.GEF extension with .csv)
  const csvFilename = filename.replace(/\.gef$/i, ".csv");

  link.href = URL.createObjectURL(blob);
  link.download = csvFilename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(link.href);
}
