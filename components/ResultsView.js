// components/ResultsView.jsx
"use client";
import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import ResultsTable from "./ResultsTable";
import Pagination from "./Pagination";
import SearchSummary from "./SearchSummary";
import { RESULTS_PER_PAGE as DEFAULT_PAGE_SIZE } from "@/lib/constants";

export default function ResultsView({
  filtered,
  pageSize = DEFAULT_PAGE_SIZE ?? 20,
  queryKeyPage = "page",
  queryKeyPageSize = "pageSize",
}) {
  const router = useRouter();
  const { asPath, pathname, isReady } = router;

  // loe query-string (pages-routeris mugavaim viis)
  const search = asPath.split("?")[1] || "";
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const urlPage = Number(params.get(queryKeyPage) || "1");
  const urlPageSize = Number(params.get(queryKeyPageSize) || String(pageSize));

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

  // util: ehita ja pane URL
  const pushParams = (upd) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(upd).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") next.delete(k);
      else next.set(k, String(v));
    });
    const qs = next.toString();
    // shallow + no scroll
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, undefined, {
      shallow: true,
      scroll: false,
    });
  };

  // filtrite muutumisel → tagasi lehele 1 (ja hoia pageSize)
  useEffect(() => {
    if (!isReady) return;
    // ära tee asjatut navigatsiooni, kui juba 1
    if ((params.get(queryKeyPage) || "1") !== "1") {
      pushParams({
        [queryKeyPage]: 1,
        [queryKeyPageSize]: effectivePageSize,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, isReady]);

  const setPage = (next) => {
    const clamped = Math.max(1, Math.min(next, totalPages));
    pushParams({
      [queryKeyPage]: clamped,
      [queryKeyPageSize]: effectivePageSize,
    });
  };

  // (valikuline) lehekülje suuruse muutus – kui otsustad UI-s lubada
  const setPageSize = (nextSize) => {
    const size = Math.max(1, Number(nextSize) || pageSize);
    pushParams({
      [queryKeyPageSize]: size,
      [queryKeyPage]: 1, // uue suurusega esimesse lehte
    });
  };

  return (
    <section className="results-view">
      <div className="results-toolbar">
        <SearchSummary total={total} from={from} to={to} />
        {/* Kui tahad lubada pageSize valikut, ava allolev blokk:
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
        </label> */}
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
