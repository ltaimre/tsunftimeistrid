import { FIELDS } from "@/lib/constants";

export default function Filters({ filters, setFilters, options }) {
  const toggleItem = (field, value) => {
    setFilters((prev) => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  return (
    <div className="filters-column">
      {/* Otsilahter */}
      <input
        type="text"
        placeholder="Otsi kõikidest väljadest"
        value={filters.query}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, query: e.target.value }))
        }
        className="wide-input"
      />

      {/* Aastate vahemik */}
      <div className="year-inputs">
        <input
          type="number"
          placeholder="Tegutsemisaeg algus"
          value={filters.years.from}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              years: { ...prev.years, from: e.target.value },
            }))
          }
        />
        <input
          type="number"
          placeholder="Tegutsemisaeg lõpp"
          value={filters.years.to}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              years: { ...prev.years, to: e.target.value },
            }))
          }
        />
      </div>

      {/* Töökohad */}
      {(options.jobs.length > 0 || filters.job.length > 0) && (
        <div>
          <strong>Töökohad:</strong>
          <div className="checkbox-group">
            {options.jobs.map((job) => (
              <label key={job} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.job.includes(job)}
                  onChange={() => toggleItem("job", job)}
                />
                {job}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Ametid */}
      {(options.professions.length > 0 || filters.profession.length > 0) && (
        <div>
          <strong>Ametid:</strong>
          <div className="checkbox-group">
            {options.professions.map((p) => (
              <label key={p} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.profession.includes(p)}
                  onChange={() => toggleItem("profession", p)}
                />
                {p}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
