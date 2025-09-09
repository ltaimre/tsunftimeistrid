// components/Filters.jsx
import { useMemo, useState } from "react";
import { FIELDS } from "@/lib/constants";

export default function Filters({ filters, setFilters, options }) {
  const [openCountries, setOpenCountries] = useState(() => new Set()); // vaikimisi kõik kinni

  const toggleItem = (field, value) => {
    setFilters((prev) => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const toggleCountry = (country) => {
    setOpenCountries((prev) => {
      const next = new Set(prev);
      if (next.has(country)) next.delete(country);
      else next.add(country);
      return next;
    });
  };

  const selectedByCountry = useMemo(() => {
    // abiks: mitu linna on konkreetsest riigist valitud
    const map = {};
    for (const { country, cities } of options.jobsByCountry || []) {
      map[country] = cities.filter((c) => filters.job.includes(c)).length;
    }
    return map;
  }, [options.jobsByCountry, filters.job]);

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

      <div>
        <strong>Tegutsemisvahemik:</strong>
        <div className="year-range">
          <input
            type="number"
            placeholder="algus"
            value={filters.years.from}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                years: { ...prev.years, from: e.target.value },
              }))
            }
          />
          <span className="dash">–</span>
          <input
            type="number"
            placeholder="lõpp"
            value={filters.years.to}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                years: { ...prev.years, to: e.target.value },
              }))
            }
          />
        </div>
      </div>

      {/* Töökohad (riigid kokkupakitavad) */}
      {((options.jobsByCountry?.length ?? 0) > 0 ||
        filters.job.length > 0 ||
        (options.jobs?.length ?? 0) > 0) && (
        <div>
          <strong>Töökohad:</strong>

          {options.jobsByCountry?.length > 0 ? (
            <div className="country-accordion">
              {options.jobsByCountry.map(({ country, cities }) => {
                const isOpen = openCountries.has(country);
                const selectedCount = selectedByCountry[country] || 0;
                return (
                  <div key={country} className="country-section">
                    <button
                      type="button"
                      className="country-header"
                      onClick={() => toggleCountry(country)}
                      aria-expanded={isOpen}
                      aria-controls={`cities-${country}`}
                    >
                      <span
                        className={`chevron ${isOpen ? "open" : ""}`}
                        aria-hidden
                      >
                        ▶
                      </span>
                      <span className="country-title">
                        {country}
                        {selectedCount > 0 && (
                          <span className="badge" title="Valitud linnad">
                            {selectedCount}
                          </span>
                        )}
                      </span>
                    </button>

                    {isOpen && (
                      <div
                        id={`cities-${country}`}
                        className="cities checkbox-group"
                      >
                        {cities.map((city) => (
                          <label
                            key={`${country}-${city}`}
                            className="checkbox-item"
                          >
                            <input
                              type="checkbox"
                              checked={filters.job.includes(city)}
                              onChange={() => toggleItem("job", city)}
                            />
                            {city}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : options.jobs?.length > 0 ? (
            // Fallback: kui jobsByCountry puudub, näita tasapinnaline nimekiri
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
          ) : (
            <p className="empty-note">Töökohad puuduvad</p>
          )}
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

      {/* Ametiastmed */}
      {(options.ranks?.length > 0 || filters.rank.length > 0) && (
        <div>
          <strong>Ametiastmed:</strong>
          <div className="checkbox-group">
            {options.ranks.map((r) => (
              <label key={r} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.rank.includes(r)}
                  onChange={() => toggleItem("rank", r)}
                />
                {r}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
