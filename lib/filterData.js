import { FIELDS, SEARCHABLE_FIELDS } from "./constants";
import { normalizeString } from "./normalizeString";

export function filterData(data, filters) {
  const {
    query,
    name,
    job = [],
    profession = [],
    rank = [],
    years = {},
  } = filters;

  // --- abid ---
  const toOneWord = (s) => (s || "").trim().split(/\s+/)[0] || "";
  const splitCsv = (s) =>
    (s || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  const toIntOrNull = (v) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  };

  // Otsingu ettevalmistus
  const queryTokens = normalizeString(query).split(/\s+/).filter(Boolean);
  const hasQuery = queryTokens.length > 0;

  // ⬅️ UUUS: Nime otsingu ettevalmistus
  const nameTokens = normalizeString(name).split(/\s+/).filter(Boolean);
  const hasNameFilter = nameTokens.length > 0;

  // Filtri aasta(d)
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

    // ⬅️ UUUS: Nime otsing (eesnimi, perekonnanimi, alternatiivid, kombinatsioonid)
    let matchesName = true;
    if (hasNameFilter) {
      const firstName = normalizeString(item[FIELDS.NAME.FIRST]);
      const lastName = normalizeString(item[FIELDS.NAME.LAST]);
      const altFirst = normalizeString(item[FIELDS.NAME.ALT_FIRST]);
      const altLast = normalizeString(item[FIELDS.NAME.ALT_LAST]);

      // Kombineeri kõik nime variandid
      const nameHaystack = [
        firstName,
        lastName,
        altFirst,
        altLast,
        `${firstName} ${lastName}`,
        `${lastName} ${firstName}`,
        `${altFirst} ${altLast}`,
        `${altLast} ${altFirst}`,
      ]
        .filter(Boolean)
        .join(" ");

      matchesName = nameTokens.every((t) => nameHaystack.includes(t));
    }

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
    const start = toIntOrNull(item[FIELDS.YEARS.FROM]);
    const end = toIntOrNull(item[FIELDS.YEARS.TO]);
    const oneSourceYear = toIntOrNull(item[FIELDS.YEARS.ONE_SOURCE]);
    const masterYear = toIntOrNull(item[FIELDS.YEARS.MASTER_YEAR]);
    const singleYears = [oneSourceYear, masterYear].filter((n) => n != null);

    let matchesYear = true;

    if (hasYearFilter) {
      if (onlyFrom) {
        if (start != null) {
          matchesYear = start >= filterFrom;
        } else if (singleYears.length) {
          matchesYear = singleYears.some((y) => y >= filterFrom);
        } else {
          matchesYear = false;
        }
      } else if (onlyTo) {
        if (end != null) {
          matchesYear = end <= filterTo;
        } else if (singleYears.length) {
          matchesYear = singleYears.some((y) => y <= filterTo);
        } else {
          matchesYear = false;
        }
      } else if (both) {
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
      matchesName &&
      matchesJob &&
      matchesProfession &&
      matchesRank &&
      matchesYear
    );
  });
}
