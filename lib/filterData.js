import { FIELDS } from "./constants";

export function filterData(data, filters) {
  const { query, job, profession, years } = filters;
  const lowerQuery = query.toLowerCase();

  return data.filter((item) => {
    // Otsing kõigis välja arvatud tegutsemisajad
    const searchableFields = Object.keys(item).filter(
      (key) => key !== FIELDS.YEARS.FROM && key !== FIELDS.YEARS.TO
    );

    const matchesQuery = searchableFields.some((key) =>
      item[key]?.toLowerCase().includes(lowerQuery)
    );

    // Töökoht – kas mõni töökoht kattub valitud listiga
    const workplaces =
      item[FIELDS.WORKPLACE]?.split(",").map((w) => w.trim()) || [];
    const matchesJob =
      job.length === 0 || workplaces.some((w) => job.includes(w));

    // Amet – kas mõni amet kattub valitud listiga
    const professions =
      item[FIELDS.PROFESSION]?.split(",").map((p) => p.trim()) || [];
    const matchesProfession =
      profession.length === 0 ||
      professions.some((p) => profession.includes(p));

    // Tegutsemisaeg
    const start = parseInt(item[FIELDS.YEARS.FROM]) || null;
    const end = parseInt(item[FIELDS.YEARS.TO]) || null;
    const fromYear = parseInt(years.from) || null;
    const toYear = parseInt(years.to) || null;

    const matchesYear =
      (!fromYear || (start && start >= fromYear)) &&
      (!toYear || (end && end <= toYear));

    return matchesQuery && matchesJob && matchesProfession && matchesYear;
  });
}
