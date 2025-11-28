// pages/meister/[id].js
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { fetchRowById } from "@/utils/fetchRowById";
import { extractMuseaalId } from "@/utils/parseMuisUrl";
import { buildMuisLink } from "@/utils/buildMuisLink";
import { getObjectImages } from "@/utils/fetchImagesUrl";
import {
  isWikiUrl,
  extractWikiFilename,
  buildWikiCommonsLink,
  getWikiImageUrl,
} from "@/utils/parseWikiUrl";
import { filterObject } from "@/lib/filterObject";
import { labelFor } from "@/lib/labels";
import { DETAIL_FIELDS } from "@/lib/constants";

import MuisGallery from "@/components/MuisGallery";
import ExternalLinkCard from "@/components/ExternalLinkCard";

function parseRawLinks(raw) {
  if (!raw || typeof raw !== "string") return [];
  // Split only on whitespace and semicolons, NOT commas (commas can be part of filenames)
  const parts = raw
    .split(/[\s;]+/g)
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

function isMuisUrl(url) {
  try {
    const u = new URL(url);
    const h = u.hostname.replace(/^www\./, "");
    return h === "muis.ee";
  } catch {
    return false;
  }
}

function hostFrom(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

function guessCta(u) {
  const host = hostFrom(u);
  const h = host.toLowerCase();
  if (h.includes("ra.ee")) return "Ava Rahvusarhiivi lehel";
  if (h.includes("linnaarhiiv")) return "Ava Linnaarhiivi lehel";
  if (h.includes("digar")) return "Ava DIGAR-is";
  if (h.includes("ester")) return "Ava ESTER-is";
  return "Ava välisel lehel";
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
  const meisterRaw = await fetchRowById(params.id, {
    sheetId: process.env.SHEET_ID,
    gid: process.env.SHEET_GID,
    idCol: "A",
    idIsNumber: true,
  });
  if (!meisterRaw) return { notFound: true };

  const meister = filterObject(meisterRaw, DETAIL_FIELDS);
  if (meister.elulugu) meister.elulugu = formatText(meister.elulugu);

  const rawLink = meisterRaw.link || "";
  const links = parseRawLinks(rawLink);

  const muisLinks = links.filter(isMuisUrl);
  const wikiLinks = links.filter(isWikiUrl);
  const externalLinks = links.filter((l) => !isMuisUrl(l) && !isWikiUrl(l));

  // ⬅️ MUIS pildid
  const allMuisImages = [];

  for (const muisUrl of muisLinks) {
    const muisId = extractMuseaalId(muisUrl);
    if (!muisId) {
      console.warn("MUIS link, millelt ID-d ei saanud:", muisUrl);
      continue;
    }

    const muisPublicLink = buildMuisLink(muisId);

    try {
      const images = await getObjectImages(muisId);
      if (images && images.length > 0) {
        images.forEach((imgUrl) => {
          allMuisImages.push({
            url: imgUrl,
            muisLink: muisPublicLink,
            muisId: muisId,
            type: "muis",
          });
        });
      }
    } catch (err) {
      console.error(`MUIS piltide laadimine ebaõnnestus (${muisId}):`, err);
    }
  }

  // ⬅️ WikiMedia pildid
  const allWikiImages = [];

  for (const wikiUrl of wikiLinks) {
    const filename = extractWikiFilename(wikiUrl);
    if (!filename) {
      console.warn("Wiki link, millelt failinime ei saanud:", wikiUrl);
      continue;
    }

    const wikiCommonsLink = buildWikiCommonsLink(filename);

    try {
      const imageUrl = await getWikiImageUrl(filename, 1200);

      if (imageUrl) {
        allWikiImages.push({
          url: imageUrl,
          wikiLink: wikiCommonsLink,
          filename: filename,
          type: "wiki",
        });
      } else {
        console.warn(`Wiki pildi URL-i ei saadud: ${filename}`);
      }
    } catch (err) {
      console.error(`Wiki pildi laadimine ebaõnnestus (${filename}):`, err);
    }
  }

  // Kombineeri kõik pildid ühte massiivi
  const allImages = [...allMuisImages, ...allWikiImages];
  console.log("RAW LINK FROM SHEET:", meisterRaw.link);
  console.log("ALL LINKS PARSED:", links);

  return {
    props: {
      meister,
      allImages,
      externalLinks,
    },
  };
}

export default function MeisterDetail({ meister, allImages, externalLinks }) {
  const router = useRouter();
  const qs = new URLSearchParams(router.query || {}).toString();
  const backHref = `/search${qs ? `?${qs}` : ""}`;

  const fullName = [meister?.eesnimi, meister?.perekonnanimi]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="meister-detail">
      <Head>
        <title>
          {fullName
            ? `${fullName} – tsunftimeisrid`
            : "Meister – tsunftimeisrid"}
        </title>
        <meta name="og:title" content={fullName || "Meister"} />
      </Head>

      <div className="backbar">
        <Link
          href={backHref}
          className="back-button back-button--ghost"
          aria-label="Tagasi nimekirja"
        >
          <span className="icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </span>
          Tagasi nimekirja
        </Link>
      </div>

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

      {(allImages?.length > 0 || externalLinks?.length > 0) && (
        <>
          {/* Galerii (MUIS + WikiMedia) */}
          {allImages?.length > 0 && (
            <MuisGallery images={allImages} altPrefix={fullName || "Meister"} />
          )}

          {/* Välised lingid */}
          {externalLinks?.length > 0 && (
            <div className="meister-media-grid">
              {externalLinks.map((url, i) => (
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
        </>
      )}
    </div>
  );
}
