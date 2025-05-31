const Papa = require("papaparse");

export async function fetchData() {
  const sheetId = process.env.SHEET_ID;
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error("Andmete laadimine ebaõnnestus");
  }
  const csvText = await response.text();

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
  });
  console.log(parsed);

  return parsed;
}
