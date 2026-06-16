import { getJsonBody, requireAdmin } from "../_lib/auth.js";
import { createItem, deleteItem, getContent, updateItem } from "../_lib/sheets.js";
import { sanitizeCollection } from "../_lib/content-schema.js";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === "GET") {
      res.status(200).json(await getContent({ includeInactive: true }));
      return;
    }

    const body = await getJsonBody(req);
    const collection = sanitizeCollection(body.collection);

    if (req.method === "POST") {
      res.status(200).json({ ok: true, item: await createItem(collection, body.item || {}) });
      return;
    }

    if (req.method === "PUT") {
      res.status(200).json({ ok: true, item: await updateItem(collection, body.id, body.item || {}) });
      return;
    }

    if (req.method === "DELETE") {
      res.status(200).json({ ok: true, item: await deleteItem(collection, body.id) });
      return;
    }

    res.setHeader("Allow", "GET,POST,PUT,DELETE");
    res.status(405).json({ ok: false, message: "Method not allowed." });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}
