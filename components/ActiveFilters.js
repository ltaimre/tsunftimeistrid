export default function ActiveFilters({ filters, setFilters }) {
  const clearOne = (key) => {
    setFilters((prev) => {
      const updated = { ...prev };

      if (key === "query" || key === "job" || key === "profession") {
        updated[key] = "";
      }

      if (key === "from" || key === "to") {
        updated.years = { ...updated.years, [key]: "" };
      }

      return updated;
    });
  };

  const active = [];
  console.log(filters);
  if (filters.query)
    active.push({ label: `Otsing: ${filters.query}`, key: "query" });
  if (filters.job.length)
    active.push({ label: `Töökoht: ${filters.job}`, key: "job" });
  if (filters.profession.length)
    active.push({ label: `Amet: ${filters.profession}`, key: "profession" });
  if (filters.rank.length)
    active.push({ label: `Ametiastmed: ${filters.rank}`, key: "profession" });
  if (filters.years.from)
    active.push({ label: `Aasta algus: ${filters.years.from}`, key: "from" });
  if (filters.years.to)
    active.push({ label: `Aasta lõpp: ${filters.years.to}`, key: "to" });

  if (active.length === 0) return null;

  return (
    <div className="active-filters">
      {active.map(({ label, key }) => (
        <span className="filter-tag" key={key}>
          {label}
          {/*           <button onClick={() => clearOne(key)} className="remove-btn">
            ×
          </button> */}
        </span>
      ))}
    </div>
  );
}
