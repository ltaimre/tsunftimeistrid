import Link from "next/link";
import { useRouter } from "next/router";
import { FIELDS } from "@/lib/constants";

export default function ResultsTable({ items }) {
  const router = useRouter();
  const qs = router.asPath.includes("?")
    ? `?${router.asPath.split("?")[1]}`
    : "";

  const formatRange = (start, end) => {
    const s = String(start ?? "").trim();
    const e = String(end ?? "").trim();
    if (!s && !e) return ""; // mõlemad tühjad → hiljem proovime fallbacki
    if (s && !e) return `${s}–—`; // ainult algus
    if (!s && e) return `—–${e}`; // ainult lõpp
    return `${s}–${e}`;
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
          {items.map((item, idx) => {
            const id = item[FIELDS.ID];
            const first = item[FIELDS.NAME.FIRST] || "";
            const last = item[FIELDS.NAME.LAST] || "";
            const name =
              [first, last].filter(Boolean).join(" ").trim() ||
              (id ? `Kirje #${id}` : `Kirje ${idx + 1}`);

            // Aeg: põhisammud FROM/TO, muidu fallback ONE_SOURCE või MASTER_YEAR
            const startRaw = item[FIELDS.YEARS.FROM];
            const endRaw = item[FIELDS.YEARS.TO];
            let period = formatRange(startRaw, endRaw);
            if (!period) {
              const one = item[FIELDS.YEARS.ONE_SOURCE];
              const master = item[FIELDS.YEARS.MASTER_YEAR];
              const fallbackYear =
                (one && String(one).trim()) ||
                (master && String(master).trim()) ||
                "";
              period = fallbackYear || "—";
            }

            const workplace = item[FIELDS.WORKPLACE] || "";
            const guild = item[FIELDS.PROFESSION] || ""; // tsunft
            const rank = item[FIELDS.RANK] || "";

            const href = id ? `/meister/${id}${qs}` : "#";

            return (
              <tr key={id ?? `row-${idx}`}>
                <td>
                  <Link
                    href={href}
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
