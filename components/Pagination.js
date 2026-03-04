"use client";
import React from "react";

function PageButton({ disabled, active, onClick, children, ariaLabel }) {
  return (
    <button
      type="button"
      className={`page-btn${active ? " active" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? "page" : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

/**
 * Props:
 * - current (number)
 * - totalPages (number)
 * - onChange(nextPage:number)
 * - maxButtons (number, optional; default 7)
 */
export default function Pagination({
  current,
  totalPages,
  onChange,
  maxButtons = 7,
}) {
  if (totalPages <= 1) return null;

  const clamped = Math.max(1, Math.min(current, totalPages));
  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, clamped - half);
  let end = Math.min(totalPages, start + maxButtons - 1);
  if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);

  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav
      className="pagination"
      role="navigation"
      aria-label="Lehekülgede navigatsioon"
    >
      <PageButton
        ariaLabel="Esimene leht"
        disabled={clamped === 1}
        onClick={() => onChange(1)}
      >
        «
      </PageButton>
      <PageButton
        ariaLabel="Eelmine leht"
        disabled={clamped === 1}
        onClick={() => onChange(clamped - 1)}
      >
        ‹
      </PageButton>

      {start > 1 && (
        <span className="page-ellipsis" aria-hidden>
          …
        </span>
      )}
      {pages.map((p) => (
        <PageButton
          key={p}
          active={p === clamped}
          ariaLabel={`Leht ${p}`}
          onClick={() => onChange(p)}
        >
          {p}
        </PageButton>
      ))}
      {end < totalPages && (
        <span className="page-ellipsis" aria-hidden>
          …
        </span>
      )}

      <PageButton
        ariaLabel="Järgmine leht"
        disabled={clamped === totalPages}
        onClick={() => onChange(clamped + 1)}
      >
        ›
      </PageButton>
      <PageButton
        ariaLabel="Viimane leht"
        disabled={clamped === totalPages}
        onClick={() => onChange(totalPages)}
      >
        »
      </PageButton>
    </nav>
  );
}
