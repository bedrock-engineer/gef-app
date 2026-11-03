import { parseGefFile, type GefData } from "@bedrock-engineer/gef-parser";
import { usePostHog } from "@posthog/react";
import {
  GithubIcon,
  LinkedinIcon,
  MailIcon,
  TrashIcon,
  UploadIcon,
} from "lucide-react";
import { lazy, Suspense, useState, useTransition } from "react";
import { Button, FileTrigger } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import { CompactBoreHeader, DetailedBoreHeaders } from "./bore-header-items";
import { BorePlot } from "./bore-plot";
import { Card } from "./card";
import { CompactCptHeader, DetailedCptHeaders } from "./cpt-header-items";
import { CptPlots } from "./cpt-plot";
import { CompactDissHeader, DetailedDissHeaders } from "./diss-header-items";
import { DissPlots } from "./diss-plots";
import { DownloadGeoJSONButton } from "./download-geojson-button";
import { FileTable } from "./file-table";
import { InstallInstructions } from "./install-instructions";
import {
  describeParseFailure,
  FailedFilesPanel,
  WarningsPanel,
  type ParseFailure,
} from "./parse-feedback";
import { PreExcavationPlot } from "./preexcavation-plot";
import { SpecimenTable } from "./specimen-table";

// Lazy so maplibre-gl only loads once a file with location data is
// open; it would otherwise dominate the initial chunk (~1 MB minified).
const GefMap = lazy(() =>
  import("./gef-map.client").then((module) => ({ default: module.GefMap })),
);

/**
 * Detects the failure mode where the browser cannot compile the gef-parser
 * WASM module. This happens on engines that don't honour the CSP
 * 'wasm-unsafe-eval' token (Safari < 16.4, iOS ≤ 15, older in-app WebViews):
 * they require the broad 'unsafe-eval' instead, which we deliberately don't
 * grant, so WASM compilation is blocked and every parse fails. Rather than
 * show a cryptic per-file error we surface a single "unsupported browser"
 * notice. See app/util/csp.ts and the CSP script-src directive.
 */
function isWasmUnsupportedError(reason: unknown): boolean {
  if (typeof WebAssembly === "undefined") {
    return true;
  }
  const message =
    reason instanceof Error
      ? `${reason.name}: ${reason.message}`
      : String(reason);
  const haystack = message.toLowerCase();
  return [
    "webassembly",
    "wasm",
    "unsafe-eval",
    "code generation", // Chrome: "Wasm code generation disallowed by embedder"
    "content security policy",
    "compileerror",
  ].some((needle) => haystack.includes(needle));
}

export function App() {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const [isPending, startTransition] = useTransition();
  const [gefData, setGefData] = useState<Record<string, GefData>>({});
  const [selectedFileName, setSelectedFileName] = useState("");
  const [wasmUnsupported, setWasmUnsupported] = useState(false);
  const [failedFiles, setFailedFiles] = useState<Array<ParseFailure>>([]);

  async function loadSampleFiles() {
    const sampleFiles = [
      "example_bore.gef",
      "example_cpt.gef",
      "example_diss.gef",
    ];

    const files = await Promise.all(
      sampleFiles.map(async (filename) => {
        const response = await fetch(`/${filename}`);
        const text = await response.text();
        return new File([text], filename, { type: "text/plain" });
      }),
    );

    await handleFiles(files, "sample");
  }

  async function handleFiles(
    fileList: FileList | Array<File> | null,
    source: "drop" | "sample" | "upload",
  ) {
    const files = Array.from(fileList ?? []);

    if (files.length > 0) {
      const results = await Promise.allSettled(
        files.map(async (file) => parseGefFile(await file.text(), file.name)),
      );

      const parsedGefFiles: Array<[string, GefData]> = [];
      const failed: Array<ParseFailure> = [];
      let wasmBlocked = false;

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const file = files[i];

        if (!result) {
          continue;
        }
        if (!file) {
          continue;
        }

        if (result.status === "fulfilled") {
          parsedGefFiles.push([file.name, result.value]);
        } else if (isWasmUnsupportedError(result.reason)) {
          // Every file will fail the same way on an unsupported engine, so
          // flag it once instead of listing a cryptic error per file.
          wasmBlocked = true;
        } else {
          failed.push(describeParseFailure(file.name, result.reason));
        }
      }

      const gef = Object.fromEntries(parsedGefFiles) as Record<string, GefData>;
      const parsedFiles = parsedGefFiles.map(([, data]) => data);

      posthog.capture("files_processed", {
        source,
        file_count: files.length,
        successful_file_count: parsedGefFiles.length,
        failed_file_count: failed.length,
        failure_reasons: [...new Set(failed.map((failure) => failure.reason))],
        wasm_unsupported: wasmBlocked,
        file_types: [...new Set(parsedFiles.map((file) => file.fileType))],
        warning_count: parsedFiles.reduce(
          (total, file) => total + file.warnings.length,
          0,
        ),
      });

      startTransition(() => {
        setGefData((prev) => ({ ...prev, ...gef }));
        setFailedFiles((prev) => [...prev, ...failed]);
        if (wasmBlocked) {
          setWasmUnsupported(true);
        }

        // Select the first successfully parsed file
        const firstParsed = parsedGefFiles[0];
        if (firstParsed) {
          setSelectedFileName(firstParsed[0]);
        }
      });
    }
  }

  const selectedFile = selectedFileName ? gefData[selectedFileName] : undefined;

  return (
    <div className="pancake">
      <Header />

      <main className="main-grid px-2">
        <div className="mb-2">
          <div className="mb-8">
            <FileTrigger
              acceptedFileTypes={[".gef", ".GEF"]}
              allowsMultiple
              onSelect={(fileList) => {
                handleFiles(fileList, "upload").catch((error: unknown) => {
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
                className=" text-blue-500 hover:text-blue-800 underline"
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

          {wasmUnsupported && (
            <div
              role="alert"
              className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-sm text-amber-900"
            >
              <p className="font-semibold">{t("wasmUnsupportedTitle")}</p>
              <p className="text-sm mt-1">{t("wasmUnsupportedBody")}</p>
            </div>
          )}

          {failedFiles.length > 0 && (
            <FailedFilesPanel failedFiles={failedFiles} />
          )}

          <FileTable
            gefData={gefData}
            selectedFileName={selectedFileName}
            onSelectionChange={setSelectedFileName}
            onFileDrop={(files) => {
              handleFiles(files, "drop").catch((error: unknown) => {
                console.error(error);
              });
            }}
            onFileRemove={(filename) => {
              const removedFile = gefData[filename];
              posthog.capture("file_removed", {
                file_type: removedFile?.fileType,
                remaining_file_count: Math.max(
                  Object.keys(gefData).length - 1,
                  0,
                ),
              });

              setGefData((prev) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [filename]: _, ...rest } = prev;
                return rest;
              });

              if (selectedFileName === filename) {
                const remaining = Object.keys(gefData).filter(
                  (f) => f !== filename,
                );
                setSelectedFileName(remaining[0] ?? "");
              }
            }}
          />

          {Object.keys(gefData).length > 0 && (
            <Button
              className="button mt-2 ml-auto transition-colors"
              onPress={() => {
                const loadedFiles = Object.values(gefData);
                posthog.capture("files_cleared", {
                  file_count: loadedFiles.length,
                  file_types: [
                    ...new Set(loadedFiles.map((file) => file.fileType)),
                  ],
                  failed_file_count: failedFiles.length,
                });
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
                  <div className="w-full h-96 rounded-sm border border-gray-300 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-500">{t("loadingMap")}</span>
                  </div>
                }
              >
                <GefMap
                  gefData={gefData}
                  selectedFileName={selectedFileName}
                  onMarkerClick={setSelectedFileName}
                />
              </Suspense>

              <DownloadGeoJSONButton gefData={gefData} />
            </div>
          )}
        </div>

        {selectedFile ? (
          <div className="space-y-6 max-w-full">
            {selectedFile.warnings.length > 0 && (
              <WarningsPanel file={selectedFile} />
            )}

            {selectedFile.fileType === "DISS" && (
              <>
                <CompactDissHeader
                  filename={selectedFileName}
                  data={selectedFile}
                />

                <DissPlots
                  data={selectedFile.data}
                  columnInfo={selectedFile.columnInfo}
                  baseFilename={selectedFileName.replace(/\.gef$/i, "")}
                />

                <DetailedDissHeaders data={selectedFile} />
              </>
            )}

            {selectedFile.fileType === "CPT" && (
              <>
                <CompactCptHeader
                  filename={selectedFileName}
                  data={selectedFile}
                />

                <CptPlots
                  data={selectedFile.data}
                  columnInfo={selectedFile.columnInfo}
                  zid={selectedFile.headers.ZID}
                  baseFilename={selectedFileName.replace(/\.gef$/i, "")}
                />

                {selectedFile.processed.preExcavationLayers.length > 0 && (
                  <PreExcavationPlot
                    layers={selectedFile.processed.preExcavationLayers}
                    baseFilename={selectedFileName.replace(/\.gef$/i, "")}
                  />
                )}

                <DetailedCptHeaders data={selectedFile} />
              </>
            )}

            {selectedFile.fileType === "BORE" && (
              <>
                <CompactBoreHeader
                  filename={selectedFileName}
                  data={selectedFile}
                />

                <BorePlot
                  layers={selectedFile.layers}
                  specimens={selectedFile.processed.specimens}
                  groundwaterLevel={
                    selectedFile.processed.measurements
                      .grondwaterstandTijdensBoren?.value
                  }
                  baseFilename={selectedFileName.replace(/\.gef$/i, "")}
                />

                {selectedFile.processed.specimens.length > 0 && (
                  <SpecimenTable specimens={selectedFile.processed.specimens} />
                )}

                <DetailedBoreHeaders data={selectedFile} />
              </>
            )}
          </div>
        ) : (
          <MarketingMessage />
        )}
      </main>
      <Footer />
    </div>
  );
}

function MarketingMessage() {
  const { t } = useTranslation();
  return (
    <Card>
      <p className="text-gray-600 mb-4">{t("uploadGefFile")}</p>

      <div className="text-sm text-gray-500">
        <p className="mb-2">
          {t("freeToolByBedrock")}{" "}
          <a
            href="https://bedrock.engineer"
            className="text-blue-500 hover:underline font-medium"
          >
            Bedrock.engineer
          </a>
          .
        </p>
        <p className="mb-2">{t("weBuild")}</p>

        <ul className="list-disc list-inside space-y-1 ">
          <li>{t("customWebApps")}</li>
          <li>{t("bimCadIntegrations")}</li>
          <li>{t("pythonAutomation")}</li>
        </ul>

        <p className="mt-3">
          {t("emptyStateContact")}{" "}
          <a
            href="mailto:info@bedrock.engineer"
            className="text-blue-500 hover:underline font-medium"
          >
            {t("contactUs")} info@bedrock.engineer
          </a>
        </p>
      </div>
    </Card>
  );
}

function Header() {
  const { t, i18n } = useTranslation();
  const fetcher = useFetcher();

  const handleLanguageChange = () => {
    const newLang = i18n.language === "nl" ? "en" : "nl";
    console.log({ newLang });

    return fetcher.submit(
      { locale: newLang },
      { method: "post", action: "/set-language" },
    );
  };

  return (
    <header className="mb-6 border-b border-gray-300 py-4 px-2">
      <div
        style={{ maxWidth: "clamp(360px, 100%, 1800px)" }}
        className=" mx-auto flex justify-between items-center"
      >
        <h1
          className="text-3xl flex gap-2 items-center"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          <img src="bedrock.svg" width={30} />
          <span style={{ color: "hsl(110 3% 53%)" }}>
            Bedrock.engineer
          </span>{" "}
          {t("appTitle")}
        </h1>

        <button
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          onClick={() => {
            handleLanguageChange()
              .then((a) => {
                console.log("Language change submitted", a);
              })
              .catch((error: unknown) => {
                console.error(error);
              });
          }}
        >
          {i18n.language === "nl" ? "English" : "Nederlands"}
        </button>
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-8 py-8 border-t border-gray-300 text-sm text-gray-500">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 mb-3">{t("about")}</h3>

            <p className="text-sm">{t("appDescription")}</p>

            <p className="text-sm">{t("privacyNote")}</p>

            <p>
              <Suspense fallback="Checking...">
                <InstallInstructions />
              </Suspense>
            </p>

            <a
              className="hover:underline flex gap-1 items-center text-md mt-2"
              href="https://bedrock.engineer"
              style={{
                color: "hsl(110 3% 53%)",
                fontFamily: "var(--font-condensed)",
              }}
            >
              <img
                src="/bedrock.svg"
                width="16px"
                height="16px"
                alt="Bedrock.engineer logo"
              />
              Bedrock.engineer
            </a>

            <a
              className="text-blue-400 hover:underline flex gap-1 items-center text-sm mt-2"
              href="https://bro.bedrock.engineer"
            >
              Bedrock.engineer BRO/XML viewer
            </a>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 mb-3">{t("contact")}</h3>
            <div>
              <p className="text-sm mb-1">
                {t("needSimilarApp")}
                <br />
                {t("contactUs")}:
                <a
                  href="mailto:info@bedrock.engineer"
                  className="text-blue-400 hover:underline font-medium ml-1"
                >
                  info@bedrock.engineer
                </a>
              </p>
            </div>

            <div>
              <p className="text-sm mb-1 inline-flex">
                {t("feedbackOrRequests")}
              </p>

              <a
                className="flex gap-1 items-center text-blue-400 hover:underline font-medium"
                href="https://github.com/bedrock-engineer/gef-app/issues"
              >
                <GithubIcon size={14} /> Github Issues
              </a>

              <a
                href="mailto:jules.blom@bedrock.engineer"
                className="flex gap-1 items-center text-blue-400 hover:underline font-medium"
              >
                <MailIcon size={12} /> jules.blom@bedrock.engineer
              </a>

              <a
                href="https://www.linkedin.com/company/bedrock-engineer/"
                className="flex gap-1 items-center text-blue-400 hover:underline font-medium"
              >
                <LinkedinIcon size={14} />
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-300">
          <p className="text-gray-400 text-xs text-center">{t("disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
