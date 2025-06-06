import { useEffect, useState } from "react";
import { getInitialFilters } from "@/lib/filters";
import Link from "next/link";
import Filters from "@/components/Filters";
import ActiveFilters from "@/components/ActiveFilters";
import { FIELDS } from "@/lib/constants";
import { filterData } from "@/lib/filterData";

export default function Home() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState(getInitialFilters());
  const [options, setOptions] = useState({
    jobs: [],
    professions: [],
    ranks: [],
  });
  const [error, setError] = useState(null); // <-- errori state

  useEffect(() => {
    fetch("/api/data")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        return res.json();
      })
      .then((result) => {
        const parsedData = result.data;
        setData(parsedData);
        setFiltered(parsedData);

        const allJobs = new Set();
        const allProfessions = new Set();
        const allRanks = new Set(); // ⬅️ Ametiastmed

        parsedData.forEach((item) => {
          item[FIELDS.WORKPLACE]
            ?.split(",")
            .forEach((w) => allJobs.add(w.trim()));

          item[FIELDS.PROFESSION]
            ?.split(",")
            .forEach((p) => allProfessions.add(p.trim()));

          item[FIELDS.RANK]?.split(",").forEach((r) => allRanks.add(r.trim()));
        });

        setOptions({
          jobs: Array.from(allJobs),
          professions: Array.from(allProfessions),
          ranks: Array.from(allRanks), // ⬅️ Uus väärtus ranks jaoks
        });
      })
      .catch((err) => {
        console.error("Andmete laadimine ebaõnnestus:", err);
        setError("Andmete laadimisel tekkis viga.");
      });
  }, []);

  useEffect(() => {
    setFiltered(filterData(data, filters));
  }, [filters, data]);

  return (
    <div className="home-container">
      <h1 className="page-title">Tsunftiga seotud meistrid</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Filters filters={filters} setFilters={setFilters} options={options} />
      {(filters.query ||
        filters.job?.length ||
        filters.profession?.length ||
        filters.years.from ||
        filters.years.to) && (
        <button
          onClick={() => setFilters(getInitialFilters())}
          className="clear-filters-btn"
        >
          Tühjenda filtrid
        </button>
      )}
      <ActiveFilters filters={filters} setFilters={setFilters} />
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Eesnimi</th>
              <th>Perekonnanimi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, index) => (
              <tr key={index}>
                <td>
                  <Link href={`/meister/${index}`}>
                    {item[FIELDS.NAME.FIRST]}
                  </Link>
                </td>
                <td>{item[FIELDS.NAME.LAST]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
