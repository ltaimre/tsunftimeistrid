// hooks/usePersistentFilters.js
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router"; // pages-router
import useDebouncedEffect from "@/hooks/useDebouncedEffect";
import { encodeFiltersToQuery, decodeQueryToFilters } from "@/lib/filtersQuery";

const STORAGE_KEY = "filters:index";

export default function usePersistentFilters(getInitialFilters) {
  const router = useRouter();

  const [filters, setFilters] = useState(() => {
    // 1) proovi URL-ist
    const fromUrl = decodeQueryToFilters(
      (typeof window !== "undefined" ? window.location.search.slice(1) : "") ||
        "",
      getInitialFilters
    );

    // 2) kui URL tühi, proovi sessionStorage
    if (typeof window !== "undefined" && !hasAnyFilter(fromUrl)) {
      try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {}
    }

    return fromUrl;
  });

  const firstRun = useRef(true);

  // ————————————————————————————————————————————————
  // Kirjuta URL + sessionStorage IGAL FILTRITE MUUTUSEL,
  // aga: ainult avalehel ("/") JA debounced (250ms)
  // ————————————————————————————————————————————————
  useDebouncedEffect(
    () => {
      if (!router.isReady) return;
      if (router.pathname !== "/") return; // ⟵ ära puutu URL-i teistel lehtedel

      const qs = encodeFiltersToQuery(filters);
      const nextUrl = qs ? `/?${qs}` : `/`;

      // ära tee asjatut replace'i, kui URL juba sama
      if (router.asPath === nextUrl) {
        try {
          window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
        } catch {}
        return;
      }

      router.replace(nextUrl, undefined, { shallow: true, scroll: false });

      try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
      } catch {}
    },
    // deps:
    [filters, router.isReady, router.pathname, router.asPath],
    250
  );

  // ————————————————————————————————————————————————
  // Kui kasutaja muudab query't (või saabub linkiga),
  // sünkrooni see state'i
  // ————————————————————————————————————————————————
  useEffect(() => {
    if (!router.isReady) return;

    // vältida esmast topelt-sünkroonimist
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    const next = decodeQueryToFilters(
      (typeof window !== "undefined" ? window.location.search.slice(1) : "") ||
        "",
      getInitialFilters
    );

    setFilters((prev) =>
      JSON.stringify(prev) === JSON.stringify(next) ? prev : next
    );
  }, [router.isReady, router.query]);

  return [filters, setFilters];
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
