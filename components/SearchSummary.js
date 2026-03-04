"use client";
import React from "react";

export default function SearchSummary({
  total = 0,
  from = 0,
  to = 0,
  isReady = false,
}) {
  if (!isReady) return null;

  if (total === 0) {
    return (
      <p>
        Leitud <strong>0</strong> vastet.
      </p>
    );
  }

  return (
    <p>
      Leitud <strong>{total}</strong> vastet — kuvan <strong>{from}</strong>–
      <strong>{to}</strong>.
    </p>
  );
}
