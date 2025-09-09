// pages/index.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Filters from "@/components/Filters";
import ActiveFilters from "@/components/ActiveFilters";
import { getInitialFilters } from "@/lib/filters";
import { filterData } from "@/lib/filterData";
import { FIELDS } from "@/lib/constants";

export default function Home() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState(getInitialFilters());
  const [options, setOptions] = useState({
    jobs: [],
    jobsByCountry: [],
    professions: [],
    ranks: [],
  });
  const [error, setError] = useState(null);

  const etCollator = useMemo(() => new Intl.Collator("et"), []);
  const toOneWord = (s) => (s || "").trim().split(/\s+/)[0];
  const splitMulti = (s) =>
    (s || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  useEffect(() => {
    async function load() {
      try {
        // 1) põhiandmed
        const r1 = await fetch("/api/data");
        if (!r1.ok) throw new Error(`API /data error: ${r1.status}`);
        const { data: rows } = await r1.json();

        // 2) valikud (city->country)
        const r2 = await fetch("/api/valikud");
        if (!r2.ok) throw new Error(`API /valikud error: ${r2.status}`);
        const { map: cityCountryMap } = await r2.json();

        setData(rows);
        setFiltered(rows);

        const allJobs = new Set();
        const allProfessions = new Set();
        const allRanks = new Set();

        rows.forEach((item) => {
          splitMulti(item[FIELDS.WORKPLACE]).forEach((w) =>
            allJobs.add(toOneWord(w))
          );
          splitMulti(item[FIELDS.PROFESSION]).forEach(
            (p) => p && allProfessions.add(p)
          );
          splitMulti(item[FIELDS.RANK]).forEach((r) => r && allRanks.add(r));
        });

        // Grupeeri riikide kaupa Valikute kaardi alusel
        const byCountry = new Map(); // country -> Set(cities)
        for (const city of allJobs) {
          const country = cityCountryMap[city] || "Määramata";
          if (!byCountry.has(country)) byCountry.set(country, new Set());
          byCountry.get(country).add(city);
        }

        const jobsByCountry = Array.from(byCountry.entries())
          .sort(([a], [b]) => etCollator.compare(a, b))
          .map(([country, cities]) => ({
            country,
            cities: Array.from(cities).sort(etCollator.compare),
          }));

        setOptions({
          jobs: Array.from(allJobs).sort(etCollator.compare),
          jobsByCountry,
          professions: Array.from(allProfessions).sort(etCollator.compare),
          ranks: Array.from(allRanks).sort(etCollator.compare),
        });
      } catch (err) {
        console.error("Andmete laadimine ebaõnnestus:", err);
        setError("Andmete laadimisel tekkis viga.");
      }
    }
    load();
  }, [etCollator]);

  // hoia filtreerimisel linnad ühesõnaliselt
  useEffect(() => {
    const patched = { ...filters, job: (filters.job || []).map(toOneWord) };
    setFiltered(filterData(data, patched));
  }, [filters, data]);

  return (
    <div className="home-container">
      <h1 className="page-title">Tsunftiga seotud meistrid</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <Filters filters={filters} setFilters={setFilters} options={options} />

      {(filters.query ||
        filters.job?.length ||
        filters.profession?.length ||
        filters.rank?.length ||
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
                  <Link href={`/meister/${item[FIELDS.ID]}`}>
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
