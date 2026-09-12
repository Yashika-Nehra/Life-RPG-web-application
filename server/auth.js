import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "./db.js";

const DAYS = Number(process.env.SESSION_DAYS || 7);

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function tokenHash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + DAYS * 86400000;
  db.prepare("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)")
    .run(tokenHash(token), userId, expires);
  return { token, expires };
}

export function getUserFromToken(token) {
  if (!token) return null;
  const row = db.prepare(`
    SELECT u.*
    FROM sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=? AND s.expires_at>?
  `).get(tokenHash(token), Date.now());
  return row || null;
}

export function destroySession(token) {
  if (token) db.prepare("DELETE FROM sessions WHERE token_hash=?").run(tokenHash(token));
}

export function setSessionCookie(res, token, expires) {
  const secure = process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie",
    `emberhold_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${Math.floor((expires-Date.now())/1000)}${secure ? "; Secure" : ""}`);
}

export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", "emberhold_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0");
}

export function requireUser(req, res, next) {
  const cookies = parseCookies(req.headers.cookie || "");
  const user = getUserFromToken(cookies.emberhold_session);
  if (!user) return res.status(401).json({ error: "You must enter the hold first." });
  req.user = user;
  req.sessionToken = cookies.emberhold_session;
  next();
}

export function parseCookies(header) {
  return Object.fromEntries(header.split(";").filter(Boolean).map(part => {
    const i = part.indexOf("=");
    return [part.slice(0,i).trim(), decodeURIComponent(part.slice(i+1).trim())];
  }));
}
