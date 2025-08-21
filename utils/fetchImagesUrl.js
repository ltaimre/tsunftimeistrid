import { XMLParser } from "fast-xml-parser";

export async function getObjectImages(id) {
  const url = `https://opendata.muis.ee/media-list/${id}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Viga: ${response.status}`);

  const xmlText = await response.text();
  console.log(xmlText);

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const jsonObj = parser.parse(xmlText);

  // Siin oleme Bag -> li -> Description tasemel
  const bag = jsonObj["rdf:RDF"]["rdf:Bag"];
  if (!bag) return [];

  let items = bag["rdf:li"];
  if (!items) return [];

  // Kui ainult üks li, tee array
  items = Array.isArray(items) ? items : [items];

  const urls = [];

  for (const li of items) {
    const desc = li["rdf:Description"];
    if (!desc) continue;

    if (desc["@_rdf:about"]) {
      urls.push(desc["@_rdf:about"]);
    }
  }

  return urls;
}
