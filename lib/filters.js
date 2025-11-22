// lib/filters.js
export function getInitialFilters() {
  return {
    query: "",
    job: [],
    profession: [],
    rank: [],
    years: { from: "", to: "" },
    page: 1, // ⬅️ UUUS: page on nüüd osa filtritest
  };
}
