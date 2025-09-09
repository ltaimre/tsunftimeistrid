// pages/api/data.js
import { fetchData } from "@/lib/sheets";

export default async function handler(req, res) {
  try {
    const data = await fetchData();
    res.status(200).json({ data });
  } catch (e) {
    console.error("API /data error:", e);
    res.status(500).json({ error: "Andmete laadimine ebaõnnestus" });
  }
}
