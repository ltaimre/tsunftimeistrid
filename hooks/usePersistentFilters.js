// hooks/usePersistentFilters.js
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router"; // pages-router
import { encodeFiltersToQuery, decodeQueryToFilters } from "@/lib/filtersQuery";

const STORAGE_KEY = "filters:index";

export default function usePersistentFilters(getInitialFilters) {
  const router = useRouter();
  const [filters, setFilters] = useState(() => {
    // 1) proovi URL-ist
    const fromUrl = decodeQueryToFilters(
      router.asPath.split("?")[1] || "",
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

  // kirjuta URL + sessionStorage igal muutusel (shallow, ilma uue ajaloorea lisamiseta)
  useEffect(() => {
    if (!router.isReady) return;
    const qs = encodeFiltersToQuery(filters);

    // ära lisa tühja küsimärki
    const nextUrl = qs ? `/?${qs}` : `/`;
    router.replace(nextUrl, undefined, { shallow: true, scroll: false });

    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {}
  }, [filters, router]);

  // kui kasutaja käsitsi muudab queryd (või tuleb linkiga), loe need sisse
  useEffect(() => {
    if (!router.isReady) return;
    // vältida esmast topelt-sünkroonimist
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const next = decodeQueryToFilters(
      router.asPath.split("?")[1] || "",
      getInitialFilters
    );
    setFilters((prev) =>
      JSON.stringify(prev) === JSON.stringify(next) ? prev : next
    );
  }, [router.query, router.isReady]); // router.query muutub shallow-navigatsioonil

  return [filters, setFilters];
}

function hasAnyFilter(f) {
  return Boolean(
    f?.query ||
      f?.job?.length ||
      f?.profession?.length ||
      f?.rank?.length ||
      f?.years?.from ||
      f?.years?.to
  );
}
