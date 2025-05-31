export const FIELDS = {
  YEARS: {
    FROM: "Tegutsemis-aja algus",
    TO: "Tegutsemis-aja lõpp",
    ONE_SOURCE: "Allikas mainimise aasta (kui esineb ainult ühel korral)",
    MASTER_YEAR:
      "Meistriks saamise aasta (iseseisva meistrina tegutsemise algus Eestis)",
  },
  NAME: {
    FIRST: "Eesnimi",
    LAST: "Perekonnanimi",
    ALT_FIRST: "Alternatiivsed eesnimed",
    ALT_LAST: "Alternatiivsed perekonnanimed",
  },
  BIO: "Eluloolised andmed",
  WORKPLACE: "Töökoht, töökohad",
  TEACHERS: "Õpetaja, õpetajad (sellega tegeleb hiljem)",
  PROFESSION: "Amet-tsunft",
  RANK: "Ametiaste (viimane, kõrgeim)",
  LINKS: "lingid",
};

export const SEARCHABLE_FIELDS = [
  FIELDS.NAME.LAST,
  FIELDS.NAME.ALT_FIRST,
  FIELDS.NAME.ALT_LAST,
  FIELDS.BIO,
  FIELDS.WORKPLACE,
  FIELDS.TEACHERS,
  FIELDS.PROFESSION,
  FIELDS.RANK,
];
