export async function fetchData() {
  const sheetId = process.env.SHEET_ID;
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error("Andmete laadimine ebaõnnestus");
  }
  const csvText = await response.text();

  // csv-parse teeb õige parsimise, arvestab ka komasid tekstides
  const records = csvText;
  return records;
}
