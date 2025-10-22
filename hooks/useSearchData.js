"use client";
import { useEffect, useMemo, useState } from "react";
import { FIELDS } from "@/lib/constants";

/**
 * Laeb /api/data ja /api/valikud ning koostab:
 * - data (read)
 * - options: { jobs, jobsByCountry, professions, ranks }
 * - error (string|null)
 */
export default function useSearchData() {
  const [data, setData] = useState([]);
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
    let cancelled = false;

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

        if (cancelled) return;

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

        setData(rows);
        setOptions({
          jobs: Array.from(allJobs).sort(etCollator.compare),
          jobsByCountry,
          professions: Array.from(allProfessions).sort(etCollator.compare),
          ranks: Array.from(allRanks).sort(etCollator.compare),
        });
        setError(null);
      } catch (err) {
        console.error("Andmete laadimine ebaõnnestus:", err);
        setError("Andmete laadimisel tekkis viga.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [etCollator]);

  return { data, options, error };
}
