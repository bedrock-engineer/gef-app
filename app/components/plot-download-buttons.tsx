import { downloadPng, downloadSvg } from "svg-crowbar";
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  type Selection,
} from "react-aria-components";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon, DownloadIcon } from "lucide-react";
import { useState } from "react";

type DownloadFormat = "svg" | "png";

interface PlotDownloadButtonsProps {
  plotId: string;
  filename: string;
}

export function PlotDownloadButtons({
  plotId,
  filename,
}: PlotDownloadButtonsProps) {
  const { t } = useTranslation();
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>("svg");

  function download(format: DownloadFormat) {
    const plotElement = document.querySelector<SVGSVGElement>(`#${plotId} svg`);

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

  function handleSelectionChange(keys: Selection) {
    const selectedKey = keys === "all" ? null : keys.values().next().value;
    if (selectedKey) {
      setSelectedFormat(selectedKey as DownloadFormat);
    }
  }

  const formatLabels: Record<DownloadFormat, string> = {
    svg: t("downloadSvg"),
    png: t("downloadPng"),
  };

  return (
    <div className="split-button mt-3">
      <Button
        className="button split-button-action"
        onPress={() => {
          download(selectedFormat);
        }}
      >
        <DownloadIcon size={14} />
        {formatLabels[selectedFormat]}
      </Button>
      <MenuTrigger>
        <Button
          className="button split-button-trigger"
          aria-label={t("selectDownloadFormat")}
        >
          <ChevronDownIcon size={14} />
        </Button>
        <Popover className="split-button-popover" placement="bottom end">
          <Menu
            className="split-button-menu"
            selectionMode="single"
            selectedKeys={[selectedFormat]}
            onSelectionChange={handleSelectionChange}
          >
            <MenuItem id="svg" className="split-button-menu-item">
              {t("downloadSvg")}
            </MenuItem>
            <MenuItem id="png" className="split-button-menu-item">
              {t("downloadPng")}
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
    </div>
  );
}
