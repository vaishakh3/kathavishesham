import crypto from "node:crypto";
import { clearSessionCookie, createSession, getJsonBody, setSessionCookie, verifySession } from "../_lib/auth.js";

const secureCompare = (left, right) => {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    const session = verifySession(req);
    res.status(200).json({ ok: true, signedIn: Boolean(session), user: session?.sub || null });
    return;
  }

  if (req.method === "DELETE") {
    clearSessionCookie(req, res);
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET,POST,DELETE");
    res.status(405).json({ ok: false, message: "Method not allowed." });
    return;
  }

  const body = await getJsonBody(req);
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPassword || !process.env.SESSION_SECRET) {
    res.status(500).json({ ok: false, message: "Admin credentials are not configured on the server." });
    return;
  }

  if (!secureCompare(body.username, expectedUser) || !secureCompare(body.password, expectedPassword)) {
    res.status(401).json({ ok: false, message: "Incorrect username or password." });
    return;
  }

  const token = createSession(expectedUser);
  setSessionCookie(req, res, token);
  res.status(200).json({ ok: true, user: expectedUser });
}
