"use client";
import { useEffect, useMemo, useState } from "react";
import { FIELDS } from "@/lib/constants";

/**
 * Kasutus:
 * const { data, options, error, isLoading } = useSearchData({ initialData });
 *
 * - Kui initialData on olemas (SSR/ISR), ei fetchita /api/data.
 * - isLoading on true kuni data on olemas ja options arvutatud.
 */
export default function useSearchData({ initialData } = {}) {
  // NB: hoiame 'data' algselt nullina kui initialData puudub,
  // et tarbijad ei kuvaks "0" enne, kui päris andmed on käes.
  const [data, setData] = useState(() => initialData || null);
  const [options, setOptions] = useState(null);
  const [error, setError] = useState(null);

  const etCollator = useMemo(() => new Intl.Collator("et"), []);
  const toOneWord = (s) => (s || "").trim().split(/\s+/)[0];
  const splitMulti = (s) =>
    (s || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  // Ehita options lokaalselt
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

    // Grupeeri riikide kaupa; kui map puudub, kasutame "Määramata"
    const byCountry = new Map(); // country -> Set(cities)
    for (const city of allJobs) {
      const country = (cityCountryMap && cityCountryMap[city]) || "Määramata";
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
        console.warn(
          "Valikute (city->country) laadimine ebaõnnestus, kasutan 'Määramata'.",
          e
        );
        return {}; // jätkame ilma kaardita
      }
    }

    async function loadAll() {
      try {
        // 1) Andmed: kui initialData puudub, lae /api/data
        let rows = data;
        if (!rows) {
          const r1 = await fetch("/api/data", { signal: controller.signal });
          if (!r1.ok) throw new Error(`API /data error: ${r1.status}`);
          const json = await r1.json();
          rows = json?.data || [];
          if (cancelled) return;
          setData(rows);
        }

        // 2) Options: ehita; vajadusel lae cityCountryMap
        // Kui options juba olemas (nt upstreamist), jäta vahele.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etCollator]); // etCollator on stabiilne, muud sõltuvused hallatakse sees

  // isLoading: kuni data ja options on valmis
  const isLoading = !data || !options;

  return { data, options, error, isLoading };
}
