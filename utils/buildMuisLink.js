// utils/buildMuisLink.js
import { MUIS_BASE_URL } from "@/lib/constants";

export function buildMuisLink(id) {
  if (!id) return null;
  return `${MUIS_BASE_URL}${id}`;
}
