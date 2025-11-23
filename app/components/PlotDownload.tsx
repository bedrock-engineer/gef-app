import { downloadPng, downloadSvg } from "svg-crowbar";
import { Button } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { DownloadIcon } from "lucide-react";

interface PlotDownloadButtonsProps {
  plotId: string;
  filename: string;
}

export function PlotDownloadButtons({
  plotId,
  filename,
}: PlotDownloadButtonsProps) {
  const { t } = useTranslation();

  function download(format: "svg" | "png") {
    const plotElement = document.getElementById(plotId)?.querySelector("svg");

    if (!plotElement) {
      console.error(`Could not find SVG element in #${plotId}`);
      return;
    }

    if (format === "svg") {
      downloadSvg(plotElement, filename, {
        css: "none",
      });
    } else {
      downloadPng(plotElement, filename, {
        css: "internal",
        downloadPNGOptions: {
          scale: window.devicePixelRatio,
        },
      });
    }
  }

  return (
    <div className="flex gap-2 mt-3">
      <Button
        className="button transition-colors"
        onPress={() => {
          download("svg");
        }}
      >
        {t("downloadSvg")} <DownloadIcon size={14} />
      </Button>
      <Button
        className="button"
        onPress={() => {
          download("png");
        }}
      >
        {t("downloadPng")} <DownloadIcon size={14} />
      </Button>
    </div>
  );
}
