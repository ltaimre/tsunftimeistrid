"use client";
import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import ResultsTable from "./ResultsTable";
import Pagination from "./Pagination";
import SearchSummary from "./SearchSummary";
import useDebouncedEffect from "@/hooks/useDebouncedEffect";
import { RESULTS_PER_PAGE as DEFAULT_PAGE_SIZE } from "@/lib/constants";

export default function ResultsView({
  filtered,
  pageSize = DEFAULT_PAGE_SIZE ?? 20,
  queryKeyPage = "page",
  queryKeyPageSize = "pageSize",
}) {
  const router = useRouter();
  const { asPath, pathname, isReady } = router;

  // 1) loe query
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

  // 2) slice vaate jaoks
  const { pageItems, from, to } = useMemo(() => {
    const start = (current - 1) * effectivePageSize;
    const end = Math.min(start + effectivePageSize, total);
    return {
      pageItems: filtered.slice(start, end),
      from: total === 0 ? 0 : start + 1,
      to: end,
    };
  }, [filtered, current, effectivePageSize, total]);

  // util: push/replace params
  const replaceParams = (upd) => {
    // muuda URL-i ainult / lehel
    if (pathname !== "/") return;

    const next = new URLSearchParams(params.toString());
    Object.entries(upd).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") next.delete(k);
      else next.set(k, String(v));
    });
    const qs = next.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, undefined, {
      shallow: true,
      scroll: false,
    });
  };

  const pushParams = (upd) => {
    if (pathname !== "/") return;
    const next = new URLSearchParams(params.toString());
    Object.entries(upd).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") next.delete(k);
      else next.set(k, String(v));
    });
    const qs = next.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, undefined, {
      shallow: true,
      scroll: false,
    });
  };

  // 3) kui filtered muutub, mine (debounce'itult) lehele 1 — ainult siis, kui praegu pole 1
  useDebouncedEffect(
    () => {
      if (!isReady) return;
      if (pathname !== "/") return;

      const currentPageStr = params.get(queryKeyPage) || "1";
      if (currentPageStr === "1") return; // juba 1, ära tee asjatut replace'i

      replaceParams({
        [queryKeyPage]: 1,
        [queryKeyPageSize]: effectivePageSize,
      });
    },
    [
      filtered,
      isReady,
      pathname,
      effectivePageSize,
      queryKeyPage,
      queryKeyPageSize,
    ],
    250
  );

  // 4) lehe vahetus (kasuta push, et ajaloos oleks leheküljevahetused)
  const setPage = (next) => {
    const clamped = Math.max(1, Math.min(next, totalPages));
    pushParams({
      [queryKeyPage]: clamped,
      [queryKeyPageSize]: effectivePageSize,
    });
  };

  return (
    <section className="results-view">
      <div className="results-toolbar">
        <SearchSummary total={total} from={from} to={to} />
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
