// pages/search.js
import Head from "next/head";
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
    revalidate: 60,
  };
}

export default function SearchPage({ initialData }) {
  const { data, options, error, isLoading } = useSearchData({ initialData });
  const [filters, setFilters] = usePersistentFilters(getInitialFilters);
  const filtered = useFilteredData(data || [], filters || {});

  return (
    <div className="home-container">
      <Head>
        <title>Otsing - TsunftimeistridOtsing</title>
        <meta name="og:title" content="Tsunftimeistrid otsing" />
      </Head>

      <h1 className="page-title">Tsunftiga seotud meistrid</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <FiltersPanel
        filters={filters}
        setFilters={setFilters}
        options={options || {}}
      />
      <ResultsView
        filtered={filtered}
        isReady={!isLoading}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
}
