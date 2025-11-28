/**
 * Tuvasta kas URL on Wikipedia/WikiMedia link
 */
export function isWikiUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return host.includes("wikipedia.org") || host.includes("wikimedia.org");
  } catch {
    return false;
  }
}

/**
 * Erista failinime WikiMedia URL-ist
 */
export function extractWikiFilename(url) {
  try {
    // Eemalda võimalikud query parameetrid ja fragment
    const cleanUrl = url.split("?")[0].split("#")[0];

    // Leia /wiki/File: osa
    const fileMatch = cleanUrl.match(/\/wiki\/File:(.+)$/);
    if (fileMatch) {
      // Decode URL encoding (%C3%BC -> ü)
      let filename = decodeURIComponent(fileMatch[1]);
      // WikiMedias on URL-is alakriipsud tühikute asemel, asenda need tagasi tühikuteks
      filename = filename.replace(/_/g, " ");
      console.log("Extracted filename:", filename); // Debug
      return filename;
    }

    console.warn("No filename match for:", url);
    return null;
  } catch (err) {
    console.error("Wiki URL parsing failed:", err);
    return null;
  }
}

/**
 * Ehita WikiMedia Commons link failinime järgi
 */
export function buildWikiCommonsLink(filename) {
  if (!filename) return null;
  // WikiMedias peab URL-is olema alakriipsud tühikute asemel
  const urlFilename = filename.replace(/ /g, "_");
  // Encode ainult teised erisümbolid, mitte alakriipse
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(
    urlFilename
  ).replace(/%20/g, "_")}`;
}

/**
 * Hangi WikiMedia pildi URL WikiMedia API kaudu
 */
export async function getWikiImageUrl(filename, width = 1200) {
  if (!filename) return null;

  try {
    const apiUrl = new URL("https://commons.wikimedia.org/w/api.php");
    apiUrl.searchParams.set("action", "query");
    apiUrl.searchParams.set("titles", `File:${filename}`);
    apiUrl.searchParams.set("prop", "imageinfo");
    apiUrl.searchParams.set("iiprop", "url");
    apiUrl.searchParams.set("iiurlwidth", width.toString());
    apiUrl.searchParams.set("format", "json");
    apiUrl.searchParams.set("origin", "*");

    console.log("WikiMedia API URL:", apiUrl.toString()); // Debug

    const response = await fetch(apiUrl.toString());
    const data = await response.json();

    console.log("WikiMedia API response:", JSON.stringify(data, null, 2)); // Debug

    if (!data.query || !data.query.pages) {
      console.error("WikiMedia API: no pages in response");
      return null;
    }

    const pages = Object.values(data.query.pages);
    const page = pages[0];

    if (page.missing) {
      console.error("WikiMedia API: file is missing:", filename);
      return null;
    }

    if (!page || !page.imageinfo || !page.imageinfo[0]) {
      console.error("WikiMedia API: no imageinfo for", filename);
      return null;
    }

    // Eelistame thumburl (skaleeritud), fallback url (originaal)
    const imageUrl = page.imageinfo[0].thumburl || page.imageinfo[0].url;
    console.log("Got image URL:", imageUrl); // Debug
    return imageUrl;
  } catch (err) {
    console.error("WikiMedia API error:", err);
    return null;
  }
}
