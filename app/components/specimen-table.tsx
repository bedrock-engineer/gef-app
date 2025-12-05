import { useTranslation } from "react-i18next";
import type { BoreSpecimen } from "~/gef/gef-bore";
import { SPECIMEN_CODES, formatSpecimenCode } from "~/gef/gef-bore";
import { CardTitle } from "./card";

interface SpecimenTableProps {
  specimens: Array<BoreSpecimen>;
}

export function SpecimenTable({ specimens }: SpecimenTableProps) {
  const { t, i18n } = useTranslation();
  const lang: "nl" | "en" = i18n.language === "en" ? "en" : "nl";

  if (specimens.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <CardTitle>{t("specimensCount", { count: specimens.length })}</CardTitle>

      {specimens[0]?.remarks && specimens[0].remarks.length > 0 && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <strong>{t("remarks")}</strong>
          <ul className="list-disc list-inside">
            {specimens[0].remarks.map((remark, i) => (
              <li key={i}>{remark}</li>
            ))}
          </ul>
        </div>
      )}

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1 text-left w-12">
              {t("number")}
            </th>
            <th className="border border-gray-300 px-2 py-1 text-left">
              {t("code")}
            </th>
            <th
              className="border border-gray-300 px-2 py-1 text-left"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {t("depthM_table")}
            </th>
            <th
              className="border border-gray-300 px-2 py-1 text-right"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {t("diameterSampleMm")}
            </th>
            <th
              className="border border-gray-300 px-2 py-1 text-right"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {t("diameterApparatusMm")}
            </th>
            <th className="border border-gray-300 px-2 py-1 text-left">
              {t("dateTime")}
            </th>
            <th className="border border-gray-300 px-2 py-1 text-left">
              {t("sampleCondition")}
            </th>
            <th className="border border-gray-300 px-2 py-1 text-left">
              {t("apparatusType")}
            </th>
            <th className="border border-gray-300 px-2 py-1 text-left">
              {t("wallMethod")}
            </th>
          </tr>
        </thead>

        <tbody>
          {specimens.map((spec) => (
            <tr key={spec.specimenNumber} className="hover:bg-gray-50">
              {/* 1. Number */}
              <td className="border border-gray-300 px-2 py-1 text-center">
                {spec.specimenNumber}
              </td>

              {/* 2. Code */}
              <td className="border border-gray-300 px-2 py-1">
                {spec.monstercode ?? "-"}
              </td>

              {/* 3. Depth */}
              <td
                className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {spec.depthTop} - {spec.depthBottom}
              </td>

              {/* 4. Sample Diameter */}
              <td
                className="border border-gray-300 px-2 py-1 text-right"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {spec.diameterMonster ?? "-"}
              </td>

              {/* 5. Apparatus Diameter - NEW COLUMN */}
              <td
                className="border border-gray-300 px-2 py-1 text-right"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {spec.diameterMonstersteekapparaat ?? "-"}
              </td>

              {/* 6. Date/Time */}
              <td className="border border-gray-300 px-2 py-1 whitespace-nowrap">
                {spec.monsterdatum ?? "-"}
                {spec.monstertijd && ` ${spec.monstertijd}`}
              </td>

              {/* 7. Disturbed */}
              <td className="border border-gray-300 px-2 py-1 whitespace-nowrap">
                {formatSpecimenCode(
                  spec.geroerdOngeroerd,
                  SPECIMEN_CODES.geroerd,
                  lang,
                ) ?? "-"}
              </td>

              {/* 8. Apparatus Type */}
              <td className="border border-gray-300 px-2 py-1">
                {formatSpecimenCode(
                  spec.monstersteekapparaat,
                  SPECIMEN_CODES.monstersteekapparaat,
                  lang,
                ) ?? "-"}
              </td>

              {/* 9. Wall/Method */}
              <td className="border border-gray-300 px-2 py-1 whitespace-nowrap">
                {formatSpecimenCode(
                  spec.dikDunwandig,
                  SPECIMEN_CODES.dikDunwandig,
                  lang,
                ) ?? "-"}
                {spec.dikDunwandig && spec.monstermethode && " / "}
                {formatSpecimenCode(
                  spec.monstermethode,
                  SPECIMEN_CODES.monstermethode,
                  lang,
                ) ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
