"use client";
import React from "react";
import Filters from "@/components/Filters";
import ActiveFilters from "@/components/ActiveFilters";
import ClearFiltersButton from "@/components/ClearFiltersButton";

/**
 * Komposiit-komponent, mis koondab:
 *  - Filters
 *  - (tingimusliku) “Tühjenda filtrid” nupu
 *  - ActiveFilters
 * Funktsionaalsus jääb samaks, ainult struktuur on selgem.
 */
export default function FiltersPanel({ filters, setFilters, options }) {
  return (
    <section>
      <Filters filters={filters} setFilters={setFilters} options={options} />
      <ClearFiltersButton filters={filters} setFilters={setFilters} />
      <ActiveFilters filters={filters} setFilters={setFilters} />
    </section>
  );
}
