export function getInitialFilters() {
  return {
    query: "",
    name: "", // ⬅️ LISA
    job: [],
    profession: [],
    rank: [],
    years: { from: "", to: "" },
    page: 1,
  };
}
