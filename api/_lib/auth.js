import crypto from "node:crypto";

const cookieName = "kv_admin_session";
const sessionTtlMs = 1000 * 60 * 60 * 12;

const base64url = (value) => Buffer.from(value).toString("base64url");

const sign = (payload) =>
  crypto.createHmac("sha256", process.env.SESSION_SECRET || "dev-session-secret").update(payload).digest("base64url");

const parseCookies = (req) =>
  String(req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const index = part.indexOf("=");
      if (index > -1) cookies[part.slice(0, index)] = decodeURIComponent(part.slice(index + 1));
      return cookies;
    }, {});

export const getJsonBody = async (req) => {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
};

export const createSession = (username) => {
  const payload = base64url(JSON.stringify({ sub: username, exp: Date.now() + sessionTtlMs }));
  return `${payload}.${sign(payload)}`;
};

export const verifySession = (req) => {
  const token = parseCookies(req)[cookieName];
  if (!token || !token.includes(".")) return null;

  const [payload, signature] = token.split(".");
  const expected = sign(payload);
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (!session.exp || Date.now() > session.exp) return null;
  return session;
};

export const requireAdmin = (req, res) => {
  const session = verifySession(req);
  if (!session) {
    res.status(401).json({ ok: false, message: "Please sign in again." });
    return null;
  }
  return session;
};

const shouldUseSecureCookie = (req) =>
  req.headers["x-forwarded-proto"] === "https" || process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

export const setSessionCookie = (req, res, token) => {
  const secure = shouldUseSecureCookie(req) ? " Secure;" : "";
  res.setHeader(
    "Set-Cookie",
    `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${sessionTtlMs / 1000}`
  );
};

export const clearSessionCookie = (req, res) => {
  const secure = shouldUseSecureCookie(req) ? " Secure;" : "";
  res.setHeader("Set-Cookie", `${cookieName}=; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=0`);
};
