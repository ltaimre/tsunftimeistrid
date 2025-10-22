// pages/index.js
"use client";
import FiltersPanel from "@/components/FiltersPanel";
import ResultsView from "@/components/ResultsView";
import useSearchData from "@/hooks/useSearchData";
import useFilteredData from "@/hooks/useFilteredData";
import usePersistentFilters from "@/hooks/usePersistentFilters";
import { getInitialFilters } from "@/lib/filters";

export default function Home() {
  const { data, options, error } = useSearchData();
  const [filters, setFilters] = usePersistentFilters(getInitialFilters); // ⟵ uus
  const filtered = useFilteredData(data, filters);

  return (
    <div className="home-container">
      <h1 className="page-title">Tsunftiga seotud meistrid</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <FiltersPanel
        filters={filters}
        setFilters={setFilters}
        options={options}
      />
      <ResultsView filtered={filtered} />
    </div>
  );
}
