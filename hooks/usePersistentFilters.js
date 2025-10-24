// hooks/usePersistentFilters.js
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useDebouncedEffect from "@/hooks/useDebouncedEffect";
import { encodeFiltersToQuery, decodeQueryToFilters } from "@/lib/filtersQuery";

const STORAGE_KEY = "filters:index";

export default function usePersistentFilters(getInitialFilters) {
  const router = useRouter();

  // 1) Alusta alati deterministlike vaikimisi filtritega.
  //    ÄRA loe siin URL-i ega sessionStorage’it (vältimaks hydration-mismatch’i).
  const [filters, setFilters] = useState(() => getInitialFilters());
  const [hydrated, setHydrated] = useState(false); // pärast esmast sünk’i URL/SS-ga

  const syncingFromUrlRef = useRef(true); // esmane sünk URL/SS -> state

  // 2) Esmane sünk pärast mount’i (ja kui router on valmis):
  //    loe enne URL, kui tühi – proovi sessionStorage.
  useEffect(() => {
    if (!router.isReady) return;

    const search =
      typeof window !== "undefined" ? window.location.search.slice(1) : "";
    let next = decodeQueryToFilters(search || "", getInitialFilters);

    if (!hasAnyFilter(next) && typeof window !== "undefined") {
      try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (raw) next = JSON.parse(raw);
      } catch {
        // ignore
      }
    }

    setFilters(next);
    syncingFromUrlRef.current = false; // esmane sünk tehtud
    setHydrated(true);
  }, [router.isReady, getInitialFilters]);

  // 3) Kirjuta sessionStorage’isse, kui filtrid muutuvad (pärast esmast sünk’i)
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      // ignore
    }
  }, [filters, hydrated]);

  // 4) Kirjuta URL-i (debounced), AINULT avalehel ja AINULT pärast esmast sünk’i
  useDebouncedEffect(
    () => {
      if (!hydrated) return;
      if (!router.isReady) return;
      if (router.pathname !== "/") return;
      if (syncingFromUrlRef.current) return; // kui just loeme URL-ist, ära kirjuta tagasi

      const qs = encodeFiltersToQuery(filters);
      const nextUrl = qs ? `/?${qs}` : `/`;

      if (router.asPath === nextUrl) return; // juba sama
      router.replace(nextUrl, undefined, { shallow: true, scroll: false });
    },
    [filters, hydrated, router.isReady, router.pathname, router.asPath],
    250
  );

  // 5) Kui kasutaja muudab query’t (back/forward või käsitsi),
  //    sünkrooni see state’i (pärast esmast sünk’i).
  useEffect(() => {
    if (!router.isReady) return;
    if (!hydrated) return;

    const search =
      typeof window !== "undefined" ? window.location.search.slice(1) : "";
    const next = decodeQueryToFilters(search || "", getInitialFilters);

    // tähista, et hetkel sünkroomeen URL-ist -> ei tohiks samal ajal URL-i kirjutada
    syncingFromUrlRef.current = true;
    setFilters((prev) =>
      JSON.stringify(prev) === JSON.stringify(next) ? prev : next
    );
    // väike viide, et lasta render ära teha ja siis lubada uuesti kirjutamist
    const t = setTimeout(() => {
      syncingFromUrlRef.current = false;
    }, 0);

    return () => clearTimeout(t);
  }, [router.isReady, router.query, hydrated, getInitialFilters]);

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
