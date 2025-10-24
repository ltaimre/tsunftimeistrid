// lib/labels.js
export const LABELS = {
  ID: "ID",
  aeg_lopp: "Tegustemisaeg (lõpp)",
  aeg_algus: "Tegutsemisaeg (algus)",
  allikas_mainimine: "Esmakordne mainimine",
  meister_aasta: "Meistriks saamise aasta",
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
