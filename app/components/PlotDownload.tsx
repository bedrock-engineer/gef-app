import { downloadPng, downloadSvg } from "svg-crowbar";
import { Button } from "react-aria-components";

interface PlotDownloadButtonsProps {
  plotId: string;
  filename: string;
}

export function PlotDownloadButtons({
  plotId,
  filename,
}: PlotDownloadButtonsProps) {
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
    } else if (format === "png") {
      downloadPng(plotElement, filename, {
        css: "internal",
        downloadPNGOptions: {
          scale: window.devicePixelRatio,
          background: "white",
        },
      });
    }
  }

  return (
    <div className="flex gap-2 mt-3">
      <Button
        className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
        onPress={() => download("svg")}
      >
        Download SVG
      </Button>
      <Button
        className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
        onPress={() => download("png")}
      >
        Download PNG
      </Button>
    </div>
  );
}
