export async function fetchRdfObject(id) {
  const url = `https://opendata.muis.ee/object/${id}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/rdf+xml", // või 'application/ld+json', kui saadaval
    },
  });
  if (!response.ok) {
    throw new Error(`Viga päringul: ${response.status} ${response.statusText}`);
  }
  const rdfText = await response.text();
  return rdfText; // Siin saad RDF XML teksti, millest saad edasi töödelda
}
