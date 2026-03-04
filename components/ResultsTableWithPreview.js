import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FIELDS, SEARCHABLE_FIELDS } from "@/lib/constants";
import { normalizeString } from "@/lib/normalizeString";
import QuickPreviewModal from "./QuickPreviewModal";

export default function ResultsTableWithPreview({ items, filters }) {
  const router = useRouter();
  const [previewItem, setPreviewItem] = useState(null);

  const qs = router.asPath.includes("?")
    ? `?${router.asPath.split("?")[1]}`
    : "";

  const formatRange = (start, end) => {
    const s = String(start ?? "").trim();
    const e = String(end ?? "").trim();
    if (!s && !e) return "";
    if (s && !e) return `${s}—–`;
    if (!s && e) return `——${e}`;
    return `${s}—${e}`;
  };

  // Kogume kõik otsingusõnad filtritest
  const searchTerms = [];
  if (filters?.query) {
    searchTerms.push(
      ...normalizeString(filters.query).split(/\s+/).filter(Boolean)
    );
  }
  if (filters?.name) {
    searchTerms.push(
      ...normalizeString(filters.name).split(/\s+/).filter(Boolean)
    );
  }

  return (
    <>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "120px" }}>Tegevus</th>
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
              const guild = item[FIELDS.PROFESSION] || "";
              const rank = item[FIELDS.RANK] || "";

              const href = id ? `/meister/${id}${qs}` : "#";

              return (
                <tr key={id ?? `row-${idx}`}>
                  <td>
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="quick-preview-btn"
                      aria-label={`Kiirvaade: ${name}`}
                    >
                      Kiirvaade
                    </button>
                  </td>
                  <td>
                    <Link
                      href={href}
                      className="row-link"
                      aria-label={`${name} — ava detail`}
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

      {previewItem && (
        <QuickPreviewModal
          item={previewItem}
          searchTerms={searchTerms}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </>
  );
}
