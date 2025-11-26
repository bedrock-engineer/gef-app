import type { TFunction } from "i18next";
import { TrashIcon, UploadIcon } from "lucide-react";
import { Suspense, useState, useTransition } from "react";
import { Button, FileTrigger } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { Form } from "react-router";
import { downloadGefDataAsCsv } from "~/util/csv-download";
import { parseGefFile, type GefData } from "~/gef/gef-common";
import { BorePlot } from "./bore-plot";
import { Card } from "./card";
import { CptPlots } from "./cpt-plot";
import { DownloadGeoJSONButton } from "./download-geojson-button";
import { FileTable } from "./file-table";
import { CompactGefHeader, DetailedGefCptHeaders } from "./gef-header-display";
import { GefMultiMap } from "./gef-map";
import { PreExcavationPlot } from "./preexcavation-plot";
import { SpecimenTable } from "./specimen-table";

function translateWarning(warning: string, t: TFunction): string {
  const parts = warning.split(":");
  const key = parts[0];

  switch (key) {
    case "missingZidHeader":
      return t("missingZidHeader", { filename: parts[1] });
    case "unknownHeightSystem":
      return t("unknownHeightSystem", {
        filename: parts[1],
        heightCode: parts[2],
      });
    case "zidWithoutHeight":
      return t("zidWithoutHeight", { filename: parts[1] });
    case "missingXyidHeader":
      return t("missingXyidHeader", { filename: parts[1] });
    case "missingColumnInfoQuantity": {
      const count = parseInt(parts[2] || "0");
      const entry = t(
        count === 1
          ? "missingColumnInfoQuantity_entry"
          : "missingColumnInfoQuantity_entry_plural"
      );
      return t("missingColumnInfoQuantity", {
        filename: parts[1],
        count,
        entry,
      });
    }
    default:
      return warning;
  }
}

function translateError(error: string, t: TFunction): string {
  if (error === "dissipationTestNotSupported") {
    return t("dissipationTestNotSupported");
  }
  if (error === "sieveTestNotSupported") {
    return t("sieveTestNotSupported");
  }
  return error;
}

export function App() {
  const { t, i18n } = useTranslation();
  const [isPending, startTransition] = useTransition();
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

      const gef = Object.fromEntries(parsedGefFiles) as Record<string, GefData>;

      startTransition(() => {
        setGefData((prev) => ({ ...prev, ...gef }));
        setFailedFiles((prev) => [...prev, ...failed]);

        if (files[0]) {
          setSelectedFileName(files[0].name);
        }
      });
    }
  }

  const selectedFile = selectedFileName ? gefData[selectedFileName] : undefined;

  return (
    <div className="pancake">
      <header className="mb-6 border-b border-gray-300 py-4 px-2">
        <div
          style={{ maxWidth: "clamp(360px, 100%, 1800px)" }}
          className=" mx-auto flex justify-between items-center"
        >
          <h1 className="text-2xl flex gap-4 text-center items-center">
            <img src="bedrock.svg" width={30} /> {t("appTitle")}
          </h1>
          <Form method="post">
            <input
              type="hidden"
              name="lang"
              value={i18n.language === "nl" ? "en" : "nl"}
            />
            <button
              type="submit"
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              {i18n.language === "nl" ? "EN" : "NL"}
            </button>
          </Form>
        </div>
      </header>

      <main className="main-grid px-2">
        <div>
          <div className="mb-8">
            <FileTrigger
              acceptedFileTypes={[".gef", ".GEF"]}
              allowsMultiple
              onSelect={(fileList) => {
                handleFiles(fileList).catch((error: unknown) => {
                  console.error(error);
                });
              }}
            >
              <Button
                isPending={isPending}
                className="flex gap-1 items-center justify-center w-full p-2 border border-blue-300 aria-selected:bg-blue-200 data-pressed:bg-blue-200 data-pressed:text-blue-800 rounded-sm bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
              >
                {isPending ? (
                  <>
                    {t("processingFiles")}{" "}
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  </>
                ) : (
                  <>
                    {t("chooseFiles")}
                    <UploadIcon size={14} />
                  </>
                )}
              </Button>
            </FileTrigger>

            <div className="text-xs mt-1 text-center">
              <span className=" text-gray-500">{t("or")} </span>
              <Button
                className=" text-blue-600 hover:text-blue-800 underline"
                onPress={() => {
                  loadSampleFiles().catch((error: unknown) => {
                    console.error(error);
                  });
                }}
              >
                {t("loadSampleFiles")}
              </Button>
            </div>
          </div>

          {failedFiles.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-sm">
              <h2 className="text-red-800 font-semibold mb-2">
                {t("failedToParse", { count: failedFiles.length })}
              </h2>
              <ul className="space-y-1">
                {failedFiles.map(({ name, error }) => (
                  <li key={name} className="text-sm text-red-700">
                    <span className="font-medium">{name}</span>:{" "}
                    {translateError(error, t)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <FileTable
            gefData={gefData}
            selectedFileName={selectedFileName}
            onSelectionChange={setSelectedFileName}
            onFileDrop={(files) => {
              handleFiles(files).catch((error: unknown) => {
                console.error(error);
              });
            }}
            onFileRemove={(filename) => {
              setGefData((prev) => {
                const { [filename]: _, ...rest } = prev;
                return rest;
              });
              if (selectedFileName === filename) {
                const remaining = Object.keys(gefData).filter(
                  (f) => f !== filename
                );
                setSelectedFileName(remaining[0] ?? "");
              }
            }}
          />

          {Object.keys(gefData).length > 0 && (
            <Button
              className={"button mt-2 ml-auto transition-colors"}
              onPress={() => {
                setGefData({});
                setSelectedFileName("");
                setFailedFiles([]);
              }}
            >
              {t("clearAllFiles")} <TrashIcon size={14} />
            </Button>
          )}

          {Object.keys(gefData).length > 0 && (
            <div className="mb-6 mt-2">
              <h2 className="text-xl font-semibold mb-3">
                {Object.keys(gefData).length > 1
                  ? t("allLocations")
                  : t("location")}
              </h2>

              <Suspense
                fallback={
                  <div className="w-full h-96 rounded-md border border-gray-300 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-500">{t("loadingMap")}</span>
                  </div>
                }
              >
                <GefMultiMap
                  gefData={gefData}
                  selectedFileName={selectedFileName}
                  onMarkerClick={setSelectedFileName}
                />
              </Suspense>
            </div>
          )}

          <DownloadGeoJSONButton gefData={gefData} />
        </div>

        {selectedFile ? (
          <div className="space-y-6">
            {selectedFile.warnings.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <h2 className="text-amber-800 font-semibold mb-2">
                  {t("warning", { count: selectedFile.warnings.length })}
                </h2>

                <ul className="space-y-1">
                  {selectedFile.warnings.map((warning, i) => (
                    <li key={i} className="text-sm text-amber-700">
                      {translateWarning(warning, t)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <CompactGefHeader
              filename={selectedFileName}
              data={selectedFile}
              onDownload={() => {
                if (selectedFile.fileType === "CPT") {
                  downloadGefDataAsCsv(selectedFile, selectedFileName);
                }
              }}
            />

            {selectedFile.fileType === "CPT" && (
              <>
                {selectedFile.chartAxes.xAxis &&
                  selectedFile.chartAxes.yAxis && (
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

            <DetailedGefCptHeaders data={selectedFile} />
          </div>
        ) : (
          <Card>
            <p className="text-gray-600 mb-4">{t("uploadGefFile")}</p>

            <div className="text-sm text-gray-500">
              <p className="mb-2">{t("freeToolByBedrock")}</p>

              <ul className="list-disc list-inside space-y-1 ">
                <li>{t("customWebApps")}</li>
                <li>{t("bimCadIntegrations")}</li>
                <li>{t("pythonAutomation")}</li>
              </ul>

              <p className="mt-3">
                {t("emptyStateContact")}{" "}
                <a
                  href="mailto:info@bedrock.engineer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  {t("contactUs")}
                </a>
              </p>
            </div>
          </Card>
        )}
      </main>

      <footer className="mt-8 py-8 border-t border-gray-300 text-center text-sm text-gray-500">
        <div className="text-sm text-center mb-6 max-w-md mx-auto border-b border-gray-300 pb-4 space-y-2">
          <p>{t("appDescription")}</p>
          <p>{t("privacyNote")}</p>
          <a
            className="text-green-900 hover:underline inline-flex gap-1 mx-auto text-2xl"
            href="https://bedrock.engineer"
          >
            Bedrock.engineer{" "}
            <img src="/bedrock.svg" width="18px" height="18px" />
          </a>
        </div>

        <p className="mb-3">
          {t("needSimilarApp")}{" "}
          <a
            href="mailto:info@bedrock.engineer"
            className="text-blue-600 hover:underline font-medium"
          >
            {t("contactUs")}
          </a>
        </p>

        <p>
          {t("feedbackOrRequests")}{" "}
          <a
            href="mailto:jules@bedrock.engineer"
            className="text-blue-600 hover:underline"
          >
            jules.blom@bedrock.engineer
          </a>
        </p>

        <div className="mt-6 max-w-2xl mx-auto px-4">
          <p className="text-gray-400 ">{t("disclaimer")}</p>
        </div>
      </footer>
    </div>
  );
}
