import Link from "next/link";
import { useRouter } from "next/router";
import { FIELDS } from "@/lib/constants";

export default function ResultsTable({ items }) {
  const router = useRouter();
  const qs = router.asPath.includes("?")
    ? `?${router.asPath.split("?")[1]}`
    : "";

  const formatRange = (start, end) => {
    const s = (start || "").trim();
    const e = (end || "").trim();
    if (!s && !e) return "";
    return `${s || "—"}–${e || "—"}`;
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nimi</th>
            <th>Tegutsemisaeg</th>
            <th>Tegutsemiskoht</th>
            <th>Tsunft</th>
            <th>Ametiaste</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const id = item[FIELDS.ID] ?? item.ID ?? item.id;

            // nimi
            const first =
              item[FIELDS.NAME?.FIRST] ?? item.eesnimi ?? item.Eesnimi ?? "";
            const last =
              item[FIELDS.NAME?.LAST] ??
              item.perekonnanimi ??
              item.Perekonnanimi ??
              "";
            const name =
              [first, last].filter(Boolean).join(" ").trim() || `Kirje #${id}`;

            // aeg
            const start =
              item[FIELDS.TIME?.START] ?? item.aeg_algus ?? item.aegAlgus ?? "";
            const end =
              item[FIELDS.TIME?.END] ?? item.aeg_lopp ?? item.aegLopp ?? "";
            const period = formatRange(start, end);

            // koht / tsunft / ametiaste
            const workplace =
              item[FIELDS.WORKPLACE] ??
              item.tegutsemiskoht ??
              item.Tegutsemiskoht ??
              "";
            const guild =
              item[FIELDS.GUILD] ?? item.tsunft ?? item.Tsunft ?? "";
            const rank =
              item[FIELDS.RANK] ?? item.ametiaste ?? item.Ametiaste ?? "";

            return (
              <tr key={id}>
                <td>
                  <Link
                    href={`/meister/${id}${qs}`}
                    className="row-link"
                    aria-label={`${name} – ava detail`}
                  >
                    <span className="row-link__text">{name}</span>
                    <span className="row-link__icon" aria-hidden>
                      <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        fill="currentColor"
                      >
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </span>
                  </Link>
                </td>
                <td>{period}</td>
                <td>{workplace}</td>
                <td>{guild}</td>
                <td>{rank}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
