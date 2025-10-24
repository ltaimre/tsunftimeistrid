// pages/index.js
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
    revalidate: 600,
  };
}

export default function Home({ initialData }) {
  const { data, options, error, isLoading } = useSearchData({ initialData });
  const [filters, setFilters] = usePersistentFilters(getInitialFilters);
  const filtered = useFilteredData(data || [], filters || {});

  return (
    <div className="home-container">
      <Head>
        <title>Tsunftimeistrid</title>
        <meta name="og:title" content="tsunftimeisrid" />
      </Head>

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
