"use client";
import React, { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ResultsTable from "./ResultsTable";
import Pagination from "./Pagination";
import SearchSummary from "./SearchSummary";
import { RESULTS_PER_PAGE as DEFAULT_PAGE_SIZE } from "@/lib/constants"; // loo see konstant

/**
 * Props:
 * - filtered: kogu filtreeritud massiiv (Array<object>)
 * - pageSize?: number (kui tahad vaikimisi konstandist erineda)
 * - queryKeyPage?: string (vaikimisi "page")
 * - queryKeyPageSize?: string (vaikimisi "pageSize")
 *
 * URL sünkroon:
 *   /…?page=2&pageSize=20
 */
export default function ResultsView({
  filtered,
  pageSize = DEFAULT_PAGE_SIZE ?? 20,
  queryKeyPage = "page",
  queryKeyPageSize = "pageSize",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // loe URL-ist
  const urlPage = Number(searchParams.get(queryKeyPage) || "1");
  const urlPageSize = Number(
    searchParams.get(queryKeyPageSize) || String(pageSize)
  );

  const effectivePageSize =
    Number.isFinite(urlPageSize) && urlPageSize > 0 ? urlPageSize : pageSize;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / effectivePageSize));
  const current =
    Number.isFinite(urlPage) && urlPage >= 1
      ? Math.min(urlPage, totalPages)
      : 1;

  // arvuta slice
  const { pageItems, from, to } = useMemo(() => {
    const start = (current - 1) * effectivePageSize;
    const end = Math.min(start + effectivePageSize, total);
    return {
      pageItems: filtered.slice(start, end),
      from: total === 0 ? 0 : start + 1,
      to: end,
    };
  }, [filtered, current, effectivePageSize, total]);

  // kui filtrid muutuvad (massivi referents muutub), läheb leht 1 peale
  useEffect(() => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set(queryKeyPage, "1");
    sp.set(queryKeyPageSize, String(effectivePageSize));
    router.replace(`?${sp.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  // lehe vahetus -> URL-i uuendus
  const setPage = (next) => {
    const clamped = Math.max(1, Math.min(next, totalPages));
    const sp = new URLSearchParams(searchParams.toString());
    sp.set(queryKeyPage, String(clamped));
    sp.set(queryKeyPageSize, String(effectivePageSize));
    router.push(`?${sp.toString()}`, { scroll: false });
  };

  // (valikuline) lehekülje suuruse muutmine – kui tahad kuvada valikut
  const setPageSize = (nextSize) => {
    const size = Math.max(1, Number(nextSize) || pageSize);
    const sp = new URLSearchParams(searchParams.toString());
    sp.set(queryKeyPageSize, String(size));
    sp.set(queryKeyPage, "1"); // uue suurusega algusesse
    router.push(`?${sp.toString()}`, { scroll: false });
  };

  return (
    <section className="results-view">
      <div className="results-toolbar">
        <SearchSummary total={total} from={from} to={to} />
        {/* (valikuline) lehekülje suuruse valik – soovi korral näita: */}
        {/* 
        <label className="page-size">
          Vastuseid lehel:
          <select
            value={effectivePageSize}
            onChange={(e) => setPageSize(e.target.value)}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        */}
      </div>

      <ResultsTable items={pageItems} />

      <Pagination
        current={current}
        totalPages={totalPages}
        onChange={setPage}
      />
    </section>
  );
}
