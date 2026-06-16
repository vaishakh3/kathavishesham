import crypto from "node:crypto";
import { requireAdmin } from "../_lib/auth.js";

const signCloudinaryParams = (params, secret) => {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto.createHash("sha1").update(`${payload}${secret}`).digest("hex");
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false, message: "Method not allowed." });
    return;
  }

  if (!requireAdmin(req, res)) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "katha-vishesham/admin";

  if (!cloudName || !apiKey || !apiSecret) {
    res.status(500).json({ ok: false, message: "Cloudinary is not configured on the server." });
    return;
  }

  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder, timestamp };
  const signature = signCloudinaryParams(params, apiSecret);

  res.status(200).json({
    ok: true,
    cloudName,
    apiKey,
    folder,
    timestamp,
    signature,
  });
}
