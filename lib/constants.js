export const FIELDS = {
  YEARS: {
    FROM: "aeg_algus",
    TO: "aeg_lopp",
    ONE_SOURCE: "allikas_mainimine",
    MASTER_YEAR: "meister_aasta",
  },
  NAME: {
    FIRST: "eesnimi",
    LAST: "perekonnanimi",
    ALT_FIRST: "eesnimi_alternatiiv",
    ALT_LAST: "perekonnanimi_alternatiiv",
  },
  BIO: "elulugu",
  WORKPLACE: "tegutsemiskoht",
  COUNTRY: "riik",
  TEACHERS: "opetaja",
  PROFESSION: "tsunft",
  RANK: "ametiaste",
  LINKS: "link",
  ID: "ID",
};

export const SEARCHABLE_FIELDS = [
  FIELDS.NAME.FIRST,
  FIELDS.NAME.LAST,
  FIELDS.NAME.FIRST + " " + FIELDS.NAME.LAST,
  FIELDS.NAME.ALT_FIRST,
  FIELDS.NAME.ALT_LAST,
  FIELDS.BIO,
  FIELDS.WORKPLACE,
  FIELDS.TEACHERS,
  FIELDS.PROFESSION,
  FIELDS.RANK,
];

export const MUIS_BASE_URL = "https://www.muis.ee/museaalview/";
export const RESULTS_PER_PAGE = 20;

export const DETAIL_FIELDS = [
  FIELDS.NAME.FIRST,
  FIELDS.NAME.LAST,
  FIELDS.NAME.ALT_FIRST,
  FIELDS.NAME.ALT_LAST,
  FIELDS.BIO,
  FIELDS.WORKPLACE,
  FIELDS.TEACHERS,
  FIELDS.PROFESSION,
  FIELDS.RANK,
  FIELDS.YEARS.FROM,
  FIELDS.YEARS.TO,
  FIELDS.YEARS.ONE_SOURCE,
  FIELDS.YEARS.MASTER_YEAR,
];
