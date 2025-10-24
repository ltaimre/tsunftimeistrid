// pages/index.js
import FiltersPanel from "@/components/FiltersPanel";
import ResultsView from "@/components/ResultsView";
import useSearchData from "@/hooks/useSearchData";
import useFilteredData from "@/hooks/useFilteredData";
import usePersistentFilters from "@/hooks/usePersistentFilters";
import { getInitialFilters } from "@/lib/filters";
import { fetchData } from "@/utils/fetchData";

export async function getStaticProps() {
  const parsed = await fetchData();
  return {
    props: { initialData: parsed?.data || [] },
    revalidate: 600,
  };
}

export default function Home({ initialData }) {
  const { data, options, error, isLoading } = useSearchData({ initialData });
  const [filters, setFilters] = usePersistentFilters(getInitialFilters);

  // ⬇️ KUTSU ALATI — anna ohutu vaikimisi väärtus
  const filtered = useFilteredData(data || [], filters || {});

  return (
    <div className="home-container">
      <h1 className="page-title">Tsunftiga seotud meistrid</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <FiltersPanel
        filters={filters}
        setFilters={setFilters}
        options={options || {}}
      />

      <ResultsView filtered={filtered} isReady={!isLoading} />
    </div>
  );
}
