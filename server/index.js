import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { db, transaction } from "./db.js";

import {
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  clearSessionCookie,
  destroySession,
  requireUser,
} from "./auth.js";

import {
  DIFFICULTIES,
  ATTRIBUTES,
  rankFor,
  calculateProgress,
} from "./rpg.js";

const app = express();

const PORT = Number(process.env.PORT || 4000);

app.disable("x-powered-by");

app.use(express.json({ limit: "50kb" }));

function cleanName(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function publicUser(row) {
  const p = calculateProgress(row.xp);

  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    xp: row.xp,
    level: p.level,
    xpIntoLevel: p.xpIntoLevel,
    nextLevelXp: p.need,
    rank: rankFor(p.level),
    streak: row.streak,
    credits: row.credits,
    attributes: {
      BODY: row.body,
      MIND: row.mind,
      TECH: row.tech,
      COOL: row.cool,
    },
  };
}

function validateQuest(body) {
  const name = cleanName(body.name);
  const category = body.category;
  const difficulty = body.difficulty;

  if (!name || name.length > 80) {
    return {
      error: "Deed name must be 1–80 characters.",
    };
  }

  if (!ATTRIBUTES.includes(category)) {
    return {
      error: "Choose a valid attribute.",
    };
  }

  if (!DIFFICULTIES[difficulty]) {
    return {
      error: "Choose a valid difficulty.",
    };
  }

  return {
    name,
    category,
    difficulty,
  };
}

/* ---------------- HEALTH ---------------- */

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

/* ---------------- AUTH ---------------- */

app.post("/api/auth/signup", async (req, res) => {
  try {
    const displayName = cleanName(req.body.displayName);
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (displayName.length < 2 || displayName.length > 40) {
      return res
        .status(400)
        .json({ error: "Name must be 2–40 characters." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res
        .status(400)
        .json({ error: "Enter a valid email address." });
    }

    if (password.length < 8 || password.length > 100) {
      return res
        .status(400)
        .json({ error: "Password must be 8–100 characters." });
    }

    const exists = db
      .prepare("SELECT id FROM users WHERE email=?")
      .get(email);

    if (exists) {
      return res
        .status(409)
        .json({ error: "An account with that email already exists." });
    }

    const hash = await hashPassword(password);

    const result = db
      .prepare(
        "INSERT INTO users(email,password_hash,display_name) VALUES(?,?,?)"
      )
      .run(email, hash, displayName);

    db.prepare(
      "INSERT INTO inventory(user_id,item_id) VALUES(?,?)"
    ).run(result.lastInsertRowid, "emberhold");

    const user = db
      .prepare("SELECT * FROM users WHERE id=?")
      .get(result.lastInsertRowid);

    const session = createSession(user.id);

    setSessionCookie(res, session.token, session.expires);

    res.status(201).json({
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      error: "The hold could not create your account.",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const user = db
      .prepare("SELECT * FROM users WHERE email=?")
      .get(email);

    if (
      !user ||
      !(await verifyPassword(password, user.password_hash))
    ) {
      return res.status(401).json({
        error: "Email or password is incorrect.",
      });
    }

    const session = createSession(user.id);

    setSessionCookie(res, session.token, session.expires);

    res.json({
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      error: "The hold could not process your login.",
    });
  }
});

app.post("/api/auth/logout", requireUser, (req, res) => {
  destroySession(req.sessionToken);

  clearSessionCookie(res);

  res.status(204).end();
});

app.get("/api/me", requireUser, (req, res) => {
  const user = db
    .prepare("SELECT * FROM users WHERE id=?")
    .get(req.user.id);

  res.json({
    user: publicUser(user),
  });
});

/* ---------------- QUESTS ---------------- */

app.get("/api/quests", requireUser, (req, res) => {
  const quests = db
    .prepare(
      "SELECT * FROM quests WHERE user_id=? ORDER BY id DESC"
    )
    .all(req.user.id)
    .map((q) => ({
      id: q.id,
      name: q.name,
      category: q.category,
      difficulty: q.difficulty,
      xp: DIFFICULTIES[q.difficulty].xp,
      credits: DIFFICULTIES[q.difficulty].credits,
      createdAt: q.created_at,
    }));

  res.json({ quests });
});

app.post("/api/quests", requireUser, (req, res) => {
  const v = validateQuest(req.body);

  if (v.error) {
    return res.status(400).json({
      error: v.error,
    });
  }

  const r = db
    .prepare(
      "INSERT INTO quests(user_id,name,category,difficulty) VALUES(?,?,?,?)"
    )
    .run(
      req.user.id,
      v.name,
      v.category,
      v.difficulty
    );

  const q = db
    .prepare("SELECT * FROM quests WHERE id=?")
    .get(r.lastInsertRowid);

  res.status(201).json({
    quest: {
      ...q,
      xp: DIFFICULTIES[q.difficulty].xp,
      credits: DIFFICULTIES[q.difficulty].credits,
    },
  });
});

app.patch("/api/quests/:id", requireUser, (req, res) => {
  const id = Number(req.params.id);

  const v = validateQuest(req.body);

  if (v.error) {
    return res.status(400).json({
      error: v.error,
    });
  }

  const q = db
    .prepare(
      "SELECT * FROM quests WHERE id=? AND user_id=?"
    )
    .get(id, req.user.id);

  if (!q) {
    return res.status(404).json({
      error: "That deed is not in your ledger.",
    });
  }

  db.prepare(
    "UPDATE quests SET name=?,category=?,difficulty=? WHERE id=?"
  ).run(
    v.name,
    v.category,
    v.difficulty,
    id
  );

  const next = db
    .prepare("SELECT * FROM quests WHERE id=?")
    .get(id);

  res.json({
    quest: {
      ...next,
      xp: DIFFICULTIES[next.difficulty].xp,
      credits: DIFFICULTIES[next.difficulty].credits,
    },
  });
});

app.delete("/api/quests/:id", requireUser, (req, res) => {
  const result = db
    .prepare(
      "DELETE FROM quests WHERE id=? AND user_id=?"
    )
    .run(
      Number(req.params.id),
      req.user.id
    );

  if (!result.changes) {
    return res.status(404).json({
      error: "That deed is not in your ledger.",
    });
  }

  res.status(204).end();
});

app.post("/api/quests/:id/complete", requireUser, (req, res) => {
  const id = Number(req.params.id);

  const q = db
    .prepare(
      "SELECT * FROM quests WHERE id=? AND user_id=?"
    )
    .get(id, req.user.id);

  if (!q) {
    return res.status(404).json({
      error: "That deed is not in your ledger.",
    });
  }

  const reward = DIFFICULTIES[q.difficulty];

  const before = publicUser(req.user);

  const result = transaction(() => {
    const current = db
      .prepare("SELECT * FROM users WHERE id=?")
      .get(req.user.id);

    const today = new Date()
      .toISOString()
      .slice(0, 10);

    let streak = current.streak;

    if (current.last_activity !== today) {
      if (current.last_activity) {
        const last = new Date(
          current.last_activity + "T00:00:00"
        );

        const now = new Date(
          today + "T00:00:00"
        );

        const diff = Math.round(
          (now - last) / 86400000
        );

        streak =
          diff === 1
            ? current.streak + 1
            : 1;
      } else {
        streak = 1;
      }
    }

    const newXp = current.xp + reward.xp;

    const p = calculateProgress(newXp);

    const attrColumn = {
      BODY: "body",
      MIND: "mind",
      TECH: "tech",
      COOL: "cool",
    }[q.category];

    db.prepare(
      `UPDATE users
       SET xp=?,
           level=?,
           streak=?,
           last_activity=?,
           credits=?,
           ${attrColumn}=${attrColumn}+1
       WHERE id=?`
    ).run(
      newXp,
      p.level,
      streak,
      today,
      current.credits + reward.credits,
      current.id
    );

    db.prepare(
      `INSERT INTO completions
       (user_id,quest_id,quest_name,category,xp,credits)
       VALUES(?,?,?,?,?,?)`
    ).run(
      current.id,
      q.id,
      q.name,
      q.category,
      reward.xp,
      reward.credits
    );

    db.prepare(
      "DELETE FROM quests WHERE id=? AND user_id=?"
    ).run(
      q.id,
      current.id
    );

    return db
      .prepare("SELECT * FROM users WHERE id=?")
      .get(current.id);
  });

  const after = publicUser(result);

  const firstRank = before.rank !== after.rank;

  const levelUp = after.level > before.level;

  res.json({
    user: after,
    credits: reward.credits,
    xp: reward.xp,
    levelUp,
    rankUp: firstRank,
    attribute: q.category,
    questName: q.name,
  });
});

/* ---------------- HISTORY ---------------- */

app.get("/api/history", requireUser, (req, res) => {
  const entries = db
    .prepare(
      `
      SELECT
        id,
        quest_name AS questName,
        category,
        xp,
        credits,
        completed_at AS completedAt
      FROM completions
      WHERE user_id=?
      ORDER BY id DESC
      LIMIT 50
      `
    )
    .all(req.user.id);

  res.json({ entries });
});

/* ---------------- ARMOURY ---------------- */

app.get("/api/armory", requireUser, (req, res) => {
  const items = db
    .prepare(
      `
      SELECT
        a.*,
        CASE
          WHEN i.user_id IS NULL THEN 0
          ELSE 1
        END AS owned
      FROM armory a
      LEFT JOIN inventory i
        ON i.item_id=a.id
        AND i.user_id=?
      ORDER BY a.kind,a.cost,a.id
      `
    )
    .all(req.user.id)
    .map((x) => ({
      ...x,
      owned: Boolean(x.owned),
    }));

  res.json({ items });
});

app.post("/api/armory/:id/buy", requireUser, (req, res) => {
  const item = db
    .prepare("SELECT * FROM armory WHERE id=?")
    .get(req.params.id);

  if (!item) {
    return res.status(404).json({
      error: "That item is not in the armoury.",
    });
  }

  const alreadyOwned = db
    .prepare(
      "SELECT 1 FROM inventory WHERE user_id=? AND item_id=?"
    )
    .get(
      req.user.id,
      item.id
    );

  if (alreadyOwned) {
    return res.status(409).json({
      error: "You already own this item.",
    });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE id=?")
    .get(req.user.id);

  if (user.credits < item.cost) {
    return res.status(400).json({
      error: "Not enough crowns.",
    });
  }

  const updated = transaction(() => {
    db.prepare(
      "UPDATE users SET credits=credits-? WHERE id=?"
    ).run(
      item.cost,
      user.id
    );

    db.prepare(
      "INSERT INTO inventory(user_id,item_id) VALUES(?,?)"
    ).run(
      user.id,
      item.id
    );

    return db
      .prepare("SELECT * FROM users WHERE id=?")
      .get(user.id);
  });

  res.json({
    item,
    user: publicUser(updated),
  });
});

/* ---------------- FRONTEND ---------------- */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dist = path.join(__dirname, "..", "dist");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(dist));

  // Express 5 compatible catch-all route.
  // IMPORTANT: do not use app.get("*", ...) here.
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

/* ---------------- START SERVER ---------------- */

app.listen(PORT, () => {
  console.log(`EMBERHOLD API listening on port ${PORT}`);
});