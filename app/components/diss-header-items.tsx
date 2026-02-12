import type { GefDissData } from "@bedrock-engineer/gef-parser";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { CardTitle } from "./card";
import {
  getCalculationsInfo,
  getComments,
  getConditionsInfo,
  getCoordinatesInfo,
  getDataStructure,
  getFileMetadata,
  getProcessingInfo,
  getProjectInfo,
  getTestInfo,
  type HeaderItem
} from "./common-header-items";
import {
  CompactHeaderLeftColumn,
  CompactHeaderRightColumn,
  HeaderContainer,
  HeaderDisclosurePanels,
  type HeaderSection,
} from "./gef-header-display";

function DissCompactInfo({ data }: { data: GefDissData }) {
  const { t } = useTranslation();
  const { parent } = data;

  if (!parent?.reference && parent?.value == null) {
    return null;
  }

  return (
    <>
      {parent.reference && (
        <>
          <dt className="text-gray-500">{t("parentFile")}</dt>
          <dd>{parent.reference}</dd>
        </>
      )}
      {parent.value != null && (
        <>
          <dt className="text-gray-500">{t("dissipationDepth")}</dt>
          <dd>{parent.value}m</dd>
        </>
      )}
    </>
  );
}

interface CompactDissHeaderProps {
  filename: string;
  data: GefDissData;
}

export function CompactDissHeader({ filename, data }: CompactDissHeaderProps) {
  const { processed } = data;

  return (
    <HeaderContainer>
      <CompactHeaderLeftColumn filename={filename} data={data} />
      <CompactHeaderRightColumn processed={processed}>
        <DissCompactInfo data={data} />
      </CompactHeaderRightColumn>
    </HeaderContainer>
  );
}

function getDissParentInfo(
  data: GefDissData,
  t: TFunction,
): Array<HeaderItem> {
  const items: Array<HeaderItem> = [];
  const { parent } = data;

  if (parent?.reference) {
    items.push({ label: t("parentFile"), value: parent.reference });
  }
  if (parent?.value != null) {
    const unit = parent.unit ?? "m";
    items.push({
      label: t("dissipationDepth"),
      value: `${parent.value} ${unit}`,
    });
  }
  if (parent?.quantity) {
    items.push({ label: "Quantity", value: parent.quantity });
  }

  return items;
}

interface DetailedDissHeadersProps {
  data: GefDissData;
}

export function DetailedDissHeaders({ data }: DetailedDissHeadersProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { headers, processed } = data;

  const allSections: Array<HeaderSection> = [
    {
      id: "parent",
      title: t("parentInformation"),
      items: getDissParentInfo(data, t),
    },
    {
      id: "project",
      title: t("projectInformation"),
      items: getProjectInfo(processed, t, locale),
    },
    {
      id: "test_info",
      title: t("testInformation"),
      items: getTestInfo(processed, t, locale),
    },
    {
      id: "coordinates",
      title: t("coordinatesLocation"),
      items: getCoordinatesInfo(processed, t, locale),
    },
    {
      id: "conditions",
      title: t("testConditionsRemarks"),
      items: getConditionsInfo(processed, locale),
    },
    {
      id: "processing",
      title: t("dataProcessing"),
      items: getProcessingInfo(processed, locale),
    },
    {
      id: "calculations",
      title: t("calculationsFormulas"),
      items: getCalculationsInfo(processed, locale),
    },
    {
      id: "data_structure",
      title: t("dataStructure"),
      items: getDataStructure(headers, t),
    },
    {
      id: "metadata",
      title: t("fileMetadata"),
      items: getFileMetadata(processed, t),
    },
    {
      id: "comments",
      title: t("comments"),
      items: getComments(processed, t),
    },
  ].filter((section) => section.items.length > 0);

  return (
    <div className="space-y-2">
      <CardTitle>{t("technicalDetails")}</CardTitle>
      <HeaderDisclosurePanels sections={allSections} />
    </div>
  );
}
