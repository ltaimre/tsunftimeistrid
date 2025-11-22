// lib/filtersQuery.js
export function encodeFiltersToQuery(filters) {
  const params = new URLSearchParams();

  const addList = (key, arr) => {
    if (Array.isArray(arr) && arr.length) params.set(key, arr.join(","));
  };
  const addVal = (key, val) => {
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      params.set(key, String(val).trim());
    }
  };

  addVal("q", filters.query);
  addVal("name", filters.name);
  addList("job", filters.job);
  addList("profession", filters.profession);
  addList("rank", filters.rank);
  addVal("from", filters.years?.from);
  addVal("to", filters.years?.to);

  // Lisa page parameeter (ainult kui ei ole 1)
  if (filters.page && filters.page !== 1) {
    addVal("page", filters.page);
  }

  return params.toString();
}

export function decodeQueryToFilters(query, getInitialFilters) {
  const params = new URLSearchParams(query || "");
  const base =
    typeof getInitialFilters === "function"
      ? getInitialFilters()
      : getInitialFilters;

  const splitList = (v) =>
    v
      ? v
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
      : [];
  const getNum = (v) => (v && !Number.isNaN(Number(v)) ? v : "");

  return {
    ...base,
    query: params.get("q") ?? base.query ?? "",
    name: params.get("name") ?? base.name ?? "",
    job: splitList(params.get("job")),
    profession: splitList(params.get("profession")),
    rank: splitList(params.get("rank")),
    years: {
      from: getNum(params.get("from")) || base.years?.from || "",
      to: getNum(params.get("to")) || base.years?.to || "",
    },
    page: parseInt(params.get("page")) || base.page || 1,
  };
}
