"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FIELDS } from "@/lib/constants";
const router = useRouter();
const query = router.asPath.split("?")[1];
const qs = query ? `?${query}` : "";

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
                <Link href={`/meister/${item[FIELDS.ID]}${qs}`}>
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
