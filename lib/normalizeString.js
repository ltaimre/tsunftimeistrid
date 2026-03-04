export const normalizeString = (s) =>
  (s ?? "")
    .toLocaleLowerCase("et-EE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
