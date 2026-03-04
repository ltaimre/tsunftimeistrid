// lib/fetchRowById.js
import Papa from "papaparse";

/**
 * Too Google Sheetsist ainult 1 rida ID järgi.
 * @param {string|number} id            Otsitav ID (string või number)
 * @param {Object} opts
 * @param {string} opts.sheetId         Google Sheetsi dokumendi ID (vajadusel loe process.env.SHEET_ID)
 * @param {string} [opts.gid]           Lehe (tab) GID, kui pole esimest lehte
 * @param {string} [opts.idCol='A']     ID veeru tähis (A, B, C, ...)
 * @param {boolean} [opts.idIsNumber=false] Kas ID on numbriline (ilma jutumärkideta WHERE-is)
 * @returns {Promise<Object|null>}      Leitud rida objektina või null kui ei leitud
 */
export async function fetchRowById(
  id,
  { sheetId = process.env.SHEET_ID, gid, idCol = "A", idIsNumber = false } = {}
) {
  if (!sheetId) throw new Error("sheetId puudub");

  // Google Visualization Query
  // NB! Kui ID on string, siis ümbritseme üksikjutumärkidega ja ESCAPEME üksikud jutumärgid ('' – topelt)
  const safeIdValue = idIsNumber
    ? String(id)
    : `'${String(id).replace(/'/g, "''")}'`;
  const tq = `select * where ${idCol} = ${safeIdValue}`;

  const params = new URLSearchParams({
    tqx: "out:csv", // väljund CSV
    tq: tq,
    headers: "1", // esimesest reast saavad päised
  });
  if (gid) params.set("gid", gid);

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok)
    throw new Error(
      `Sheets päring ebaõnnestus: ${res.status} ${res.statusText}`
    );

  const csvText = await res.text();

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => (typeof v === "string" ? v.trim() : v),
  });

  // Kui rida ei leitud, on results tühjad
  const row =
    Array.isArray(parsed.data) && parsed.data.length ? parsed.data[0] : null;

  // Mõnedel juhtudel võib gviz tagastada ka päise ilma andmeteta → row on {}
  if (row && Object.values(row).every((v) => v === "" || v == null)) {
    return null;
  }

  return row;
}
