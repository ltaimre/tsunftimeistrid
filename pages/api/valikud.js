// pages/api/valikud.js
import { fetchCityCountryMap } from "@/lib/sheets";

export default async function handler(req, res) {
  try {
    const { pairs, map } = await fetchCityCountryMap();
    res.status(200).json({ pairs, map });
  } catch (e) {
    console.error("API /valikud error:", e);
    res.status(500).json({ error: "Valikute lugemine ebaõnnestus" });
  }
}
