// components/Filters.jsx
import { useEffect, useMemo, useState } from "react";
import { FIELDS } from "@/lib/constants";

export default function Filters({ filters, setFilters, options }) {
  const [openCountries, setOpenCountries] = useState(() => new Set()); // vaikimisi kõik kinni
  const [openAdvanced, setOpenAdvanced] = useState(false); // ⟵ uus: täpsete filtrite lüliti

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

  // ⟵ uus: mitu “täpsemat” filtrit on aktiivsed (query ei loe)
  const advancedActiveCount = useMemo(() => {
    const yearsFrom = String(filters.years?.from || "").trim();
    const yearsTo = String(filters.years?.to || "").trim();
    let count = 0;
    if (yearsFrom) count++;
    if (yearsTo) count++;
    count += (filters.job?.length || 0) > 0 ? 1 : 0;
    count += (filters.profession?.length || 0) > 0 ? 1 : 0;
    count += (filters.rank?.length || 0) > 0 ? 1 : 0;
    return count;
  }, [filters.years, filters.job, filters.profession, filters.rank]);

  // ⟵ uus: kui on aktiivseid täpsemaid filtreid, ava paneel automaatselt
  useEffect(() => {
    if (advancedActiveCount > 0) setOpenAdvanced(true);
  }, [advancedActiveCount]);

  return (
    <div className="filters-column">
      {/* Otsilahter (alati nähtav) */}
      <input
        type="text"
        placeholder="Otsi kõikidest väljadest"
        value={filters.query}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, query: e.target.value }))
        }
        className="wide-input"
      />

      {/* Täpsemad filtrid - avanev/sulguv */}
      <div>
        <button
          type="button"
          className="country-header" // olemasolev neutraalne stiil nupule
          onClick={() => setOpenAdvanced((v) => !v)}
          aria-expanded={openAdvanced}
          aria-controls="advanced-filters"
          aria-pressed={openAdvanced}
        >
          <span className={`chevron ${openAdvanced ? "open" : ""}`} aria-hidden>
            ▶
          </span>
          <span className="country-title">
            {openAdvanced ? "Peida täpsemad filtrid" : "Otsi täpsemalt"}
            {advancedActiveCount > 0 && (
              <span className="badge" title="Aktiivseid täpsemaid filtreid">
                {advancedActiveCount}
              </span>
            )}
          </span>
        </button>

        {openAdvanced && (
          <div id="advanced-filters">
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
                  inputMode="numeric"
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
                  inputMode="numeric"
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
            {(options.professions.length > 0 ||
              filters.profession.length > 0) && (
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
        )}
      </div>
    </div>
  );
}
