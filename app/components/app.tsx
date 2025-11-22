import { useState } from "react";
import {
  Button,
  DropZone,
  FileTrigger,
  ToggleButton,
  ToggleButtonGroup,
} from "react-aria-components";
import { downloadGefDataAsCsv } from "~/util/csv-download";
import { parseGefFile, type GefData } from "~/util/gef";
import { BorePlot } from "./BorePlot";
import { CptPlots } from "./CptPlot";
import { CompactGefHeader, DetailedGefHeaders } from "./GefHeaderDisplay";
import { GefMultiMap } from "./GefMultiMap";
import { PreExcavationPlot } from "./PreExcavationPlot";
import { SpecimenTable } from "./SpecimenTable";

export function App() {
  const [gefData, setGefData] = useState<Record<string, GefData>>({});
  const [selectedFileName, setSelectedFileName] = useState("");
  const [failedFiles, setFailedFiles] = useState<
    Array<{ name: string; error: string }>
  >([]);

  async function loadSampleFiles() {
    const [boreResponse, cptResponse] = await Promise.all([
      fetch("/example_bore.gef"),
      fetch("/example_cpt.gef"),
    ]);

    const boreText = await boreResponse.text();
    const cptText = await cptResponse.text();

    const boreFile = new File([boreText], "example_bore.gef", {
      type: "text/plain",
    });
    const cptFile = new File([cptText], "example_cpt.gef", {
      type: "text/plain",
    });

    await handleFiles([boreFile, cptFile]);
  }

  async function handleFiles(fileList: FileList | Array<File> | null) {
    const files = Array.from(fileList ?? []);

    console.log({ files });

    if (files.length > 0) {
      const results = await Promise.allSettled(
        files.map((file) => parseGefFile(file))
      );

      const parsedGefFiles = results
        .filter((f) => f.status === "fulfilled")
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map((d, i) => [files[i]!.name, d.value]);

      const failed = results
        .map((result, i) => ({ result, file: files[i] }))
        .filter(
          (item): item is { result: PromiseRejectedResult; file: File } =>
            item.result.status === "rejected"
        )
        .map(({ result, file }) => ({
          name: file.name,
          error:
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason),
        }));

        const gef = Object.fromEntries(parsedGefFiles) as Record<string, GefData>

      setGefData(gef);
      setFailedFiles(failed);

      if (files[0]) {
        setSelectedFileName(files[0].name);
      }
    }
  }

  const selectedFile = selectedFileName ? gefData[selectedFileName] : undefined;

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl mx-auto w-fit flex gap-4 mb-6 text-center items-center">
        <img src="bedrock.svg" width={30} /> Bedrock GEF Viewer
      </h1>

      <div className="text-center mb-6 max-w-md mx-auto">
        <p className="text-gray-600 text-sm mb-2">
          View and analyze GEF (Geotechnical Exchange Format) files for CPT and
          borehole data.
        </p>
        <p className="text-green-700 text-xs font-medium">
          Data never leaves your browser, it is not sent to any server
        </p>
      </div>

      <div className="max-w-[300px] mx-auto mb-8">
        <DropZone
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onDrop={async (e) => {
            const fileItems = e.items.filter((file) => file.kind === "file");

            const files = await Promise.all(fileItems.map((d) => d.getFile()));

            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            handleFiles(files);
          }}
        >
          <FileTrigger
            acceptedFileTypes={[".gef", ".GEF"]}
            allowsMultiple
            onSelect={(fileList) => {
              handleFiles(fileList).catch((error: unknown) => {
                console.error(error);
              });
            }}
          >
            <Button className="w-full p-3 border-2 border-blue-400 aria-selected:bg-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors">
              Choose GEF Files
            </Button>
          </FileTrigger>
          Or drop them here
          {/* TODO Nice icon */}
        </DropZone>
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-500">or </span>
          <Button
            className="text-sm text-blue-600 hover:text-blue-800 underline"
            onPress={() => {
              loadSampleFiles().catch((error: unknown) => {
                console.error(error);
              });
            }}
          >
            load sample files
          </Button>
        </div>
      </div>

      {failedFiles.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-800 font-semibold mb-2">
            Failed to parse {failedFiles.length} file
            {failedFiles.length > 1 ? "s" : ""}:
          </h2>
          <ul className="space-y-1">
            {failedFiles.map(({ name, error }) => (
              <li key={name} className="text-sm text-red-700">
                <span className="font-medium">{name}</span>: {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ToggleButtonGroup
        selectedKeys={[selectedFileName]}
        className="flex flex-wrap gap-x-3 gap-y-3 mb-4"
      >
        {Object.keys(gefData).map((filename) => (
          <ToggleButton
            onClick={() => {
              setSelectedFileName(filename);
            }}
            id={filename}
            key={filename}
            className="border border-gray-300 hover:bg-blue-100 hover:border-gray-400 p-2 rounded-sm data-selected:bg-blue-300 transition-colors"
          >
            {filename}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {Object.keys(gefData).length > 0 && (
        <Button
          className={"px-2 py-1 border rounded-sm hover:bg-blue-100"}
          onPress={() => {
            setGefData({});
            setSelectedFileName("");
            setFailedFiles([]);
          }}
        >
          Clear all files
        </Button>
      )}

      {Object.keys(gefData).length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">
            {Object.keys(gefData).length > 1 ? "All Locations" : "Location"}
          </h2>

          <GefMultiMap
            gefData={gefData}
            selectedFileName={selectedFileName}
            onMarkerClick={setSelectedFileName}
          />
        </div>
      )}

      {selectedFile && (
        <div className="space-y-6">
          {selectedFile.warnings.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h2 className="text-amber-800 font-semibold mb-2">
                {selectedFile.warnings.length} warning
                {selectedFile.warnings.length > 1 ? "s" : ""}:
              </h2>
              <ul className="space-y-1">
                {selectedFile.warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-amber-700">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <CompactGefHeader
            headers={selectedFile.headers}
            onDownload={() => {
              if (selectedFile.fileType === "CPT") {
                downloadGefDataAsCsv(selectedFile, selectedFileName);
              }
            }}
          />

          {selectedFile.fileType === "CPT" && (
            <>
              {selectedFile.chartAxes.xAxis && selectedFile.chartAxes.yAxis && (
                <CptPlots
                  data={selectedFile.data}
                  xAxis={selectedFile.chartAxes.xAxis}
                  yAxis={selectedFile.chartAxes.yAxis}
                  availableColumns={selectedFile.chartAxes.availableColumns}
                  yAxisOptions={selectedFile.chartAxes.yAxisOptions}
                  baseFilename={selectedFileName.replace(/\.gef$/i, "")}
                />
              )}
              {selectedFile.preExcavationLayers.length > 0 && (
                <PreExcavationPlot
                  layers={selectedFile.preExcavationLayers}
                  baseFilename={selectedFileName.replace(/\.gef$/i, "")}
                />
              )}
            </>
          )}

          {selectedFile.fileType === "BORE" && (
            <>
              <BorePlot
                layers={selectedFile.layers}
                specimens={selectedFile.specimens}
                baseFilename={selectedFileName.replace(/\.gef$/i, "")}
              />
              {selectedFile.specimens.length > 0 && (
                <SpecimenTable specimens={selectedFile.specimens} />
              )}
            </>
          )}

          <DetailedGefHeaders
            headers={selectedFile.headers}
            fileType={selectedFile.fileType}
          />
        </div>
      )}
    </main>
  );
}
