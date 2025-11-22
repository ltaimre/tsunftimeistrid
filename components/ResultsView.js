// components/ResultsView.jsx
"use client";
import React, { useMemo, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import ResultsTable from "./ResultsTable";
import Pagination from "./Pagination";
import SearchSummary from "./SearchSummary";
import { RESULTS_PER_PAGE as DEFAULT_PAGE_SIZE } from "@/lib/constants";

export default function ResultsView({
  filtered,
  isReady = false,
  pageSize = DEFAULT_PAGE_SIZE ?? 20,
  queryKeyPage = "page",
  queryKeyPageSize = "pageSize",
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const routerReady = router.isReady && mounted;
  const ready = isReady && routerReady;

  const search = routerReady ? router.asPath.split("?")[1] || "" : "";
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const items = Array.isArray(filtered) ? filtered : [];
  const urlPage = Number(params.get(queryKeyPage) || "1");
  const urlPageSize = Number(params.get(queryKeyPageSize) || String(pageSize));
  const effectivePageSize =
    Number.isFinite(urlPageSize) && urlPageSize > 0 ? urlPageSize : pageSize;

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / effectivePageSize));
  const current =
    Number.isFinite(urlPage) && urlPage >= 1
      ? Math.min(urlPage, totalPages)
      : 1;

  const { pageItems, from, to } = useMemo(() => {
    const start = (current - 1) * effectivePageSize;
    const end = Math.min(start + effectivePageSize, total);
    return {
      pageItems: items.slice(start, end),
      from: total === 0 ? 0 : start + 1,
      to: end,
    };
  }, [items, current, effectivePageSize, total]);

  // Jälgime filtreid (mitte page parameetrit)
  const filterParams = useMemo(() => {
    if (!routerReady) return "";
    const p = new URLSearchParams(params);
    p.delete(queryKeyPage); // eemalda page
    p.delete(queryKeyPageSize); // eemalda pageSize
    return p.toString();
  }, [params, routerReady, queryKeyPage, queryKeyPageSize]);

  const prevFilterParamsRef = useRef(filterParams);

  const replaceParams = (upd) => {
    if (!routerReady) return;
    const next = new URLSearchParams(params.toString());
    Object.entries(upd).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") next.delete(k);
      else next.set(k, String(v));
    });
    const qs = next.toString();
    router.replace(`${router.pathname}${qs ? `?${qs}` : ""}`, undefined, {
      shallow: true,
      scroll: false,
    });
  };

  const pushParams = (upd) => {
    if (!routerReady) return;
    const next = new URLSearchParams(params.toString());
    Object.entries(upd).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") next.delete(k);
      else next.set(k, String(v));
    });
    const qs = next.toString();
    router.push(`${router.pathname}${qs ? `?${qs}` : ""}`, undefined, {
      shallow: true,
      scroll: false,
    });
  };

  // Reset lehele 1 AINULT kui filtrid muutusid (mitte page number)
  useEffect(() => {
    if (!routerReady) return;

    // Kui filtrid muutusid (aga mitte page)
    if (prevFilterParamsRef.current !== filterParams) {
      prevFilterParamsRef.current = filterParams;

      // Kui hetkel ei ole lehel 1, siis reset
      const currentPageStr = params.get(queryKeyPage) || "1";
      if (currentPageStr !== "1") {
        replaceParams({
          [queryKeyPage]: 1,
          [queryKeyPageSize]: effectivePageSize,
        });
      }
    }
  }, [
    filterParams,
    routerReady,
    params,
    queryKeyPage,
    queryKeyPageSize,
    effectivePageSize,
  ]);

  const setPage = (next) => {
    if (!routerReady) return;
    const clamped = Math.max(1, Math.min(next, totalPages));
    pushParams({
      [queryKeyPage]: clamped,
      [queryKeyPageSize]: effectivePageSize,
    });
  };

  return (
    <section className="results-view">
      <div className="results-toolbar">
        <SearchSummary total={total} from={from} to={to} isReady={ready} />
      </div>

      {!ready ? (
        <div className="results-skeleton">Laadin andmeid…</div>
      ) : (
        <>
          <ResultsTable items={pageItems} />
          <Pagination
            current={current}
            totalPages={totalPages}
            onChange={setPage}
          />
        </>
      )}
    </section>
  );
}
