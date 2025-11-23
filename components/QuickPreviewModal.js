import { useEffect, useMemo } from "react";
import { FIELDS, SEARCHABLE_FIELDS } from "@/lib/constants";
import { normalizeString } from "@/lib/normalizeString";
import { labelFor } from "@/lib/labels";
import styles from "../styles/QuickPreviewModal.module.css";

export default function QuickPreviewModal({ item, searchTerms = [], onClose }) {
  // ESC sulgemiseks
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Keela body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Leia väljad kus on match
  const matchedFields = useMemo(() => {
    if (searchTerms.length === 0) return [];

    const matches = [];

    SEARCHABLE_FIELDS.forEach((fieldKey) => {
      const value = item[fieldKey];
      if (!value) return;

      const normalizedValue = normalizeString(value);
      const foundTerms = searchTerms.filter((term) =>
        normalizedValue.includes(term)
      );

      if (foundTerms.length > 0) {
        matches.push({
          field: fieldKey,
          value: value,
          foundTerms: foundTerms,
        });
      }
    });

    return matches;
  }, [item, searchTerms]);

  // Highlight funktsioon
  const highlightText = (text, terms) => {
    if (!terms || terms.length === 0) return text;

    const normalized = normalizeString(text);
    const parts = [];
    let lastIndex = 0;

    // Leia kõik matchid
    const allMatches = [];
    terms.forEach((term) => {
      let index = normalized.indexOf(term);
      while (index !== -1) {
        allMatches.push({ start: index, end: index + term.length, term });
        index = normalized.indexOf(term, index + 1);
      }
    });

    // Sorteeri ja ühenda kattuvad matchid
    allMatches.sort((a, b) => a.start - b.start);

    allMatches.forEach((match) => {
      if (match.start > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, match.start)}
          </span>
        );
      }
      parts.push(
        <mark key={`mark-${match.start}`} className={styles.highlight}>
          {text.substring(match.start, match.end)}
        </mark>
      );
      lastIndex = Math.max(lastIndex, match.end);
    });

    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>
      );
    }

    return parts.length > 0 ? parts : text;
  };

  const firstName = item[FIELDS.NAME.FIRST] || "";
  const lastName = item[FIELDS.NAME.LAST] || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Meister";

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Kiirvaade: {fullName}</h2>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Sulge"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {matchedFields.length > 0 ? (
            <>
              <p className={styles.intro}>
                Leitud {matchedFields.length} väljas
                {matchedFields.length !== 1 ? "" : ""}:
              </p>
              <div className={styles.matches}>
                {matchedFields.map((match, idx) => (
                  <div key={idx} className={styles.matchItem}>
                    <div className={styles.fieldLabel}>
                      {labelFor(match.field)}
                    </div>
                    <div className={styles.fieldValue}>
                      {highlightText(match.value, match.foundTerms)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className={styles.noMatches}>
              Otsingukriteeriume ei leitud (võimalik et filtreerisid ametiaste,
              tsunft või ajavahemiku järgi).
            </p>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button onClick={onClose} className={styles.closeButton}>
            Sulge
          </button>
        </div>
      </div>
    </div>
  );
}
