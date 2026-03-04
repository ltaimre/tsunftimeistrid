// pages/searchtest.js
import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";
import FiltersPanel from "@/components/FiltersPanel";
import ResultsTableWithPreview from "@/components/ResultsTableWithPreview";
import SearchSummary from "@/components/SearchSummary";
import Pagination from "@/components/Pagination";
import useSearchData from "@/hooks/useSearchData";
import useFilteredData from "@/hooks/useFilteredData";
import usePersistentFilters from "@/hooks/usePersistentFilters";
import { getInitialFilters } from "@/lib/filters";
import { fetchData } from "@/utils/fetchData";
import { RESULTS_PER_PAGE } from "@/lib/constants";

export async function getStaticProps() {
  const parsed = await fetchData();
  return {
    props: { initialData: parsed?.data || [] },
    revalidate: 600,
  };
}

export default function SearchTestPage({ initialData }) {
  const { data, options, error, isLoading } = useSearchData({ initialData });
  const [filters, setFilters] = usePersistentFilters(getInitialFilters);
  const filtered = useFilteredData(data || [], filters || {});

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Pagination
  const current = Number(filters?.page) || 1;
  const total = filtered.length;
  const pageSize = RESULTS_PER_PAGE || 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedCurrent = Math.max(1, Math.min(current, totalPages));

  const start = (clampedCurrent - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = filtered.slice(start, end);
  const from = total === 0 ? 0 : start + 1;
  const to = end;

  // Reset page kui filtrid muutuvad
  const prevFilterHashRef = useRef("");
  useEffect(() => {
    if (!mounted) return;

    const { page, ...filtersWithoutPage } = filters || {};
    const hash = JSON.stringify(filtersWithoutPage);

    if (prevFilterHashRef.current && prevFilterHashRef.current !== hash) {
      if (current !== 1) {
        setFilters((prev) => ({ ...prev, page: 1 }));
      }
    }
    prevFilterHashRef.current = hash;
  }, [filters, mounted, current, setFilters]);

  const setPage = (nextPage) => {
    const clamped = Math.max(1, Math.min(nextPage, totalPages));
    setFilters((prev) => ({ ...prev, page: clamped }));
  };

  return (
    <div className="home-container">
      <Head>
        <title>Otsing (Test) - Tsunftimeistrid</title>
        <meta name="og:title" content="Tsunftimeistrid otsing test" />
      </Head>

      <h1 className="page-title">Tsunftiga seotud meistrid (Test versioon)</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <FiltersPanel
        filters={filters}
        setFilters={setFilters}
        options={options || {}}
      />

      <section className="results-view">
        <div className="results-toolbar">
          <SearchSummary
            total={total}
            from={from}
            to={to}
            isReady={!isLoading && mounted}
          />
        </div>

        {!isLoading && mounted ? (
          <>
            <ResultsTableWithPreview items={pageItems} filters={filters} />
            <Pagination
              current={clampedCurrent}
              totalPages={totalPages}
              onChange={setPage}
            />
          </>
        ) : (
          <div className="results-skeleton">Laadin andmeid…</div>
        )}
      </section>
    </div>
  );
}
