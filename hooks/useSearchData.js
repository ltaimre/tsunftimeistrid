"use client";
import { useEffect, useMemo, useState } from "react";
import { FIELDS } from "@/lib/constants";

export default function useSearchData({ initialData } = {}) {
  const [data, setData] = useState(initialData || null);
  const [options, setOptions] = useState(null);
  const [error, setError] = useState(null);

  const etCollator = useMemo(() => new Intl.Collator("et"), []);
  const toOneWord = (s) => (s || "").trim().split(/\s+/)[0];
  const splitMulti = (s) =>
    (s || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  const buildOptions = (rows, cityCountryMap) => {
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

    // Grupeeri riikide kaupa
    const byCountry = new Map();
    for (const city of allJobs) {
      const country = cityCountryMap && cityCountryMap[city];

      // ⬅️ UUUS: Jäta vahele kui riik puudub (ei lisa "Määramata")
      if (!country) continue;

      if (!byCountry.has(country)) byCountry.set(country, new Set());
      byCountry.get(country).add(city);
    }

    const jobsByCountry = Array.from(byCountry.entries())
      .sort(([a], [b]) => etCollator.compare(a, b))
      .map(([country, cities]) => ({
        country,
        cities: Array.from(cities).sort(etCollator.compare),
      }));

    return {
      jobs: Array.from(allJobs).sort(etCollator.compare),
      jobsByCountry,
      professions: Array.from(allProfessions).sort(etCollator.compare),
      ranks: Array.from(allRanks).sort(etCollator.compare),
    };
  };

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function ensureCityCountryMap() {
      try {
        const r = await fetch("/api/valikud", { signal: controller.signal });
        if (!r.ok) throw new Error(`API /valikud error: ${r.status}`);
        const { map } = await r.json();
        return map || {};
      } catch (e) {
        console.warn("Valikute (city->country) laadimine ebaõnnestus.", e);
        return {};
      }
    }

    async function loadAll() {
      try {
        let rows = data;
        if (!rows) {
          const r1 = await fetch("/api/data", { signal: controller.signal });
          if (!r1.ok) throw new Error(`API /data error: ${r1.status}`);
          const json = await r1.json();
          rows = json?.data || [];
          if (cancelled) return;
          setData(rows);
        }

        if (!options) {
          const cityCountryMap = await ensureCityCountryMap();
          if (cancelled) return;
          const built = buildOptions(rows, cityCountryMap);
          setOptions(built);
        }

        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error("Andmete laadimine ebaõnnestus:", err);
        setError("Andmete laadimisel tekkis viga.");
      }
    }

    loadAll();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [etCollator]);

  const isLoading = !data || !options;

  return { data, options, error, isLoading };
}
