import Link from "next/link";
import { useRouter } from "next/router";
import { fetchData } from "../../utils/fetchData";
import { extractMuseaalId } from "@/utils/parseMuisUrl";
import { buildMuisLink } from "@/utils/buildMuisLink";
import { getObjectImages } from "@/utils/fetchImagesUrl";
import { filterObject } from "@/lib/filterObject";
import { DETAIL_FIELDS } from "@/lib/constants";
import MuisImage from "@/components/MuisImage";

export async function getServerSideProps({ params }) {
  const data = await fetchData();

  const meisterRaw = data.data.find((obj) => obj.ID === params.id);
  if (!meisterRaw) return { notFound: true };

  const meister = filterObject(meisterRaw, DETAIL_FIELDS);
  if (meister.elulugu) meister.elulugu = formatText(meister.elulugu);

  const rawLink = meisterRaw.link || null;
  const idFromLink = rawLink ? extractMuseaalId(rawLink) : null;
  const link = buildMuisLink(idFromLink);

  let images = [];
  if (idFromLink) {
    try {
      images = await getObjectImages(idFromLink);
    } catch (err) {
      console.error("Piltide laadimine ebaõnnestus:", err);
    }
  }

  return { props: { meister, images, link } };
}

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

export default function MeisterDetail({ meister, images, link }) {
  const router = useRouter();

  let backQuery = router.query;

  // fallback: kui tuldi otse/bookmarkiga
  if (
    typeof window !== "undefined" &&
    (!backQuery || Object.keys(backQuery).length === 1)
  ) {
    const raw = sessionStorage.getItem("searchState");
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved?.query) backQuery = saved.query;
    }
  }

  const backHref = { pathname: "/", query: { ...backQuery, id: undefined } };

  return (
    <div className="meister-detail">
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => router.back()}
        >{`← Tagasi`}</button>
        <Link href={backHref}>{`Tagasi otsingusse`}</Link>
      </div>

      <h1>
        {meister.Eesnimi} {meister.Perekonnanimi}
      </h1>

      {images?.length > 0 && (
        <div className="meister-images">
          {images.map((imgUrl, idx) => (
            <MuisImage
              key={idx}
              src={imgUrl}
              alt={`${meister.Eesnimi} ${meister.Perekonnanimi} pilt ${
                idx + 1
              }`}
              aspectRatio="4/3"
              caption={`Allikas: muis.ee (${idx + 1})`}
              link={link}
            />
          ))}
        </div>
      )}

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
                    {value.split(",").map((part, i) => (
                      <li key={i}>{part.trim()}</li>
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
