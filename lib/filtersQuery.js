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
  addList("job", filters.job);
  addList("profession", filters.profession);
  addList("rank", filters.rank);
  addVal("from", filters.years?.from);
  addVal("to", filters.years?.to);

  // ⬅️ UUUS: Lisa page parameeter (ainult kui ei ole 1)
  if (filters.page && filters.page !== 1) {
    addVal("page", filters.page);
  }

  return params.toString();
}

export function decodeQueryToFilters(query, getInitialFilters) {
  const params = new URLSearchParams(query || "");
  const base = getInitialFilters();

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
    query: params.get("q") ?? base.query,
    job: splitList(params.get("job")),
    profession: splitList(params.get("profession")),
    rank: splitList(params.get("rank")),
    years: {
      from: getNum(params.get("from")) || base.years.from,
      to: getNum(params.get("to")) || base.years.to,
    },
    // ⬅️ UUUS: Lisa page parameeter
    page: parseInt(params.get("page")) || base.page || 1,
  };
}
