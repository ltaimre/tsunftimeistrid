"use client";
import { useMemo } from "react";
import { filterData } from "@/lib/filterData";

/**
 * Arvutab filtered andmed idempotentselt (ilma kõrvaltoimeteta).
 * Hoia “job” väärtused ühesõnaliselt nagu senises loogikas.
 */
export default function useFilteredData(data, filters) {
  const toOneWord = (s) => (s || "").trim().split(/\s+/)[0];

  return useMemo(() => {
    const patched = { ...filters, job: (filters.job || []).map(toOneWord) };
    return filterData(data, patched);
  }, [data, filters]);
}
