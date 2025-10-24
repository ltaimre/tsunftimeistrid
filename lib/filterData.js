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
    return Number.isFinite(n) ? n : null;
    // NB: kui v on nt "1898?" jääb parseInt=1898 — sobib meile
  };

  // Vahemiku normaliseerija: tagastab [start, end] või [null, null]
  const normalizeRange = (a, b) => {
    let start = toIntOrNull(a);
    let end = toIntOrNull(b);
    if (start == null && end == null) return [null, null];
    if (start == null) start = end;
    if (end == null) end = start;
    if (start > end) [start, end] = [end, start];
    return [start, end];
  };

  // Kattuvus (inkluusiivne), lubab ka lahtisi piire
  const rangesOverlap = (aStart, aEnd, bStart, bEnd) => {
    const A1 = aStart ?? Number.NEGATIVE_INFINITY;
    const A2 = aEnd ?? Number.POSITIVE_INFINITY;
    const B1 = bStart ?? Number.NEGATIVE_INFINITY;
    const B2 = bEnd ?? Number.POSITIVE_INFINITY;
    return A1 <= B2 && B1 <= A2;
  };

  // Otsingu ettevalmistus
  const queryTokens = normalizeString(query).split(/\s+/).filter(Boolean);
  const hasQuery = queryTokens.length > 0;

  // Filtri aasta(d)
  const [filterFrom, filterTo] = normalizeRange(years?.from, years?.to);
  const hasYearFilter = filterFrom != null || filterTo != null;

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
    // job: võrreldakse ühe sõna kaupa (tegutsemiskoht)
    const workplaces = splitCsv(item[FIELDS.WORKPLACE]).map(toOneWord);
    const matchesJob =
      job.length === 0 || workplaces.some((w) => job.includes(w));

    // tsunft (PROFESSION)
    const professions = splitCsv(item[FIELDS.PROFESSION]);
    const matchesProfession =
      profession.length === 0 ||
      professions.some((p) => profession.includes(p));

    // ametiaste (RANK)
    const ranks = splitCsv(item[FIELDS.RANK]);
    const matchesRank =
      rank.length === 0 || ranks.some((r) => rank.includes(r));

    // --- aastad ---
    // Põhivahemik
    const [itemStart, itemEnd] = normalizeRange(
      item[FIELDS.YEARS.FROM],
      item[FIELDS.YEARS.TO]
    );

    // Fallback-aastad (kui vahemik puudub)
    const oneSourceYear = toIntOrNull(item[FIELDS.YEARS.ONE_SOURCE]); // allikas_mainimine
    const masterYear = toIntOrNull(item[FIELDS.YEARS.MASTER_YEAR]); // meister_aasta

    let matchesYear = true;

    if (hasYearFilter) {
      if (itemStart != null || itemEnd != null) {
        // Kirjel on (algus/lõpp) – kontrolli kattuvust
        matchesYear = rangesOverlap(itemStart, itemEnd, filterFrom, filterTo);
      } else if (oneSourceYear != null || masterYear != null) {
        // Fallback: üksikaasta peab jääma filtri vahemikku
        const candidateYears = [oneSourceYear, masterYear].filter(
          (n) => n != null
        );
        matchesYear = candidateYears.some(
          (y) =>
            (filterFrom == null || y >= filterFrom) &&
            (filterTo == null || y <= filterTo)
        );
      } else {
        // Kirjel puuduvad aastad – kui filter oli määratud, siis ei sobi
        matchesYear = false;
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
