import Link from "next/link";
import { useRouter } from "next/router";
import { FIELDS } from "@/lib/constants";

export default function ResultsTable({ items }) {
  const router = useRouter();
  const qs = router.asPath.includes("?")
    ? `?${router.asPath.split("?")[1]}`
    : "";

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
                {/* Ära pane siia onClick(e.preventDefault) vms! */}
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
