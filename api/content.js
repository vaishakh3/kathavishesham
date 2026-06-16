import { getContent } from "./_lib/sheets.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ ok: false, message: "Method not allowed." });
    return;
  }

  try {
    const content = await getContent();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}
