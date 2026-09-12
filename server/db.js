import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const file = process.env.DB_FILE || "./data/emberhold.db";
const resolved = path.resolve(file);
fs.mkdirSync(path.dirname(resolved), { recursive: true });

export const db = new Database(resolved);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  last_activity TEXT,
  credits INTEGER NOT NULL DEFAULT 25,
  body INTEGER NOT NULL DEFAULT 0,
  mind INTEGER NOT NULL DEFAULT 0,
  tech INTEGER NOT NULL DEFAULT 0,
  cool INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('BODY','MIND','TECH','COOL')),
  difficulty TEXT NOT NULL CHECK(difficulty IN ('EASY','STANDARD','HARD')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  quest_id INTEGER,
  quest_name TEXT NOT NULL,
  category TEXT NOT NULL,
  xp INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory (
  user_id INTEGER NOT NULL,
  item_id TEXT NOT NULL,
  acquired_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, item_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS armory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('THEME','BADGE')),
  cost INTEGER NOT NULL
);
`);

const seed = db.prepare(`
  INSERT OR IGNORE INTO armory(id,name,description,kind,cost)
  VALUES(?,?,?,?,?)
`);
[
  ["emberhold","Emberhold","The original ember-and-gold colours of the hold.","THEME",0],
  ["ironhold","Ironhold","Cold steel for a disciplined ledger.","THEME",80],
  ["verdant","Verdant March","Green banners for a thriving campaign.","THEME",120],
  ["first_deed","First Deed","A mark of having entered the ledger.","BADGE",20],
  ["streak_7","Seven-Day Flame","A badge for keeping the hearth alive for a week.","BADGE",75],
  ["centurion","Centurion","A badge for earning 1000 total XP.","BADGE",150]
].forEach(x => seed.run(...x));

export function transaction(fn) {
  return db.transaction(fn)();
}
