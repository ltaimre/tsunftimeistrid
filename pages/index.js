import { useEffect, useState } from "react";
import Link from "next/link";
import Filters from "@/components/Filters";
import ActiveFilters from "@/components/ActiveFilters";
import { FIELDS } from "@/lib/constants";
import { filterData } from "@/lib/filterData";

export default function Home() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({
    query: "",
    job: [],
    profession: [],
    years: { from: "", to: "" },
  });
  const [options, setOptions] = useState({ jobs: [], professions: [] });

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setFiltered(result);

        const allJobs = new Set();
        const allProfessions = new Set();

        result.forEach((item) => {
          item[FIELDS.WORKPLACE]?.split(",").map((w) => allJobs.add(w.trim()));
          item[FIELDS.PROFESSION]
            ?.split(",")
            .map((p) => allProfessions.add(p.trim()));
        });

        setOptions({
          jobs: Array.from(allJobs),
          professions: Array.from(allProfessions),
        });
      });
  }, []);

  useEffect(() => {
    setFiltered(filterData(data, filters));
  }, [filters, data]);

  return (
    <div className="home-container">
      <h1 className="page-title">Tsunftiga seotud meistrid</h1>

      <Filters filters={filters} setFilters={setFilters} options={options} />
      {(filters.query ||
        filters.job ||
        filters.profession ||
        filters.years.from ||
        filters.years.to) && (
        <button
          className="clear-filters-btn"
          onClick={() =>
            setFilters({
              query: "",
              job: "",
              profession: "",
              years: { from: "", to: "" },
            })
          }
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
