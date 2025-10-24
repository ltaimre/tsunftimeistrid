// lib/labels.js
export const LABELS = {
  ID: "ID",
  aeg_lopp: "Aeg (lõpp)",
  aeg_algus: "Aeg (algus)",
  allikas_mainimine: "Allika mainimine",
  meister_aasta: "Meistri aasta",
  eesnimi: "Eesnimi",
  perekonnanimi: "Perekonnanimi",
  eesnimi_alternatiiv: "Eesnimi (alternatiiv)",
  perekonnanimi_alternatiiv: "Perekonnanimi (alternatiiv)",
  elulugu: "Elulugu",
  tegutsemiskoht: "Tegutsemiskoht",
  riik: "Riik",
  opetaja: "Õpetaja",
  tsunft: "Tsunft",
  ametiaste: "Ametiaste",
  link: "Link",
};

export const labelFor = (key) => LABELS[key] ?? key;
