// lib/sheets.js
const Papa = require("papaparse");

function buildUrls({ sheetId, sheetName, range, gid }) {
  const urls = [];

  // 1) gviz CSV (eelistatud, kui sheetName/range on olemas)
  // https://docs.google.com/spreadsheets/d/{id}/gviz/tq?tqx=out:csv&sheet=Andmed&range=A:Z
  if (sheetName || range) {
    let u = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
    if (sheetName) u += `&sheet=${encodeURIComponent(sheetName)}`;
    if (range) u += `&range=${encodeURIComponent(range)}`;
    urls.push(u);
  } else {
    // kui nime/range'i pole, proovi kogu aktiivset lehte
    urls.push(
      `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`
    );
  }

  // 2) export?format=csv (hea fallback; toetab sheetName või gid)
  // https://docs.google.com/spreadsheets/d/{id}/export?format=csv&id={id}&gid={gid}
  if (gid) {
    urls.push(
      `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&id=${sheetId}&gid=${gid}`
    );
  } else if (sheetName) {
    // NB: export endpoint toetab sheet nime (alati mitte, aga proovida tasub)
    urls.push(
      `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=${encodeURIComponent(
        sheetName
      )}`
    );
  } else {
    // kui tõesti midagi muud pole, proovi export root
    urls.push(
      `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
    );
  }

  return urls;
}

async function fetchCsvWithFallback(urls) {
  let lastErr;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        lastErr = new Error(`HTTP ${res.status} @ ${url}`);
        continue;
      }
      const text = await res.text();
      // Väga tühjad vastused ära luba
      if (!text || !text.trim()) {
        lastErr = new Error(`Empty CSV @ ${url}`);
        continue;
      }
      return text;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("All CSV fetch attempts failed");
}

/**
 * Põhiandmed (Andmed-leht)
 */
export async function fetchData() {
  const sheetId = process.env.SHEET_ID;
  const sheetName = process.env.DATA_SHEET_NAME || ""; // nt "Andmed"
  const range = (process.env.DATA_RANGE || "").trim(); // nt "A:Z" või tühi
  const gid = process.env.DATA_SHEET_GID || ""; // kui tahad kindlat tab'i GID-iga

  if (!sheetId) {
    throw new Error("SHEET_ID puudub (.env.local)");
  }

  const urls = buildUrls({ sheetId, sheetName, range, gid });

  let csvText;
  try {
    csvText = await fetchCsvWithFallback(urls);
  } catch (e) {
    console.error("fetchData() failed. Tried URLs:\n" + urls.join("\n"));
    throw new Error(`Andmete laadimine ebaõnnestus: ${e.message}`);
  }

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => (typeof h === "string" ? h.trim() : h),
    transform: (v) => (typeof v === "string" ? v.trim() : v),
  });

  return parsed.data; // Array<object>
}

/**
 * Valikute leht: D (Linnad), E (Riigid) -> city→country
 */
export async function fetchCityCountryMap() {
  const sheetId = process.env.SHEET_ID;
  const sheetName = process.env.VALIKUD_SHEET_NAME || "Valikud";
  const range = process.env.VALIKUD_RANGE || "D:E";
  const gid = process.env.VALIKUD_SHEET_GID || ""; // valikuline

  if (!sheetId) {
    throw new Error("SHEET_ID puudub (.env.local)");
  }

  // eelistame kindlat range'i (D:E)
  const urls = buildUrls({ sheetId, sheetName, range, gid });

  let csv;
  try {
    csv = await fetchCsvWithFallback(urls);
  } catch (e) {
    console.error(
      "fetchCityCountryMap() failed. Tried URLs:\n" + urls.join("\n")
    );
    throw new Error(`Valikute lugemine ebaõnnestus: ${e.message}`);
  }

  const { data: rows } = Papa.parse(csv, {
    header: false,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (!rows || rows.length === 0) return { pairs: [], map: {} };

  const maybeHeader = rows[0] || [];
  const hasHeader =
    maybeHeader.length >= 2 &&
    String(maybeHeader[0]).toLowerCase().includes("linn") &&
    String(maybeHeader[1]).toLowerCase().includes("riik");

  const body = hasHeader ? rows.slice(1) : rows;

  const toOneWord = (s) => (s || "").toString().trim().split(/\s+/)[0];

  const pairs = [];
  const map = {};
  for (const row of body) {
    const rawCity = (row[0] ?? "").toString().trim();
    const rawCountry = (row[1] ?? "").toString().trim();
    if (!rawCity || !rawCountry) continue;
    const city = toOneWord(rawCity);
    const country = toOneWord(rawCountry);
    pairs.push({ city, country });
    map[city] = country;
  }

  return { pairs, map };
}
