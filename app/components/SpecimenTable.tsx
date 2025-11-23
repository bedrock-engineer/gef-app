import { useTranslation } from "react-i18next";
import type { BoreSpecimen } from "~/util/gef-bore";
import { SPECIMEN_CODES } from "~/util/gef-bore";

function getCodeDescription(
  code: string | undefined,
  codeList: ReadonlyArray<{ code: string; description: string }>
): string {
  if (!code) return "-";
  const found = codeList.find((c) => c.code === code);
  return found ? `${code} (${found.description})` : code;
}

interface SpecimenTableProps {
  specimens: Array<BoreSpecimen>;
}

export function SpecimenTable({ specimens }: SpecimenTableProps) {
  const { t } = useTranslation();

  if (specimens.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-semibold mb-2">
        {t("specimensCount", { count: specimens.length })}
      </h3>

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
            <th className="border border-gray-300 px-2 py-1 text-left">{t("number")}</th>
            <th className="border border-gray-300 px-2 py-1 text-left">{t("code")}</th>
            <th className="border border-gray-300 px-2 py-1 text-left">
              {t("depthM_table")}
            </th>
            <th className="border border-gray-300 px-2 py-1 text-left">
              {t("diameterMm")}
            </th>
            <th className="border border-gray-300 px-2 py-1 text-left">
              {t("dateTime")}
            </th>
            <th className="border border-gray-300 px-2 py-1 text-left">{t("type")}</th>
            <th className="border border-gray-300 px-2 py-1 text-left">
              {t("method")}
            </th>
          </tr>
        </thead>

        <tbody>
          {specimens.map((spec) => (
            <tr key={spec.specimenNumber} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-2 py-1">
                {spec.specimenNumber}
              </td>
              <td className="border border-gray-300 px-2 py-1">
                {spec.monstercode ?? "-"}
              </td>
              <td className="border border-gray-300 px-2 py-1">
                {spec.depthTop.toFixed(2)} - {spec.depthBottom.toFixed(2)}
              </td>
              <td className="border border-gray-300 px-2 py-1">
                {spec.diameterMonster != null
                  ? spec.diameterMonster.toFixed(1)
                  : "-"}
              </td>
              <td className="border border-gray-300 px-2 py-1">
                {spec.monsterdatum ?? "-"}
                {spec.monstertijd && ` ${spec.monstertijd}`}
              </td>
              <td className="border border-gray-300 px-2 py-1">
                <span
                  title={getCodeDescription(
                    spec.geroerdOngeroerd,
                    SPECIMEN_CODES.geroerd
                  )}
                >
                  {spec.geroerdOngeroerd ?? "-"}
                </span>
                {" / "}
                <span
                  title={getCodeDescription(
                    spec.monstersteekapparaat,
                    SPECIMEN_CODES.monstersteekapparaat
                  )}
                >
                  {spec.monstersteekapparaat ?? "-"}
                </span>
                {" / "}
                <span
                  title={getCodeDescription(
                    spec.dikDunwandig,
                    SPECIMEN_CODES.dikDunwandig
                  )}
                >
                  {spec.dikDunwandig ?? "-"}
                </span>
              </td>
              <td className="border border-gray-300 px-2 py-1">
                <span
                  title={getCodeDescription(
                    spec.monstermethode,
                    SPECIMEN_CODES.monstermethode
                  )}
                >
                  {spec.monstermethode ?? "-"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
