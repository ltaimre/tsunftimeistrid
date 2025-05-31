import { FIELDS, SEARCHABLE_FIELDS } from "./constants";

export function filterData(data, filters) {
  const { query, job, profession, years } = filters;
  const lowerQuery = query.toLowerCase();

  return data.filter((item) => {
    const matchesQuery = SEARCHABLE_FIELDS.some((key) =>
      item[key]?.toLowerCase().includes(lowerQuery)
    );

    const workplaces =
      item[FIELDS.WORKPLACE]?.split(",").map((w) => w.trim()) || [];
    const matchesJob =
      job.length === 0 || workplaces.some((w) => job.includes(w));

    const professions =
      item[FIELDS.PROFESSION]?.split(",").map((p) => p.trim()) || [];
    const matchesProfession =
      profession.length === 0 ||
      professions.some((p) => profession.includes(p));

    const ranks =
      item["Ametiaste (viimane, kõrgeim)"]?.split(",").map((r) => r.trim()) ||
      [];
    const matchesRank =
      filters.rank.length === 0 || ranks.some((r) => filters.rank.includes(r));
    const start = parseInt(item[FIELDS.YEARS.FROM]) || null;
    const end = parseInt(item[FIELDS.YEARS.TO]) || null;
    const fromYear = parseInt(years.from) || null;
    const toYear = parseInt(years.to) || null;

    const matchesYear =
      (!fromYear || (start && start >= fromYear)) &&
      (!toYear || (end && end <= toYear));

    return (
      matchesQuery &&
      matchesJob &&
      matchesProfession &&
      matchesRank &&
      matchesYear
    );
  });
}
