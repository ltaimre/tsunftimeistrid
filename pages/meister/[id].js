import { fetchData } from "../../utils/fetchData";
import { getObjectImages } from "@/utils/fetchImagesUrl";
import { filterObject } from "@/lib/filterObject";
import { DETAIL_FIELDS } from "@/lib/constants";

export async function getServerSideProps({ params }) {
  const data = await fetchData();

  const meisterRaw = data.data.find((obj) => obj.ID === params.id);
  if (!meisterRaw) {
    return { notFound: true };
  }
  const meister = filterObject(meisterRaw, DETAIL_FIELDS);

  if (meister.elulugu) {
    meister.elulugu = formatText(meister.elulugu);
  }

  let images = [];
  try {
    images = await getObjectImages(1200656);
    console.log(images);
  } catch (err) {
    console.error("Piltide laadimine ebaõnnestus:", err);
  }

  return {
    props: { meister },
  };
}

// Vormindusfunktsioon – eemaldab reavahetused jms
function formatText(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/,\s*lk\s*/g, ", lk ")
    .replace(/\(\s*/g, "(")
    .replace(/\s*\)/g, ")")
    .trim();
}

export default function MeisterDetail({ meister }) {
  return (
    <div className="meister-detail">
      <h1>
        {meister.Eesnimi} {meister.Perekonnanimi}
      </h1>

      <table className="meister-table">
        <tbody>
          {Object.entries(meister).map(([key, value]) => (
            <tr key={key}>
              <td className="label">{key}</td>
              <td>
                {typeof value === "string" &&
                value.includes(",") &&
                key !== "elulugu" ? (
                  <ul>
                    {value.split(",").map((part, idx) => (
                      <li key={idx}>{part.trim()}</li>
                    ))}
                  </ul>
                ) : key === "elulugu" ? (
                  <p>{formatText(value)}</p>
                ) : (
                  value
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
