import { parseGefFile, type GefData } from "@bedrock-engineer/gef-parser";
import type { TFunction } from "i18next";
import {
  ChevronDownIcon,
  GithubIcon,
  LinkedinIcon,
  MailIcon,
  TrashIcon,
  UploadIcon,
} from "lucide-react";
import { Suspense, useState, useTransition } from "react";
import {
  Button,
  Disclosure,
  DisclosurePanel,
  FileTrigger,
  Heading,
} from "react-aria-components";
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
import { GefMap } from "./gef-map.client";
import { InstallInstructions } from "./install-instructions";
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
      const count = parseInt(parts[2] ?? "0");
      const entry = t(
        count === 1
          ? "missingColumnInfoQuantity_entry"
          : "missingColumnInfoQuantity_entry_plural",
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
  if (error === "sieveTestNotSupported") {
    return t("sieveTestNotSupported");
  }
  return error;
}

export function App() {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [gefData, setGefData] = useState<Record<string, GefData>>({});
  const [selectedFileName, setSelectedFileName] = useState("");
  const [failedFiles, setFailedFiles] = useState<
    Array<{ name: string; error: string }>
  >([]);

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

    await handleFiles(files);
  }

  async function handleFiles(fileList: FileList | Array<File> | null) {
    const files = Array.from(fileList ?? []);

    if (files.length > 0) {
      const results = await Promise.allSettled(
        files.map((file) => parseGefFile(file)),
      );

      const parsedGefFiles: Array<[string, GefData]> = [];
      const failed: Array<{ name: string; error: string }> = [];

      for (let i = 0; i < results.length; i++) {
        const result = results[i]!;
        const file = files[i]!;

        if (result.status === "fulfilled") {
          parsedGefFiles.push([file.name, result.value]);
        } else {
          failed.push({
            name: file.name,
            error:
              result.reason instanceof Error
                ? result.reason.message
                : String(result.reason),
          });
        }
      }

      const gef = Object.fromEntries(parsedGefFiles) as Record<string, GefData>;

      startTransition(() => {
        setGefData((prev) => ({ ...prev, ...gef }));
        setFailedFiles((prev) => [...prev, ...failed]);

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

          {failedFiles.length > 0 && (
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

              <DisclosurePanel>
                <ul className="space-y-1 mt-2">
                  {failedFiles.map(({ name, error }) => (
                    <li key={name} className="text-sm text-red-700">
                      <span className="font-medium">{name}</span>:{" "}
                      {translateError(error, t)}
                    </li>
                  ))}
                </ul>
              </DisclosurePanel>
            </Disclosure>
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
                    {t("warning", { count: selectedFile.warnings.length })}
                  </Button>
                </Heading>

                <DisclosurePanel>
                  <ul className="space-y-1 mt-2">
                    {selectedFile.warnings.map((warning, i) => (
                      <li key={i} className="text-sm text-amber-700">
                        {translateWarning(warning, t)}
                      </li>
                    ))}
                  </ul>
                </DisclosurePanel>
              </Disclosure>
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

                {selectedFile.preExcavationLayers.length > 0 && (
                  <PreExcavationPlot
                    layers={selectedFile.preExcavationLayers}
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
                  specimens={selectedFile.specimens}
                  baseFilename={selectedFileName.replace(/\.gef$/i, "")}
                />

                {selectedFile.specimens.length > 0 && (
                  <SpecimenTable specimens={selectedFile.specimens} />
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
          <img src="bedrock.svg" width={30} /> {t("appTitle")}
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

            <p className="text-sm">
              {t("privacyNote")} {t("offlineNote")}{" "}
            </p>

            <p>
              <Suspense fallback="Checking...">
                <InstallInstructions />
              </Suspense>
            </p>

            <a
              className="hover:underline flex gap-1 items-center text-md mt-2"
              href="https://bedrock.engineer"
            >
              <img
                src="/bedrock.svg"
                width="16px"
                height="16px"
                alt="Bedrock logo"
              />
              Bedrock.engineer
            </a>

            <a
              className="text-blue-400 hover:underline flex gap-1 items-center text-sm mt-2"
              href="https://bro.bedrock.engineer"
            >
              Bedrock BRO/XML viewer
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
