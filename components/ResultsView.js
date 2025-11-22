// components/ResultsView.jsx
"use client";
import React, { useMemo, useEffect, useState } from "react";
import ResultsTable from "./ResultsTable";
import Pagination from "./Pagination";
import SearchSummary from "./SearchSummary";
import { RESULTS_PER_PAGE as DEFAULT_PAGE_SIZE } from "@/lib/constants";

export default function ResultsView({
  filtered,
  isReady = false,
  pageSize = DEFAULT_PAGE_SIZE ?? 20,
  filters, // ⬅️ UUUS: võtame filtrid propsist
  setFilters, // ⬅️ UUUS: võtame setFilters propsist
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = Array.isArray(filtered) ? filtered : [];
  const current = Number(filters?.page) || 1; // ⬅️ UUUS: loeme filtritest

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedCurrent = Math.max(1, Math.min(current, totalPages));

  const { pageItems, from, to } = useMemo(() => {
    const start = (clampedCurrent - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    return {
      pageItems: items.slice(start, end),
      from: total === 0 ? 0 : start + 1,
      to: end,
    };
  }, [items, clampedCurrent, pageSize, total]);

  // ⬅️ UUUS: Reset lehele 1 kui filtrid muutuvad (aga mitte page)
  const prevFilterHashRef = React.useRef("");
  useEffect(() => {
    if (!isReady || !mounted) return;

    // Teeme filtritest hashi (ilma page'ta)
    const { page, ...filtersWithoutPage } = filters || {};
    const hash = JSON.stringify(filtersWithoutPage);

    if (prevFilterHashRef.current && prevFilterHashRef.current !== hash) {
      // Filtrid muutusid -> reset lehele 1
      if (current !== 1) {
        setFilters((prev) => ({ ...prev, page: 1 }));
      }
    }
    prevFilterHashRef.current = hash;
  }, [filters, isReady, mounted, current, setFilters]);

  const setPage = (nextPage) => {
    const clamped = Math.max(1, Math.min(nextPage, totalPages));
    setFilters((prev) => ({ ...prev, page: clamped }));
  };

  return (
    <section className="results-view">
      <div className="results-toolbar">
        <SearchSummary
          total={total}
          from={from}
          to={to}
          isReady={isReady && mounted}
        />
      </div>

      {!isReady || !mounted ? (
        <div className="results-skeleton">Laadin andmeid…</div>
      ) : (
        <>
          <ResultsTable items={pageItems} />
          <Pagination
            current={clampedCurrent}
            totalPages={totalPages}
            onChange={setPage}
          />
        </>
      )}
    </section>
  );
}
