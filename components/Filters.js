"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

export default function Filters({ filters, setFilters, options = {} }) {
  const router = useRouter();

  // —— paneelid ——
  const [openCountries, setOpenCountries] = useState(() => new Set());
  const [openAdvanced, setOpenAdvanced] = useState(false);

  // —— turvalised lühendid ——
  const safeJob = Array.isArray(filters?.job) ? filters.job : [];
  const safeProfession = Array.isArray(filters?.profession)
    ? filters.profession
    : [];
  const safeRank = Array.isArray(filters?.rank) ? filters.rank : [];
  const safeYears = filters?.years ?? { from: "", to: "" };

  const jobsByCountry = Array.isArray(options?.jobsByCountry)
    ? options.jobsByCountry
    : [];
  const jobsFlat = Array.isArray(options?.jobs) ? options.jobs : [];
  const professionsOpt = Array.isArray(options?.professions)
    ? options.professions
    : [];
  const ranksOpt = Array.isArray(options?.ranks) ? options.ranks : [];

  // —— abid ——
  const onlyDigitsYear = (v) =>
    (v ?? "").toString().replace(/[^\d]/g, "").slice(0, 4);

  const toggleItem = (field, value) => {
    setFilters((prev) => {
      const currentRaw = prev?.[field];
      const current = Array.isArray(currentRaw) ? currentRaw : [];
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
    const map = {};
    for (const { country, cities } of jobsByCountry) {
      map[country] = cities.filter((c) => safeJob.includes(c)).length;
    }
    return map;
  }, [jobsByCountry, safeJob]);

  const advancedActiveCount = useMemo(() => {
    const yearsFrom = String(safeYears.from || "").trim();
    const yearsTo = String(safeYears.to || "").trim();
    let count = 0;
    if (yearsFrom) count++;
    if (yearsTo) count++;
    if (safeJob.length) count++;
    if (safeProfession.length) count++;
    if (safeRank.length) count++;
    return count;
  }, [safeYears, safeJob, safeProfession, safeRank]);

  // —— Auto-open kui URL sisaldab openFilters=true ——
  const didAutoOpenRef = useRef(false);
  useEffect(() => {
    if (didAutoOpenRef.current) return;
    if (!router.isReady) return;

    const params = new URLSearchParams(window.location.search);
    const shouldOpen = params.get("openFilters") === "true";

    if (shouldOpen) {
      setOpenAdvanced(true);
      didAutoOpenRef.current = true;

      // Eemalda openFilters URL-ist pärast avamist
      params.delete("openFilters");
      const newSearch = params.toString();
      const newUrl = `${router.pathname}${newSearch ? `?${newSearch}` : ""}`;
      router.replace(newUrl, undefined, { shallow: true });
    } else if (advancedActiveCount > 0) {
      // Kui URL-ist tulnud filtrid on peal, ava ka
      setOpenAdvanced(true);
      didAutoOpenRef.current = true;
    } else {
      didAutoOpenRef.current = true;
    }
  }, [router.isReady, advancedActiveCount]);

  return (
    <div className="filters-column">
      {/* Otsilahter */}
      <input
        type="text"
        placeholder="Otsi kõikidest väljadest"
        value={filters?.query ?? ""}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, query: e.target.value }))
        }
        className="wide-input"
      />

      {/* Täpsemad filtrid */}
      <div>
        <button
          type="button"
          className="country-header"
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
            {/* Aastavahemik */}
            <div>
              <strong>Tegutsemisvahemik:</strong>
              <div className="year-range">
                <input
                  type="number"
                  className="year-input no-spinner"
                  placeholder="algus"
                  inputMode="numeric"
                  pattern="\d*"
                  min="0"
                  step="1"
                  value={safeYears.from ?? ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      years: {
                        ...(prev?.years ?? {}),
                        from: onlyDigitsYear(e.target.value),
                      },
                    }))
                  }
                  aria-label="Tegutsemise algusaasta"
                />
                <span className="dash">—</span>
                <input
                  type="number"
                  className="year-input no-spinner"
                  placeholder="lõpp"
                  inputMode="numeric"
                  pattern="\d*"
                  min="0"
                  step="1"
                  value={safeYears.to ?? ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      years: {
                        ...(prev?.years ?? {}),
                        to: onlyDigitsYear(e.target.value),
                      },
                    }))
                  }
                  aria-label="Tegutsemise lõppaasta"
                />
              </div>
            </div>

            {/* Töökohad */}
            {((jobsByCountry.length ?? 0) > 0 ||
              safeJob.length > 0 ||
              (jobsFlat.length ?? 0) > 0) && (
              <div>
                <strong>Töökohad:</strong>

                {jobsByCountry.length > 0 ? (
                  <div className="country-accordion">
                    {jobsByCountry.map(({ country, cities }) => {
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
                                    checked={safeJob.includes(city)}
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
                ) : jobsFlat.length > 0 ? (
                  <div className="checkbox-group">
                    {jobsFlat.map((job) => (
                      <label key={job} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={safeJob.includes(job)}
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
            {(professionsOpt.length > 0 || safeProfession.length > 0) && (
              <div>
                <strong>Ametid:</strong>
                <div className="checkbox-group">
                  {professionsOpt.map((p) => (
                    <label key={p} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={safeProfession.includes(p)}
                        onChange={() => toggleItem("profession", p)}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Ametiastmed */}
            {(ranksOpt.length > 0 || safeRank.length > 0) && (
              <div>
                <strong>Ametiastmed:</strong>
                <div className="checkbox-group">
                  {ranksOpt.map((r) => (
                    <label key={r} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={safeRank.includes(r)}
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
