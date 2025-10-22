"use client";
import React from "react";
import Link from "next/link";
import { FIELDS } from "@/lib/constants";

/**
 * Lihtsalt renderdab tabeli antud slice'ist.
 * Props:
 * - items: Array<object>
 */
export default function ResultsTable({ items }) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Eesnimi</th>
            <th>Perekonnanimi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item[FIELDS.ID]}>
              <td>
                <Link href={`/meister/${item[FIELDS.ID]}`}>
                  {item[FIELDS.NAME.FIRST]}
                </Link>
              </td>
              <td>{item[FIELDS.NAME.LAST]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
