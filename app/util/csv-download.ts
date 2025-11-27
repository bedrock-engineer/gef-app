import { csvFormat } from "d3-dsv";
import type { GefData } from "~/gef/gef-common";
import { downloadFile } from "./download";

export function downloadGefDataAsCsv(gefData: GefData, filename: string): void {
  let csvContent: string;

  if (gefData.fileType === "CPT") {
    csvContent = csvFormat(gefData.data);
  } else {
    // Convert BORE layers to CSV format
    const boreData = gefData;
    const layersForCsv = boreData.layers.map((layer) => ({
      depthTop: layer.depthTop,
      depthBottom: layer.depthBottom,
      soilCode: layer.soilCode,
      additionalCodes: layer.additionalCodes.join(", "),
      description: layer.description ?? "",
      sandMedian: layer.sandMedian ?? "",
      gravelMedian: layer.gravelMedian ?? "",
      clayPercent: layer.clayPercent ?? "",
      siltPercent: layer.siltPercent ?? "",
      sandPercent: layer.sandPercent ?? "",
      gravelPercent: layer.gravelPercent ?? "",
      organicMatterPercent: layer.organicPercent ?? "",
    }));
    csvContent = csvFormat(layersForCsv);
  }

  // Generate filename (replace .gef/.GEF extension with .csv)
  const csvFilename = filename.replace(/\.gef$/i, ".csv");

  downloadFile(csvContent, csvFilename, "text/csv;charset=utf-8;");
}
