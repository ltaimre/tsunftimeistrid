// pages/meister/[id].js
import Link from "next/link";
import { useRouter } from "next/router";

import { fetchData } from "../../utils/fetchData";
import { extractMuseaalId } from "@/utils/parseMuisUrl";
import { buildMuisLink } from "@/utils/buildMuisLink";
import { getObjectImages } from "@/utils/fetchImagesUrl";
import { filterObject } from "@/lib/filterObject";
import { labelFor } from "@/lib/labels";
import { DETAIL_FIELDS } from "@/lib/constants";

import MuisImage from "@/components/MuisImage";
import ExternalLinkCard from "@/components/ExternalLinkCard";

/**
 * Normaliseeri toorlingid:
 * - lõika ; , ja whitespace'i järgi
 * - trimmi
 * - valideeri URL
 * - eemalda duplikaadid
 * @param {string} raw
 * @returns {string[]}
 */
function parseRawLinks(raw) {
  if (!raw || typeof raw !== "string") return [];
  const parts = raw
    .split(/[\s;,]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const valid = [];
  const seen = new Set();
  for (const p of parts) {
    try {
      const u = new URL(p);
      const key = u.href;
      if (!seen.has(key)) {
        seen.add(key);
        valid.push(u.href);
      }
    } catch {
      // ignore invalid
    }
  }
  return valid;
}

/** Kas URL on MUIS-ist */
function isMuisUrl(url) {
  try {
    const u = new URL(url);
    const h = u.hostname.replace(/^www\./, "");
    return h === "muis.ee";
  } catch {
    return false;
  }
}

/** Host kuvamiseks (ilma www.) */
function hostFrom(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

/** CTA tekst vastavalt hostile */
function guessCta(u) {
  const host = hostFrom(u);
  const h = host.toLowerCase();
  if (h.includes("ra.ee")) return "Ava Rahvusarhiivi lehel";
  if (h.includes("linnaarhiiv")) return "Ava Linnaarhiivi lehel";
  if (h.includes("digar")) return "Ava DIGAR-is";
  if (h.includes("ester")) return "Ava ESTER-is";
  return "Ava välisel lehel";
}

/** Vormindus – eemaldab liigsed reavahetused jms */
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

/**
 * Kui väärtus on string ja sisaldab tükeldajaid, kuvatakse loendina.
 * Lubame nii koma kui semikooloni.
 */
function renderValue(key, value) {
  if (key === "elulugu") {
    return <p>{formatText(value)}</p>;
  }
  if (typeof value === "string" && /[,;]+/.test(value)) {
    return (
      <ul>
        {value
          .split(/[,;]+/g)
          .map((part) => part.trim())
          .filter(Boolean)
          .map((part, i) => (
            <li key={i}>{part}</li>
          ))}
      </ul>
    );
  }
  return value;
}

export async function getServerSideProps({ params }) {
  const data = await fetchData();
  const meisterRaw = data?.data?.find?.(
    (obj) => String(obj.ID) === String(params.id)
  );
  if (!meisterRaw) return { notFound: true };

  const meister = filterObject(meisterRaw, DETAIL_FIELDS);
  if (meister.elulugu) meister.elulugu = formatText(meister.elulugu);

  // Toetame erinevaid välja-nimesid, igaks juhuks
  const rawLink =
    meisterRaw.link || meisterRaw.Rawlink || meisterRaw.rawLink || "";
  const links = parseRawLinks(rawLink);

  const muisLinks = links.filter(isMuisUrl);
  const externalLinks = links.filter((l) => !isMuisUrl(l));

  let muisImages = [];
  let muisPublicLink = null;

  if (muisLinks.length > 0) {
    const firstMuis = muisLinks[0];
    const muisId = extractMuseaalId(firstMuis);
    if (muisId) {
      muisPublicLink = buildMuisLink(muisId);
      try {
        muisImages = await getObjectImages(muisId);
      } catch (err) {
        console.error("MUIS piltide laadimine ebaõnnestus:", err);
      }
    } else {
      console.warn("MUIS link, millelt ID-d ei saanud:", firstMuis);
    }
  }

  return {
    props: {
      meister,
      muisImages,
      muisPublicLink,
      externalLinks,
    },
  };
}

export default function MeisterDetail({
  meister,
  muisImages,
  muisPublicLink,
  externalLinks,
}) {
  const router = useRouter();
  // Ehita "tagasi" href säilitades päringuparameetrid
  const qs = new URLSearchParams(router.query || {}).toString();
  const backHref = `/${qs ? `?${qs}` : ""}`;

  const fullName = [meister?.Eesnimi, meister?.Perekonnanimi]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="meister-detail">
      <p style={{ marginBottom: 12 }}>
        <Link href={backHref}>← Tagasi nimekirja</Link>
      </p>

      <h1>{fullName || "Meister"}</h1>

      <table className="meister-table">
        <tbody>
          {Object.entries(meister).map(([key, value]) => (
            <tr key={key}>
              <td className="label">{labelFor(key)}</td>
              <td>{renderValue(key, value)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {(muisImages?.length > 0 || externalLinks?.length > 0) && (
        <div className="meister-media-grid">
          {/* MUIS pildid */}
          {muisImages?.length > 0 &&
            muisImages.map((imgUrl, idx) => (
              <MuisImage
                key={`muis-${idx}`}
                src={imgUrl}
                alt={`${fullName || "Meister"} pilt ${idx + 1}`}
                aspectRatio="4/3"
                caption={`Allikas: muis.ee (${idx + 1})`}
                link={muisPublicLink}
                size="md"
              />
            ))}

          {/* Välised lingid */}
          {externalLinks?.length > 0 &&
            externalLinks.map((url, i) => (
              <ExternalLinkCard
                key={`ext-${i}`}
                title="Väline allikas"
                subtitle={hostFrom(url)}
                caption="Viide: välisallikas"
                link={url}
                ctaLabel={guessCta(url)}
                aspectRatio="4/3"
                size="md"
              />
            ))}
        </div>
      )}
    </div>
  );
}
