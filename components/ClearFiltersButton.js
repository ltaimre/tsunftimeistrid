"use client";
import React from "react";
import { getInitialFilters } from "@/lib/filters";

/**
 * Kuvab “Tühjenda filtrid” nupu ainult siis, kui mõni filter on peal.
 */
export default function ClearFiltersButton({ filters, setFilters }) {
  const hasAny =
    !!filters.query ||
    (filters.job?.length ?? 0) > 0 ||
    (filters.profession?.length ?? 0) > 0 ||
    (filters.rank?.length ?? 0) > 0 ||
    !!filters.years?.from ||
    !!filters.years?.to;

  if (!hasAny) return null;

  return (
    <button
      onClick={() => setFilters(getInitialFilters())}
      className="clear-filters-btn"
    >
      Tühjenda filtrid
    </button>
  );
}
