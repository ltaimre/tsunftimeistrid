// hooks/useFilteredData.js
"use client";
import { useMemo } from "react";
import { filterData } from "@/lib/filterData";

/**
 * Arvutab filtreeritud andmed idempotentselt.
 */
export default function useFilteredData(data = [], filters = {}) {
  const toOneWord = (s) => (s || "").trim().split(/\s+/)[0];

  return useMemo(() => {
    const jobArray = Array.isArray(filters.job) ? filters.job : [];
    const patched = { ...filters, job: jobArray.map(toOneWord) };
    return filterData(data, patched);
  }, [data, filters]);
}
