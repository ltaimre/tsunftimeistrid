// hooks/usePersistentFilters.js
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useDebouncedEffect from "@/hooks/useDebouncedEffect";
import { encodeFiltersToQuery, decodeQueryToFilters } from "@/lib/filtersQuery";

const STORAGE_KEY = "filters:search";

export default function usePersistentFilters(getInitialFilters) {
  const router = useRouter();

  // ⬅️ UUUS: Salvesta getInitialFilters ref'i, et vältida lõpmatut tsüklit
  const getInitialFiltersRef = useRef(getInitialFilters);
  getInitialFiltersRef.current = getInitialFilters;

  // 1) Alusta alati deterministlike vaikimisi filtritega.
  const [filters, setFilters] = useState(() => getInitialFilters());
  const [hydrated, setHydrated] = useState(false);

  const syncingFromUrlRef = useRef(true);

  // 2) Esmane sünk pärast mounti (ja kui router on valmis):
  useEffect(() => {
    if (!router.isReady) return;

    const search =
      typeof window !== "undefined" ? window.location.search.slice(1) : "";
    let next = decodeQueryToFilters(search || "", getInitialFiltersRef.current);

    if (!hasAnyFilter(next) && typeof window !== "undefined") {
      try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (raw) next = JSON.parse(raw);
      } catch {
        // ignore
      }
    }

    setFilters(next);
    syncingFromUrlRef.current = false;
    setHydrated(true);
  }, [router.isReady]);

  // 3) Kirjuta sessionStorageisse, kui filtrid muutuvad
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      // ignore
    }
  }, [filters, hydrated]);

  // 4) Kirjuta URL-i (debounced), AINULT /search lehel
  useDebouncedEffect(
    () => {
      if (!hydrated) return;
      if (!router.isReady) return;
      if (router.pathname !== "/search") return; // ⬅️ PARANDATUD: ainult search lehel
      if (syncingFromUrlRef.current) return;

      const qs = encodeFiltersToQuery(filters);
      const nextUrl = qs ? `/search?${qs}` : `/search`;

      if (router.asPath === nextUrl) return;
      router.replace(nextUrl, undefined, { shallow: true, scroll: false });
    },
    [filters, hydrated, router.isReady, router.pathname, router.asPath],
    250
  );

  // 5) Kui kasutaja muudab queryt (back/forward või käsitsi)
  useEffect(() => {
    if (!router.isReady) return;
    if (!hydrated) return;

    const search =
      typeof window !== "undefined" ? window.location.search.slice(1) : "";
    const next = decodeQueryToFilters(
      search || "",
      getInitialFiltersRef.current
    );

    syncingFromUrlRef.current = true;
    setFilters((prev) =>
      JSON.stringify(prev) === JSON.stringify(next) ? prev : next
    );

    const t = setTimeout(() => {
      syncingFromUrlRef.current = false;
    }, 0);

    return () => clearTimeout(t);
  }, [router.isReady, router.query, hydrated]);

  return [filters, setFilters, { hydrated }];
}

function hasAnyFilter(f) {
  return Boolean(
    f?.query ||
      (f?.job?.length ?? 0) ||
      (f?.profession?.length ?? 0) ||
      (f?.rank?.length ?? 0) ||
      f?.years?.from ||
      f?.years?.to
  );
}
