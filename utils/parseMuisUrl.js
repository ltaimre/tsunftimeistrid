// utils/parseMuisUrl.js
export function extractMuseaalId(url) {
  try {
    const u = new URL(url);
    if (
      u.hostname === "www.muis.ee" &&
      u.pathname.startsWith("/museaalview/")
    ) {
      // eemaldame prefiksi ja lõpu / kui see on olemas
      return u.pathname.replace("/museaalview/", "").replace(/\/$/, "");
    }
    return null;
  } catch {
    return null;
  }
}
