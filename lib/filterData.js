import { FIELDS, SEARCHABLE_FIELDS } from "./constants";
import { normalizeString } from "./normalizeString";

export function filterData(data, filters) {
  const { query, job = [], profession = [], rank = [], years = {} } = filters;

  // --- abid ---
  const toOneWord = (s) => (s || "").trim().split(/\s+/)[0] || "";
  const splitCsv = (s) =>
    (s || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  const toIntOrNull = (v) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null; // nt "1898?" -> 1898
  };

  // Otsingu ettevalmistus
  const queryTokens = normalizeString(query).split(/\s+/).filter(Boolean);
  const hasQuery = queryTokens.length > 0;

  // Filtri aasta(d) (vajadusel normaliseeri valepidi vahemik)
  let filterFrom = toIntOrNull(years?.from);
  let filterTo = toIntOrNull(years?.to);
  if (filterFrom != null && filterTo != null && filterFrom > filterTo) {
    [filterFrom, filterTo] = [filterTo, filterFrom];
  }
  const onlyFrom = filterFrom != null && filterTo == null;
  const onlyTo = filterFrom == null && filterTo != null;
  const both = filterFrom != null && filterTo != null;
  const hasYearFilter = onlyFrom || onlyTo || both;

  return data.filter((item) => {
    // --- fulltext query ---
    const haystack = SEARCHABLE_FIELDS.map((key) => normalizeString(item[key]))
      .filter(Boolean)
      .join(" ");

    const matchesQuery = !hasQuery
      ? true
      : queryTokens.length === 1
      ? haystack.includes(queryTokens[0])
      : queryTokens.every((t) => haystack.includes(t));

    // --- job / profession / rank ---
    const workplaces = splitCsv(item[FIELDS.WORKPLACE]).map(toOneWord);
    const matchesJob =
      job.length === 0 || workplaces.some((w) => job.includes(w));

    const professions = splitCsv(item[FIELDS.PROFESSION]);
    const matchesProfession =
      profession.length === 0 ||
      professions.some((p) => profession.includes(p));

    const ranks = splitCsv(item[FIELDS.RANK]);
    const matchesRank =
      rank.length === 0 || ranks.some((r) => rank.includes(r));

    // --- aastad ---
    const start = toIntOrNull(item[FIELDS.YEARS.FROM]); // aeg_algus
    const end = toIntOrNull(item[FIELDS.YEARS.TO]); // aeg_lopp
    const oneSourceYear = toIntOrNull(item[FIELDS.YEARS.ONE_SOURCE]); // allikas_mainimine
    const masterYear = toIntOrNull(item[FIELDS.YEARS.MASTER_YEAR]); // meister_aasta
    const singleYears = [oneSourceYear, masterYear].filter((n) => n != null);

    let matchesYear = true;

    if (hasYearFilter) {
      if (onlyFrom) {
        // alustanud sel aastal või hiljem
        if (start != null) {
          matchesYear = start >= filterFrom;
        } else if (singleYears.length) {
          matchesYear = singleYears.some((y) => y >= filterFrom);
        } else {
          matchesYear = false;
        }
      } else if (onlyTo) {
        // lõpetanud sel aastal või varem
        if (end != null) {
          matchesYear = end <= filterTo;
        } else if (singleYears.length) {
          matchesYear = singleYears.some((y) => y <= filterTo);
        } else {
          matchesYear = false;
        }
      } else if (both) {
        // algus ≥ from JA lõpp ≤ to (täielik sisaldumine)
        if (start != null && end != null) {
          matchesYear = start >= filterFrom && end <= filterTo;
        } else if (singleYears.length) {
          matchesYear = singleYears.some(
            (y) => y >= filterFrom && y <= filterTo
          );
        } else {
          matchesYear = false;
        }
      }
    }

    return (
      matchesQuery &&
      matchesJob &&
      matchesProfession &&
      matchesRank &&
      matchesYear
    );
  });
}
