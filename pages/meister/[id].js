// pages/meister/[id].js
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
  } else {
    console.warn(
      "MUIS linki ei leitud või ID ei õnnestunud välja võtta:",
      rawLink
    );
  }

  return { props: { meister, images, link } };
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

export default function MeisterDetail({ meister, images, link }) {
  const router = useRouter();
  // võta detaili-URL-ist query-string ja kasuta seda tagasi avalehele minnes
  const query = router.asPath.split("?")[1] || "";
  const backHref = `/${query ? `?${query}` : ""}`;

  return (
    <div className="meister-detail">
      {/* Tagasi nimekirja – hoiab alles filtrid ja lehekülje */}
      <p style={{ marginBottom: 12 }}>
        <Link href={backHref}>← Tagasi nimekirja</Link>
      </p>

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

      {/* Pildid */}
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
              size="xs" // vali: xs/sm/md/lg
              center
            />
          ))}
        </div>
      )}
    </div>
  );
}
